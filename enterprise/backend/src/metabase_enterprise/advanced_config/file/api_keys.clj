(ns metabase-enterprise.advanced-config.file.api-keys
  "Support for initializing API keys from a `config.yml` file."
  (:require
   [clojure.spec.alpha :as s]
   [metabase-enterprise.advanced-config.file.interface :as advanced-config.file.i]
   [metabase.models.api-key :as api-key]
   [metabase.models.user :as user]
   [metabase.permissions.core :as perms]
   [metabase.util :as u]
   [metabase.util.log :as log]
   [metabase.util.secret :as u.secret]
   [toucan2.core :as t2]))

(s/def :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/name
  string?)

(s/def :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/key
  string?)

(s/def :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/creator
  string?)

(s/def :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/group
  #{"admin" "all-users"})

(s/def :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/description
  (s/nilable string?))

(s/def ::config-file-spec
  (s/keys :req-un [:metabase-enterprise.advanced-config.file.api-keys.config-file-spec/name
                   :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/key
                   :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/creator
                   :metabase-enterprise.advanced-config.file.api-keys.config-file-spec/group]
          :opt-un [:metabase-enterprise.advanced-config.file.api-keys.config-file-spec/description]))

(defmethod advanced-config.file.i/section-spec :api-keys
  [_section]
  (s/spec (s/* ::config-file-spec)))

(defn- select-api-key
  [name]
  (t2/select-one :model/ApiKey :name name))

(defn- get-admin-user-by-email
  "Find an admin user by email. Throws an exception if the user doesn't exist or isn't an admin."
  [email]
  (let [user (t2/select-one :model/User :email email)]
    (when-not user
      (throw (ex-info (format "User with email %s not found" email)
                      {:email email})))
    (when-not (:is_superuser user)
      (throw (ex-info (format "User with email %s is not an admin" email)
                      {:email email})))
    user))

(defn- init-from-config-file!
  [api-key-config]
  (let [{:keys [name key group creator description]} api-key-config
        group-id (case group
                   "admin" (u/the-id (perms/admin-group))
                   "all-users" (u/the-id (perms/all-users-group)))
        unhashed-key (u.secret/secret key)
        creator (get-admin-user-by-email creator)]

    (if-let [existing-api-key (select-api-key name)]
      (do
        (log/info (u/format-color :blue "API key with name %s already exists, skipping" (pr-str name)))
        existing-api-key)
      (do
        (log/info (u/format-color :green "Creating new API key %s" (pr-str name)))
        ;; Create a user for the API key
        (let [email (format "api-key-user-%s@api-key.invalid" (random-uuid))
              user (first
                    (t2/insert-returning-instances! :model/User
                                                    {:email      email
                                                     :first_name name
                                                     :last_name  ""
                                                     :type       :api-key
                                                     :password   (str (random-uuid))}))]
          ;; Set permissions groups for the user
          (user/set-permissions-groups! user [(perms/all-users-group) {:id group-id}])
          ;; Create the API key
          (t2/insert-returning-instance! :model/ApiKey
                                         {:user_id      (u/the-id user)
                                          :name         name
                                          :unhashed_key unhashed-key
                                          :creator_id   (u/the-id creator)
                                          :updated_by_id (u/the-id creator)
                                          :description  description}))))))

(defmethod advanced-config.file.i/initialize-section! :api-keys
  [_section-name api-keys]
  (doseq [api-key api-keys]
    (init-from-config-file! api-key)))
