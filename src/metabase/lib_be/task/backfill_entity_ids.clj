(ns metabase.lib-be.task.backfill-entity-ids
  (:require
   [clojurewerkz.quartzite.conversion :as conversion]
   [clojurewerkz.quartzite.jobs :as jobs]
   [clojurewerkz.quartzite.schedule.simple :as simple]
   [clojurewerkz.quartzite.triggers :as triggers]
   [metabase.models.serialization :as serdes]
   [metabase.models.setting :refer [defsetting]]
   [metabase.task :as task]
   [metabase.util.i18n :refer [deferred-tru]]
   [metabase.util.log :as log]
   [toucan2.core :as t2]))

(set! *warn-on-reflection* true)

(def ^:dynamic *drain-batch-size*
  "The number of records the drain entity ids job will process at once"
  60)
(def ^:dynamic *backfill-batch-size*
  "The number of records the backfill entity ids job will process at once.  Defaults to slightly smaller than
  *drain-batch-size* so that if the user adds a few entities to the cache, the entire thing will still drain in one
  batch."
  50)
(def ^:dynamic *max-retries*
  "The number of times we will retry hashing in an attempt to find a unique hash"
  1000)
(def ^:dynamic *retry-batch-size*
  "The number of entity ids we will try per iteration of retries"
  50)
(def ^:private min-repeat-ms
  "The minimum acceptable repeat rate for the backfill entity ids job"
  1000)
(defsetting backfill-entity-ids-repeat-ms
  (deferred-tru "Frequency for running backfill entity ids and drain entity ids jobs in ms.  Minimum value is 1000, and any value at or below 0 will disable the job entirely.")
  :type       :integer
  :visibility :internal
  :audit      :never
  :export?    true
  :default    3000)

(defn- get-rows-to-drain!
  "Fetches the next *drain-batch-size* rows from serdes/entity-id-cache"
  []
  (->> (for [[model-key inner] @serdes/entity-id-cache
             [id entity-id] inner]
         [model-key id @entity-id])
       (take *drain-batch-size*)))

(defn- backfill-entity-ids!-inner
  "Given a model, gets a batch of objects from the db and adds entity-ids.  Returns whether there is more rows to backfill."
  [model]
  (try
    (if (empty? (get-rows-to-drain!))
      (let [new-rows (t2/select model :entity_id nil {:limit *backfill-batch-size*})]
        (log/info "Backfill: Added " (count new-rows) " rows of " model " to the entity-id cache")
        (seq new-rows))
      true)
    (catch Exception e
      (log/error (str "Backfill: Exception fetching entity-ids for " model))
      (log/error e))))

