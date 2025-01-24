(ns metabase-enterprise.gsheets
  "/api/gsheets endpoints"
  (:require
   [clojure.string :as str]
   [java-time.api :as t]
   [medley.core :as m]
   [metabase-enterprise.harbormaster.client :as hm.client]
   [metabase.analytics.snowplow :as snowplow]
   [metabase.api.auth :as api.auth]
   [metabase.api.common :as api]
   [metabase.api.macros :as api.macros]
   [metabase.models.setting :as setting :refer [defsetting]]
   [metabase.util :as u]
   [metabase.util.date-2 :as u.date]
   [metabase.util.i18n :refer [deferred-tru]]
   [metabase.util.log :as log]
   [metabase.util.malli :as mu]
   [metabase.util.malli.registry :as mr]
   [metabase.util.malli.schema :as ms]
   [toucan2.core :as t2]))

(def ^:private not-connected {:status "not-connected"})

(defsetting gsheets
  #_"
  This value can have 3 states:

  1) The Google Sheets Folder is not setup.
  {:status \"not-connected\"}

  2) We have uploaded a Folder URL to HM, but have not synced it in MB yet.
  {:status \"loading\"
   :folder_url \"https://drive.google.com/drive/abc\"}

  2)  Google Sheets Integration is enabled, and users can view their google sheets tables.
  {:status \"complete\"
   :folder_url \"https://drive.google.com/drive/abc\"}
  "
  (deferred-tru "Information about Google Sheets Integration")
  :encryption :when-encryption-key-set
  :export? true
  :visibility :public
  :type :json
  :getter (fn [] (or (setting/get-value-of-type :json :gsheets)
                     (u/prog1 not-connected
                       (setting/set-value-of-type! :json :gsheets <>)))))

(mr/def ::gsheets [:map
                   [:status                      [:enum "not-connected" "loading" "complete"]]
                   [:folder_url {:optional true} ms/NonBlankString]])

(defn- ->config
  "This config is needed to call [[hm.client/make-request]].

   `->config` either gets the store-api-url and api-key from settings or throws an exception when one or both are
   unset or blank."
  []
  (let [store-api-url (setting/get-value-of-type :string :store-api-url)
        _ (when (str/blank? store-api-url)
            (log/error "Missing store-api-url. Cannot create hm client config.")
            (throw (ex-info "Missing store-api-url." {:store-api-url store-api-url})))
        api-key (setting/get-value-of-type :string :api-key)
        _ (when (str/blank? api-key)
            (log/error "Missing api-key. Cannot create hm client config.")
            (throw (ex-info "Missing api-key." {:api-key api-key})))]
    {:store-api-url store-api-url
     :api-key api-key}))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; MB <-> HM APIs
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(mu/defn- maybe-service-account-email :- [:or [:= false] :string]
  "Checks to see if Google service-account is setup in harbormaster."
  []
  (let [[_status {:keys [body] :as response}] (hm.client/make-request (->config) :get "/api/v2/mb/connections-google/service-account")]
    (if-let [email (:email body)]
      email
      (throw (ex-info "Error checking service-account status." {:status-code (:status-code response)})))))

(mr/def ::gdrive-conn [:map {:description "The Harbormaster Gdrive Connection"}
                       [:id :string]
                       [:type [:= "gdrive"]]
                       [:status [:enum "initializing" "syncing" "active" "error"]]
                       [:last-sync-at [:maybe :time/zoned-date-time]]
                       [:last-sync-started-at [:maybe :time/zoned-date-time]]
                       [:created-at :time/zoned-date-time]
                       [:updated-at :time/zoned-date-time]
                       ;; unclear if `hosted-instance-resource-id` or `hosted-instance-id` are relevant
                       [:hosted-instance-resource-id :int]
                       [:hosted-instance-id :string]])

(defn- is-gdrive?
  "Is this connection a gdrive connection?"
  [{:keys [type] :as _conn}] (= "gdrive" type))

(mu/defn- get-gdrive-conns :- [:sequential ::gdrive-conn]
  "Get the harbormaster gdrive type connection. This is used to verify the status of the folder sync.

  We should expect 0 or 1 gdrive accounts at this time."
  []
  (let [[status {:keys [body]
                 :as _response}] (hm.client/make-request (->config) :get "/api/v2/mb/connections")]
    (if (= status :ok)
      (some->> (filter is-gdrive? body)
               (map (fn [gdc] (-> gdc
                                  (m/update-existing :last-sync-at u.date/parse)
                                  (m/update-existing :last-sync-started-at u.date/parse)
                                  (m/update-existing :created-at u.date/parse)
                                  (m/update-existing :updated-at u.date/parse))))
               ;; the first one is the most recent
               (sort-by :created-at #(t/after? (t/instant %1) (t/instant %2))))
      [])))

(mu/defn- get-gdrive-conn :- [:maybe ::gdrive-conn]
  "Get the harbormaster gdrive type connection. This is used to verify the status of the folder sync."
  []
  (first (get-gdrive-conns)))

(mu/defn- create-gdrive-conn :- [:tuple [:enum :ok :error] :map]
  "Creating a gdrive connection on HM starts the sync w/ drive folder."
  [drive-folder-url]
  (hm.client/make-request (->config) :post "/api/v2/mb/connections" {:type "gdrive" :secret {:resources [drive-folder-url]}}))

(mu/defn- delete-conn :- [:tuple [:enum :ok :error] :map]
  "Delete (presumably a gdrive) connection on HM."
  [conn-id :- :int]
  (hm.client/make-request (->config) :delete (str "/api/v2/mb/connections/" conn-id)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; FE <-> MB APIs
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(api.macros/defendpoint :get "/service-account" :- [:map [:email [:maybe :string]]]
  "Checks to see if service-account is setup or not, delegates to HM only if we haven't set it from a metabase cluster
  before."
  []
  (api/check-superuser)
  (when-not (api.auth/show-google-sheets-integration)
    (throw (ex-info "Google Sheets integration is not enabled." {:status-code 402})))
  {:email (maybe-service-account-email)})

(api.macros/defendpoint :post "/folder" :- ::gsheets
  "Hook up a new google drive folder that will be watched and have its content ETL'd into Metabase."
  [{} {} {:keys [url]} :- [:map [:url ms/NonBlankString]]]
  (api/check-superuser)
  (let [[status _resp] (create-gdrive-conn url)]
    (if (= status :ok)
      (u/prog1 {:status "loading" :folder_url url} (gsheets! <>))
      (throw (ex-info (str/join ["Unable to setup drive folder sync.\n"
                                 "Please check that the folder is shared with the proper service account email "
                                 "and sharing permissions."])
                      {:status-code 503})))))

(defn- sync-complete? [{:keys [status last-dwh-sync last-gdrive-conn-sync]}]
  (and (= status "active") ;; HM says the connection is active
       last-dwh-sync ;; make sure it's not nil
       last-gdrive-conn-sync ;; make sure it's not nil
       ;; We finished a sync of the dwh from metabase After the HM conn was synced:
       (t/after? (t/instant last-dwh-sync) (t/instant last-gdrive-conn-sync))))

(defn- handle-get-folder [attached-dwh]
  (if-let [{:keys [status]
            last-gdrive-conn-sync :last-sync-at
            :as gdrive-conn} (get-gdrive-conn)]
    (let [last-dwh-sync (t2/select-one-fn :ended_at :model/TaskHistory
                                          :db_id (:id (t2/select-one :model/Database :is_attached_dwh true))
                                          :task "sync"
                                          :status :success
                                          {:order-by [[:ended_at :desc]]})]
      (-> (cond
            (= "error" status)
            (do
              (gsheets! not-connected)
              (throw (ex-info "Problem syncing google drive folder." {})))

            (sync-complete? {:status status
                             :last-dwh-sync last-dwh-sync
                             :last-gdrive-conn-sync last-gdrive-conn-sync})
            (u/prog1 (assoc (gsheets) :status "complete")
              (gsheets! <>)
              (snowplow/track-event! ::snowplow/simple_event
                                     {:event "sheets_connected" :event_detail "success"}))
            :else
            (gsheets))
          (assoc :db_id (:id attached-dwh)
                 :hm/conn gdrive-conn
                 :mb/sync-info {:status status
                                :last-dwh-sync last-dwh-sync
                                :last-gdrive-conn-sync last-gdrive-conn-sync}
                 :mb/sync-status (sync-complete? {:status status
                                                  :last-dwh-sync last-dwh-sync
                                                  :last-gdrive-conn-sync last-gdrive-conn-sync}))))
    (do
      (gsheets! not-connected)
      (snowplow/track-event! ::snowplow/simple_event
                             {:event "sheets_connected"
                              :event_detail "fail - no drive connection"})
      (throw (ex-info "Google Drive Connection not found." {})))))

(api.macros/defendpoint :get "/folder" :- ::gsheets
  "Check the status of a newly created gsheets folder creation. This endpoint gets polled by FE to determine when to
  stop showing the setup widget.

  Returns the gsheets shape, with the attached datawarehouse db id at `:db_id`."
  [] :- ::gsheets
  (api/check-superuser)
  (let [attached-dwh (t2/select-one :model/Database :is_attached_dwh true)]
    (when-not (some? attached-dwh)
      (snowplow/track-event! ::snowplow/simple_event {:event "sheets_connected" :event_detail "fail - no dwh"})
      (throw (ex-info "No attached dwh found." {})))
    (handle-get-folder attached-dwh)))

(api.macros/defendpoint :delete "/folder"
  "Disconnect the google service account. There is only one (or zero) at the time of writing."
  []
  (api/check-superuser)
  (let [conn-ids (map :id (get-gdrive-conns))]
    (if (seq conn-ids)
      (let [status+conn-id+resps (for [conn-id conn-ids]
                                   (let [[status resp] (delete-conn conn-id)]
                                     [conn-id status resp]))]
        (if (every? #{:ok} (map second status+conn-id+resps))
          (u/prog1 not-connected
            (gsheets! <>)
            (snowplow/track-event! ::snowplow/simple_event {:event "sheets_disconnected"}))
          (throw (ex-info "Unable to disconnect google service account" {:status-code 503
                                                                         :status-info status+conn-id+resps}))))
      (u/prog1 not-connected
        (gsheets! <>)
        (throw (ex-info "Unable to find google drive connection." {}))))))

(api/define-routes)

(comment

  ;; trigger gdrive scan resync on HM
  (hm.client/make-request (->config) :put (format "/api/v2/mb/connections/%s/sync" (:id (get-gdrive-conn))))

  (t2/select-one-fn :ended_at :model/TaskHistory
                    :db_id (:id (t2/select-one :model/Database :is_attached_dwh true))
                    :task "sync"
                    :status :success
                    {:order-by [[:ended_at :desc]]})

  (require '[metabase.sync.sync-metadata :as sync-metadata])

  ;; This is what the notify endpoint calls:
  (sync-metadata/sync-db-metadata!
   (t2/select-one :model/Database :is_attached_dwh true))


  ;; testing auto-cruft:
  (do
    (t2/update! :model/Database 1 {:settings {:auto-cruft-tables []}})
    (sync-metadata/sync-db-metadata!
     (t2/select-one :model/Database :id 1))
    )

  (defn reset-all! []
    (let [statuses (for [{:keys [id]} (get-gdrive-conns)]
                     ;; (println "deleting" id)
                     (first (hm.client/make-request (->config) :delete (str "/api/v2/mb/connections/" id))))]
      statuses)

    (gsheets! not-connected)

    ;; verify reset:
    [(:body (second (hm.client/make-request (->config) :get "/api/v2/mb/connections")))
     (gsheets)]))