(defn- drain-entity-ids!
  "Fetches *drain-batch-size* rows from serdes/entity-id-cache, writes those entity-ids into the db, and then removes
  those rows from the cache."
  []
  (t2/with-transaction [^java.sql.Connection conn]
    (let [vals (->> (for [[model-key inner] @serdes/entity-id-cache
                          [id entity-id] inner]
                      [model-key id @entity-id])
                    (take *drain-batch-size*))
          failures (->> (for [[model id entity-id] vals]
                          (let [savepoint (.setSavepoint conn)]
                            (try
                              ;; Need to bind *skip-entity-id-calc* to true or else update! will call select, see that
                              ;; we already have the entity-id in question (because we just added it in after-select),
                              ;; and refuse to do anything
                              (binding [serdes/*skip-entity-id-calc* true]
                                (t2/update! model id {:entity_id entity-id}))
                              nil
                              (catch Exception e
                                (.rollback conn savepoint)
                                (log/error (str "Drain: Exception updating entity-id for " model " with id " id))
                                (log/error e)
                                [model id]))))
                        (filter some?)
                        set)]
      (when (seq vals)
        (swap! serdes/entity-id-cache
               (fn [cache]
                 (reduce (fn [c [model-key id]]
                           (if (contains? failures [model-key id])
                             c
                             (update c model-key #(dissoc % id))))
                         cache
                         vals)))
        (log/info "Drain: Updated entity ids for " (count vals) " rows")))))

(def ^:private backfill-job-key "metabase.lib-be.task.backfill-entity-ids.job")
(def ^:private backfill-database-trigger-key "metabase.lib-be.task.backfill-entity-ids.trigger.database")
(def ^:private backfill-table-trigger-key "metabase.lib-be.task.backfill-entity-ids.trigger.table")
(def ^:private backfill-field-trigger-key "metabase.lib-be.task.backfill-entity-ids.trigger.field")
(def ^:private drain-job-key "metabase.lib-be.task.drain-entity-ids.job")
(def ^:private drain-trigger-key "metabase.lib-be.task.drain-entity-ids.trigger")

(def ^:private model-key
  {:model/Database backfill-database-trigger-key
   :model/Table backfill-table-trigger-key
   :model/Field backfill-field-trigger-key})

(def ^:private next-model
  {:model/Database :model/Table
   :model/Table :model/Field})

(def ^:private initial-model :model/Database)

(comment
  ;; Deletes all entity ids for when you want to test the backfill job
  (doseq [model (set (flatten (seq next-model)))]
    (binding [serdes/*skip-entity-id-calc* true]
      (t2/update! model {} {:entity_id nil}))))

(defn- backfill-job-running?
  "Checks if a backfill entity ids job is currently running"
  []
  (task/job-exists? backfill-job-key))

(declare start-job!)

(defn- backfill-entity-ids!
  "Implementation for the backfill entity ids job"
  [ctx]
  (let [ctx-map (conversion/from-job-data ctx)
        model (get ctx-map "model")]
    (when-not (backfill-entity-ids!-inner model)
      (log/info "Backfill: Finished backfilling entity-ids for" model)
      (task/delete-trigger! (triggers/key (model-key model)))
      (when-let [new-model (next-model model)]
        (start-job! new-model)))))

(jobs/defjob  ^{:doc "Selects batches of dbs/tables/fields to add them to the cache and backfill queue."}
  BackfillEntityIds [ctx]
  (backfill-entity-ids! ctx))

(jobs/defjob ^{:doc "Drains the entity-id cache and updates the db with the new entity ids"}
  DrainEntityIds [_ctx]
  (drain-entity-ids!))

(defn- get-repeat-ms
  "Gets the desired repeat ms for the backfill and drain jobs.  Nil means those jobs are disabled."
  []
  (let [repeat-ms (backfill-entity-ids-repeat-ms)]
    (cond
      (<= repeat-ms 0) nil
      (< repeat-ms min-repeat-ms) (do (log/warnf "backfill-entity-ids-repeat-ms of %dms is too low, using %dms"
                                                 repeat-ms
                                                 min-repeat-ms)
                                      min-repeat-ms)
      :else repeat-ms)))

(defn- start-drain-job!
  "Starts a drain entity ids job"
  []
  (let [repeat-ms (get-repeat-ms)]
    (cond
      (nil? repeat-ms) (log/info (str "Not starting backfill-entity-ids drain task because backfill-entity-ids-repeat-ms is " (backfill-entity-ids-repeat-ms)))

      :else (do (log/info "Drain: Starting to drain entity-ids")
                (let [job (jobs/build
                           (jobs/of-type DrainEntityIds)
                           (jobs/with-identity (jobs/key drain-job-key)))
                      trigger (triggers/build
                               (triggers/with-identity (triggers/key drain-trigger-key))
                               (triggers/start-now)
                               (triggers/with-schedule
                                (simple/schedule
                                 (simple/with-interval-in-milliseconds repeat-ms)
                                 (simple/repeat-forever))))]
                  (task/schedule-task! job trigger))))))

(defn- start-backfill-job!
  "Starts a backfill entity ids job for model"
  [model]
  (let [repeat-ms (get-repeat-ms)]
    (cond
      (backfill-job-running?) (log/info "Not starting backfill-entity-ids backfill task because it is already running")
      (nil? repeat-ms) (log/info (str "Not starting backfill-entity-ids backfill task because backfill-entity-ids-repeat-ms is " (backfill-entity-ids-repeat-ms)))

      :else (do (log/info "Backfill: Starting to backfill entity-ids for" model)
                (let [job (jobs/build
                           (jobs/of-type BackfillEntityIds)
                           (jobs/using-job-data {"model" model})
                           (jobs/with-identity (jobs/key backfill-job-key)))
                      trigger (triggers/build
                               (triggers/with-identity (triggers/key (model-key model)))
                               (triggers/start-now)
                               (triggers/with-schedule
                                (simple/schedule
                                 (simple/with-interval-in-milliseconds repeat-ms)
                                 (simple/repeat-forever))))]
                  (task/schedule-task! job trigger))))))

(defmethod task/init! ::BackfillEntityIds [_]
  (start-backfill-job! initial-model))

(defmethod task/init! ::DrainEntityIds [_]
  (start-drain-job!))
