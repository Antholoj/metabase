(ns metabase.models.card-test
  (:require
   [clojure.data :as data]
   [clojure.string :as str]
   [clojure.test :refer :all]
   [java-time.api :as t]
   [metabase.audit :as audit]
   [metabase.config :as config]
   [metabase.lib.convert :as lib.convert]
   [metabase.lib.core :as lib]
   [metabase.lib.metadata :as lib.metadata]
   [metabase.lib.metadata.jvm :as lib.metadata.jvm]
   [metabase.lib.test-metadata :as meta]
   [metabase.models.card :as card]
   [metabase.models.interface :as mi]
   [metabase.models.parameter-card :as parameter-card]
   [metabase.models.serialization :as serdes]
   [metabase.query-processor.card-test :as qp.card-test]
   [metabase.query-processor.preprocess :as qp.preprocess]
   [metabase.test :as mt]
   [metabase.test.util :as tu]
   [metabase.util :as u]
   [metabase.util.json :as json]
   [toucan2.core :as t2]))

(set! *warn-on-reflection* true)

(deftest dashboard-count-test
  (testing "Check that the :dashboard_count delay returns the correct count of Dashboards a Card is in"
    (mt/with-temp [:model/Card      {card-id :id} {}
                   :model/Dashboard dash-1        {}
                   :model/Dashboard dash-2        {}]
      (letfn [(add-card-to-dash! [dash]
                (t2/insert! :model/DashboardCard
                            {:card_id      card-id
                             :dashboard_id (u/the-id dash)
                             :row          0
                             :col          0
                             :size_x       4
                             :size_y       4}))
              (get-dashboard-count []
                (-> (t2/select-one :model/Card :id card-id)
                    (t2/hydrate :dashboard_count)
                    :dashboard_count))]
        (is (= 0
               (get-dashboard-count)))
        (testing "add to a Dashboard"
          (add-card-to-dash! dash-1)
          (is (= 1
                 (get-dashboard-count))))
        (testing "add to a second Dashboard"
          (add-card-to-dash! dash-2)
          (is (= 2
                 (get-dashboard-count))))))))

(deftest dropdown-widget-values-usage-count-test
  (let [hydrated-count (fn [card] (-> card
                                      (t2/hydrate :parameter_usage_count)
                                      :parameter_usage_count))
        default-params {:name       "Category Name"
                        :slug       "category_name"
                        :id         "_CATEGORY_NAME_"
                        :type       "category"}
        card-params    (fn [card-id] (merge default-params {:values_source_type "card"
                                                            :values_source_config {:card_id card-id}}))]
    (testing "With no associated cards"
      (mt/with-temp [:model/Card card]
        (is (zero? (hydrated-count card)))))
    (testing "With one"
      (mt/with-temp [:model/Card      {card-id :id :as card} {}
                     :model/Dashboard _                      {:parameters [(card-params card-id)]}]
        (is (= 1 (hydrated-count card)))))
    (testing "With several"
      (mt/with-temp [:model/Card      {card-id :id :as card} {}
                     :model/Dashboard _                      {:parameters [(card-params card-id)]}
                     :model/Dashboard _                      {:parameters [(card-params card-id)]}
                     :model/Dashboard _                      {:parameters [(card-params card-id)]}]
        (is (= 3 (hydrated-count card)))))))

(deftest public-sharing-test
  (testing "test that a Card's :public_uuid comes back if public sharing is enabled..."
    (tu/with-temporary-setting-values [enable-public-sharing true]
      (mt/with-temp [:model/Card card {:public_uuid (str (random-uuid))}]
        (is (=? u/uuid-regex
                (:public_uuid card)))))))

(deftest public-sharing-test-2
  (testing "test that a Card's :public_uuid comes back if public sharing is enabled..."
    (testing "...but if public sharing is *disabled* it should come back as `nil`"
      (tu/with-temporary-setting-values [enable-public-sharing false]
        (mt/with-temp [:model/Card card {:public_uuid (str (random-uuid))}]
          (is (= nil
                 (:public_uuid card))))))))

(defn- dummy-dataset-query [database-id]
  {:database database-id
   :type     :native
   :native   {:query "SELECT count(*) FROM toucan_sightings;"}})

(deftest database-id-test
  (mt/with-temp [:model/Card {:keys [id]} {:name          "some name"
                                           :dataset_query (dummy-dataset-query (mt/id))
                                           :database_id   (mt/id)}]
    (testing "before update"
      (is (= {:name "some name", :database_id (mt/id)}
             (into {} (t2/select-one [:model/Card :name :database_id] :id id)))))
    (t2/update! :model/Card id {:name          "another name"
                                :dataset_query (dummy-dataset-query (mt/id))})
    (testing "after update"
      (is (= {:name "another name" :database_id (mt/id)}
             (into {} (t2/select-one [:model/Card :name :database_id] :id id)))))))

(deftest disable-implicit-actions-if-needed-test
  (mt/with-actions-enabled
    (testing "when updating a model to include any clauses will disable implicit actions if they exist\n"
      (testing "happy paths\n"
        (let [query (mt/mbql-query users)]
          (doseq [query-change [{:limit       1}
                                {:expressions {"id + 1" [:+ (mt/$ids $users.id) 1]}}
                                {:filter      [:> (mt/$ids $users.id) 2]}
                                {:breakout    [(mt/$ids !month.users.last_login)]}
                                {:aggregation [[:count]]}
                                {:joins       [{:fields       :all
                                                :source-table (mt/id :checkins)
                                                :condition    [:= (mt/$ids $users.id) (mt/$ids $checkins.user_id)]
                                                :alias        "People"}]}
                                {:order-by    [[(mt/$ids $users.id) :asc]]}
                                {:fields      [(mt/$ids $users.id)]}]]
            (testing (format "when adding %s to the query" (first (keys query-change)))
              (mt/with-actions [{model-id :id}           {:type :model, :dataset_query query}
                                {action-id-1 :action-id} {:type :implicit
                                                          :kind "row/create"}
                                {action-id-2 :action-id} {:type :implicit
                                                          :kind "row/update"}]
                ;; make sure we have thing exists to start with
                (is (= 2 (t2/count :model/Action :id [:in [action-id-1 action-id-2]])))
                (is (= 1 (t2/update! :model/Card :id model-id {:dataset_query (update query :query merge query-change)})))
                ;; should be gone by now
                (is (= 0 (t2/count :model/Action :id [:in [action-id-1 action-id-2]])))
                (is (= 0 (t2/count :model/ImplicitAction :action_id [:in [action-id-1 action-id-2]])))
                ;; call it twice to make we don't get delete error if no actions are found
                (is (= 1 (t2/update! :model/Card :id model-id {:dataset_query (update query :query merge query-change)})))))))))))

(deftest disable-implicit-actions-if-needed-test-2
  (mt/with-actions-enabled
    (testing "unhappy paths\n"
      (testing "should not attempt to delete if it's not a model"
        (mt/with-temp [:model/Card {id :id} {:type          :question
                                             :dataset_query (mt/mbql-query users)}]
          (with-redefs [card/disable-implicit-action-for-model! (fn [& _args]
                                                                  (throw (ex-info "Should not be called" {})))]
            (is (= 1 (t2/update! :model/Card :id id {:dataset_query (mt/mbql-query users {:limit 1})})))))))))

(deftest disable-implicit-actions-if-needed-test-3
  (mt/with-actions-enabled
    (testing "unhappy paths\n"
      (testing "only disable implicit actions, not http and query"
        (mt/with-actions [{model-id :id}           {:type :model, :dataset_query (mt/mbql-query users)}
                          {implicit-id :action-id} {:type :implicit}
                          {http-id :action-id}     {:type :http}
                          {query-id :action-id}    {:type :query}]
          ;; make sure we have thing exists to start with
          (is (= 3 (t2/count :model/Action :id [:in [implicit-id http-id query-id]])))
          (t2/update! :model/Card :id model-id {:dataset_query (mt/mbql-query users {:limit 1})})
          (is (not (t2/exists? :model/Action :id implicit-id)))
          (is (t2/exists? :model/Action :id http-id))
          (is (t2/exists? :model/Action :id query-id)))))))

(deftest disable-implicit-actions-if-needed-test-4
  (mt/with-actions-enabled
    (testing "unhappy paths\n"
      (testing "should not disable if change source table"
        (mt/with-actions [{model-id :id}           {:type :model, :dataset_query (mt/mbql-query users)}
                          {action-id-1 :action-id} {:type :implicit
                                                    :kind "row/create"}
                          {action-id-2 :action-id} {:type :implicit
                                                    :kind "row/update"}]
          ;; make sure we have thing exists to start with
          (is (= 2 (t2/count :model/Action :id [:in [action-id-1 action-id-2]])))
          ;; change source from users to categories
          (t2/update! :model/Card :id model-id {:dataset_query (mt/mbql-query categories)})
          ;; actions still exists
          (is (= 2 (t2/count :model/Action :id [:in [action-id-1 action-id-2]])))
          (is (= 2 (t2/count :model/ImplicitAction :action_id [:in [action-id-1 action-id-2]]))))))))

;;; ------------------------------------------ Circular Reference Detection ------------------------------------------

(defn- card-with-source-table
  "Generate values for a Card with `source-table` for use with `with-temp`."
  [source-table & {:as kvs}]
  (merge {:dataset_query {:database (mt/id)
                          :type     :query
                          :query    {:source-table source-table}}}
         kvs))

(deftest circular-reference-test
  (testing "Should throw an Exception if saving a Card that references itself"
    (mt/with-temp [:model/Card card (card-with-source-table (mt/id :venues))]
      ;; now try to make the Card reference itself. Should throw Exception
      (is (thrown?
           Exception
           (t2/update! :model/Card (u/the-id card)
                       (card-with-source-table (str "card__" (u/the-id card)))))))))

(deftest circular-reference-test-2
  (testing "Do the same stuff with circular reference between two Cards... (A -> B -> A)"
    (mt/with-temp [:model/Card card-a (card-with-source-table (mt/id :venues))
                   :model/Card card-b (card-with-source-table (str "card__" (u/the-id card-a)))]
      (is (thrown?
           Exception
           (t2/update! :model/Card (u/the-id card-a)
                       (card-with-source-table (str "card__" (u/the-id card-b)))))))))

(deftest circular-reference-test-3
  (testing "ok now try it with A -> C -> B -> A"
    (mt/with-temp [:model/Card card-a (card-with-source-table (mt/id :venues))
                   :model/Card card-b (card-with-source-table (str "card__" (u/the-id card-a)))
                   :model/Card card-c (card-with-source-table (str "card__" (u/the-id card-b)))]
      (is (thrown?
           Exception
           (t2/update! :model/Card (u/the-id card-a)
                       (card-with-source-table (str "card__" (u/the-id card-c)))))))))

(deftest validate-collection-namespace-test
  (mt/with-temp [:model/Collection {collection-id :id} {:namespace "currency"}]
    (testing "Shouldn't be able to create a Card in a non-normal Collection"
      (let [card-name (mt/random-name)]
        (try
          (is (thrown-with-msg?
               clojure.lang.ExceptionInfo
               #"A Card can only go in Collections in the \"default\" or :analytics namespace."
               (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card) :collection_id collection-id, :name card-name))))
          (finally
            (t2/delete! :model/Card :name card-name)))))))

(deftest validate-collection-namespace-test-2
  (mt/with-temp [:model/Collection {collection-id :id} {:namespace "currency"}]
    (testing "Shouldn't be able to move a Card to a non-normal Collection"
      (mt/with-temp [:model/Card {card-id :id}]
        (is (thrown-with-msg?
             clojure.lang.ExceptionInfo
             #"A Card can only go in Collections in the \"default\" or :analytics namespace."
             (t2/update! :model/Card card-id {:collection_id collection-id})))))))

(deftest ^:parallel normalize-result-metadata-test
  (testing "Should normalize result metadata keys when fetching a Card from the DB"
    (let [metadata (qp.preprocess/query->expected-cols (mt/mbql-query venues))]
      (mt/with-temp [:model/Card {card-id :id} {:dataset_query   (mt/mbql-query venues)
                                                :result_metadata metadata}]
        (is (= (mt/derecordize metadata)
               (mt/derecordize (t2/select-one-fn :result_metadata :model/Card :id card-id))))))))

(deftest populate-result-metadata-if-needed-test
  (doseq [[creating-or-updating f]
          {"creating" (fn [properties f]
                        (mt/with-temp [:model/Card {card-id :id} properties]
                          (f (t2/select-one-fn :result_metadata :model/Card :id card-id))))
           "updating" (fn [changes f]
                        (mt/with-temp [:model/Card {card-id :id} {:dataset_query   (mt/mbql-query checkins)
                                                                  :result_metadata (qp.preprocess/query->expected-cols (mt/mbql-query checkins))}]
                          (t2/update! :model/Card card-id changes)
                          (f (t2/select-one-fn :result_metadata :model/Card :id card-id))))}]

    (testing (format "When %s a Card\n" creating-or-updating)
      (testing "If result_metadata is empty, we should attempt to populate it"
        (f {:dataset_query (mt/mbql-query venues)}
           (fn [metadata]
             (is (= (map :name (qp.preprocess/query->expected-cols (mt/mbql-query venues)))
                    (map :name metadata))))))
      (testing "Don't overwrite result_metadata that was passed in"
        (let [metadata (take 1 (qp.preprocess/query->expected-cols (mt/mbql-query venues)))]
          (f {:dataset_query   (mt/mbql-query venues)
              :result_metadata metadata}
             (fn [new-metadata]
               (is (= (mt/derecordize metadata)
                      (mt/derecordize new-metadata)))))))
      (testing "Shouldn't barf if query can't be run (e.g. if query is a SQL query); set metadata to nil"
        (f {:dataset_query (mt/native-query {:native "SELECT * FROM VENUES"})}
           (fn [metadata]
             (is (= nil
                    metadata)))))
      (testing "Shouldn't remove verified result metadata from native queries (#37009)"
        (let [metadata (qp.preprocess/query->expected-cols (mt/mbql-query checkins))]
          (f (cond-> {:dataset_query (mt/native-query {:native "SELECT * FROM CHECKINS"})
                      :result_metadata metadata}
               (= creating-or-updating "updating")
               (assoc :verified-result-metadata? true))
             (fn [new-metadata]
               (is (= (mt/derecordize metadata)
                      (mt/derecordize new-metadata))))))))))

(defn- test-visualization-settings-normalization-1 [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (testing "Field references in column settings"
      (doseq [[original expected] {[:ref [:field-literal "foo" :type/Float]]
                                   [:ref [:field "foo" {:base-type :type/Float}]]

                                   [:ref [:field-id 1]]
                                   [:ref [:field 1 nil]]

                                   [:ref [:expression "wow"]]
                                   [:ref [:expression "wow"]]}
              ;; also check that normalization of already-normalized refs is idempotent
              original [original expected]
              ;; frontend uses JSON-serialized versions of the MBQL clauses as keys
              :let     [original (json/encode original)
                        expected (json/encode expected)]]
        (testing (format "Viz settings field ref key %s should get normalized to %s"
                         (pr-str original)
                         (pr-str expected))
          (f
           {:column_settings {original {:currency "BTC"}}}
           {:column_settings {expected {:currency "BTC"}}}))))))

(defn- test-visualization-settings-normalization-2 [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (testing "Other MBQL field clauses"
      (let [original {:map.type                 "region"
                      :map.region               "us_states"
                      :pivot_table.column_split {:rows    [["datetime-field" ["field-id" 807] "year"]]
                                                 :columns [["fk->" ["field-id" 805] ["field-id" 808]]]
                                                 :values  [["aggregation" 0]]}}
            expected {:map.type                 "region"
                      :map.region               "us_states"
                      :pivot_table.column_split {:rows    [[:field 807 {:temporal-unit :year}]]
                                                 :columns [[:field 808 {:source-field 805}]]
                                                 :values  [[:aggregation 0]]}}]
        (f original expected)))))

(defn- test-visualization-settings-normalization-3 [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (testing "Don't normalize non-MBQL arrays"
      (let [original {:graph.show_goal  true
                      :graph.goal_value 5.9
                      :graph.dimensions ["the_day"]
                      :graph.metrics    ["total_per_day"]}]
        (f original original)))))

(defn- test-visualization-settings-normalization-4 [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (testing "Don't normalize key-value pairs in maps that could be interpreted as MBQL clauses"
      (let [original {:field-id 1}]
        (f original original)))))

(defn- test-visualization-settings-normalization-5 [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (testing "Don't normalize array in graph.metrics that could be interpreted as MBQL clauses"
      (let [original {:graph.metrics ["expression" "sum" "count"]}]
        (f original original)))))

;; this is a separate function so we can use the same tests for DashboardCards as well
(defn test-visualization-settings-normalization [f]
  (testing "visualization settings should get normalized to use modern MBQL syntax"
    (doseq [varr [#'test-visualization-settings-normalization-1
                  #'test-visualization-settings-normalization-2
                  #'test-visualization-settings-normalization-3
                  #'test-visualization-settings-normalization-4
                  #'test-visualization-settings-normalization-5]]
      (testing varr
        (varr f)))))

(deftest normalize-visualization-settings-test
  (test-visualization-settings-normalization
   (fn [original expected]
     (mt/with-temp [:model/Card card {:visualization_settings original}]
       (is (= expected
              (t2/select-one-fn :visualization_settings :model/Card :id (u/the-id card))))))))

(deftest ^:parallel template-tag-parameters-test
  (testing "Card with a Field filter parameter"
    (mt/with-temp [:model/Card card {:dataset_query (qp.card-test/field-filter-query)}]
      (is (= [{:id "_DATE_"
               :type :date/all-options
               :target [:dimension [:template-tag "date"]]
               :name "Check-In Date"
               :slug "date"
               :default nil
               :required false}]
             (card/template-tag-parameters card))))))

(deftest ^:parallel template-tag-parameters-test-2
  (testing "Card with a non-Field-filter parameter"
    (mt/with-temp [:model/Card card {:dataset_query (qp.card-test/non-field-filter-query)}]
      (is (= [{:id "_ID_"
               :type :number/=
               :target [:variable [:template-tag "id"]]
               :name "Order ID"
               :slug "id"
               :default "1"
               :required true}]
             (card/template-tag-parameters card))))))

(deftest ^:parallel template-tag-parameters-test-3
  (testing "Should ignore native query snippets and source card IDs"
    (mt/with-temp [:model/Card card {:dataset_query (qp.card-test/non-parameter-template-tag-query)}]
      (is (= [{:id "_ID_"
               :type :number/=
               :target [:variable [:template-tag "id"]]
               :name "Order ID"
               :slug "id"
               :default "1"
               :required true}]
             (card/template-tag-parameters card))))))

(deftest validate-template-tag-field-ids-test
  (testing "Disallow saving a Card with native query Field filter template tags referencing a different Database (#14145)"
    (let [test-data-db-id   (mt/id)
          bird-counts-db-id (mt/dataset daily-bird-counts (mt/id))
          card-data         (fn [database-id]
                              {:database_id   database-id
                               :dataset_query {:database database-id
                                               :type     :native
                                               :native   {:query         "SELECT COUNT(*) FROM PRODUCTS WHERE {{FILTER}}"
                                                          :template-tags {"FILTER" {:id           "_FILTER_"
                                                                                    :name         "FILTER"
                                                                                    :display-name "Filter"
                                                                                    :type         :dimension
                                                                                    :dimension    [:field (mt/id :venues :name) nil]
                                                                                    :widget-type  :string/=
                                                                                    :default      nil}}}}})
          good-card-data  (card-data test-data-db-id)
          bad-card-data   (card-data bird-counts-db-id)]
      (testing "Should not be able to create new Card with a filter with the wrong Database ID"
        (is (thrown-with-msg?
             clojure.lang.ExceptionInfo
             #"Invalid Field Filter: Field \d+ \"VENUES\"\.\"NAME\" belongs to Database \d+ \"test-data \(h2\)\", but the query is against Database \d+ \"daily-bird-counts \(h2\)\""
             (mt/with-temp [:model/Card _ bad-card-data]))))
      (testing "Should not be able to update a Card to have a filter with the wrong Database ID"
        (mt/with-temp [:model/Card {card-id :id} good-card-data]
          (is (thrown-with-msg?
               clojure.lang.ExceptionInfo
               #"Invalid Field Filter: Field \d+ \"VENUES\"\.\"NAME\" belongs to Database \d+ \"test-data \(h2\)\", but the query is against Database \d+ \"daily-bird-counts \(h2\)\""
               (t2/update! :model/Card card-id bad-card-data))))))))

;;; ------------------------------------------ Parameters tests ------------------------------------------

(deftest ^:parallel validate-parameters-test
  (testing "Should validate Card :parameters when"
    (testing "creating"
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #":parameters must be a sequence of maps with :id and :type keys"
           (mt/with-temp [:model/Card _ {:parameters {:a :b}}])))
      (mt/with-temp [:model/Card card {:parameters [{:id   "valid-id"
                                                     :type "id"}]}]
        (is (some? card))))))

(deftest validate-parameters-test-2
  (testing "Should validate Card :parameters when"
    (testing "updating"
      (mt/with-temp [:model/Card {:keys [id]} {:parameters []}]
        (is (thrown-with-msg?
             clojure.lang.ExceptionInfo
             #":parameters must be a sequence of maps with :id and :type keys"
             (t2/update! :model/Card id {:parameters [{:id 100}]})))
        (is (pos? (t2/update! :model/Card id {:parameters [{:id   "new-valid-id"
                                                            :type "id"}]})))))))

(deftest normalize-parameters-test
  (testing ":parameters should get normalized when coming out of the DB"
    (doseq [[target expected] {[:dimension [:field-id 1000]] [:dimension [:field 1000 nil]]
                               [:field-id 1000]              [:field 1000 nil]}]
      (testing (format "target = %s" (pr-str target))
        (mt/with-temp [:model/Card {card-id :id} {:parameter_mappings [{:parameter_id     "_CATEGORY_NAME_"
                                                                        :target target}]}]

          (is (= [{:parameter_id     "_CATEGORY_NAME_"
                   :target expected}]
                 (t2/select-one-fn :parameter_mappings :model/Card :id card-id))))))))

(deftest validate-parameter-mappings-test
  (testing "Should validate Card :parameter_mappings when"
    (testing "creating"
      (is (thrown-with-msg?
           clojure.lang.ExceptionInfo
           #":parameter_mappings must be a sequence of maps with :parameter_id and :type keys"
           (mt/with-temp [:model/Card _ {:parameter_mappings {:a :b}}])))
      (mt/with-temp [:model/Card card {:parameter_mappings [{:parameter_id "valid-id"
                                                             :target       [:field 1000 nil]}]}]
        (is (some? card))))))

(deftest validate-parameter-mappings-test-2
  (testing "Should validate Card :parameter_mappings when"
    (testing "updating"
      (mt/with-temp [:model/Card {:keys [id]} {:parameter_mappings []}]
        (is (thrown-with-msg?
             clojure.lang.ExceptionInfo
             #":parameter_mappings must be a sequence of maps with :parameter_id and :type keys"
             (t2/update! :model/Card id {:parameter_mappings [{:parameter_id 100}]})))
        (is (pos? (t2/update! :model/Card id {:parameter_mappings [{:parameter_id "new-valid-id"
                                                                    :target       [:field 1000 nil]}]})))))))

(deftest normalize-parameter-mappings-test
  (testing ":parameter_mappings should get normalized when coming out of the DB"
    (mt/with-temp [:model/Card {card-id :id} {:parameter_mappings [{:parameter_id "22486e00"
                                                                    :card_id      1
                                                                    :target       [:dimension [:field-id 1]]}]}]
      (is (= [{:parameter_id "22486e00"
               :card_id      1
               :target       [:dimension [:field 1 nil]]}]
             (t2/select-one-fn :parameter_mappings :model/Card :id card-id))))))

(deftest identity-hash-test
  (testing "Card hashes are composed of the name and the collection's hash"
    (let [now #t "2022-09-01T12:34:56"]
      (mt/with-temp [:model/Collection  coll {:name "field-db" :location "/" :created_at now}
                     :model/Card card {:name "the card" :collection_id (:id coll) :created_at now}]
        (is (= "5199edf0"
               (serdes/raw-hash ["the card" (serdes/identity-hash coll) now])
               (serdes/identity-hash card)))))))

(deftest parameter-card-test
  (let [default-params {:name       "Category Name"
                        :slug       "category_name"
                        :id         "_CATEGORY_NAME_"
                        :type       "category"}]
    (testing "parameter with source is card create ParameterCard"
      (mt/with-temp [:model/Card  {source-card-id-1 :id} {}
                     :model/Card  {source-card-id-2 :id} {}
                     :model/Card  {card-id :id}          {:parameters [(merge default-params
                                                                              {:values_source_type    "card"
                                                                               :values_source_config {:card_id source-card-id-1}})]}]
        (is (=? [{:card_id                   source-card-id-1
                  :parameterized_object_type :card
                  :parameterized_object_id   card-id
                  :parameter_id              "_CATEGORY_NAME_"}]
                (t2/select :model/ParameterCard :parameterized_object_type "card" :parameterized_object_id card-id)))

        (testing "update values_source_config.card_id will update ParameterCard"
          (t2/update! :model/Card card-id {:parameters [(merge default-params
                                                               {:values_source_type    "card"
                                                                :values_source_config {:card_id source-card-id-2}})]})
          (is (=? [{:card_id                   source-card-id-2
                    :parameterized_object_type :card
                    :parameterized_object_id   card-id
                    :parameter_id              "_CATEGORY_NAME_"}]
                  (t2/select :model/ParameterCard :parameterized_object_type "card" :parameterized_object_id card-id))))

        (testing "delete the card will delete ParameterCard"
          (t2/delete! :model/Card :id card-id)
          (is (= []
                 (t2/select :model/ParameterCard :parameterized_object_type "card" :parameterized_object_id card-id))))))))

(deftest parameter-card-test-2
  (let [default-params {:name       "Category Name"
                        :slug       "category_name"
                        :id         "_CATEGORY_NAME_"
                        :type       "category"}]
    (testing "Delete a card will delete any ParameterCard that linked to it"
      (mt/with-temp [:model/Card  {source-card-id :id} {}
                     :model/Card  {card-id-1 :id}      {:parameters [(merge default-params
                                                                            {:values_source_type    "card"
                                                                             :values_source_config {:card_id source-card-id}})]}
                     :model/Card  {card-id-2 :id}      {:parameters [(merge default-params
                                                                            {:values_source_type    "card"
                                                                             :values_source_config {:card_id source-card-id}})]}]
        ;; makes sure we have ParameterCard to start with
        (is (=? [{:card_id                   source-card-id
                  :parameterized_object_type :card
                  :parameterized_object_id   card-id-1
                  :parameter_id              "_CATEGORY_NAME_"}
                 {:card_id                   source-card-id
                  :parameterized_object_type :card
                  :parameterized_object_id   card-id-2
                  :parameter_id              "_CATEGORY_NAME_"}]
                (t2/select :model/ParameterCard :card_id source-card-id {:order-by [[:parameterized_object_id :asc]]})))
        (t2/delete! :model/Card :id source-card-id)
        (is (= []
               (t2/select :model/ParameterCard :card_id source-card-id)))))))

(deftest do-not-update-parameter-card-if-it-doesn't-change-test
  (testing "Do not update ParameterCard if updating a Dashboard doesn't change the parameters"
    (mt/with-temp [:model/Card  {source-card-id :id} {}
                   :model/Card  {card-id-1 :id}      {:parameters [{:name       "Category Name"
                                                                    :slug       "category_name"
                                                                    :id         "_CATEGORY_NAME_"
                                                                    :type       "category"
                                                                    :values_source_type    "card"
                                                                    :values_source_config {:card_id source-card-id}}]}]
      (mt/with-dynamic-fn-redefs [parameter-card/upsert-or-delete-from-parameters! (fn [& _] (throw (ex-info "Should not be called" {})))]
        (t2/update! :model/Card card-id-1 {:name "new name"})))))

(deftest cleanup-parameter-on-card-changes-test
  (mt/dataset test-data
    (mt/with-temp
      [:model/Card        {source-card-id :id} (merge (mt/card-with-source-metadata-for-query
                                                       (mt/mbql-query products {:fields [(mt/$ids $products.title)
                                                                                         (mt/$ids $products.category)]
                                                                                :limit 5}))
                                                      {:database_id (mt/id)
                                                       :table_id    (mt/id :products)})
       :model/Card        card                 {:parameters [{:name                  "Param 1"
                                                              :id                    "param_1"
                                                              :type                  "category"
                                                              :values_source_type    "card"
                                                              :values_source_config {:card_id source-card-id
                                                                                     :value_field (mt/$ids $products.title)}}]}
       :model/Dashboard   dashboard            {:parameters [{:name       "Param 2"
                                                              :id         "param_2"
                                                              :type       "category"
                                                              :values_source_type    "card"
                                                              :values_source_config {:card_id source-card-id
                                                                                     :value_field (mt/$ids $products.category)}}]}]
      ;; check if we had parametercard to starts with
      (is (=? [{:card_id                   source-card-id
                :parameter_id              "param_1"
                :parameterized_object_type :card
                :parameterized_object_id   (:id card)}
               {:card_id                   source-card-id
                :parameter_id              "param_2"
                :parameterized_object_type :dashboard
                :parameterized_object_id   (:id dashboard)}]
              (t2/select :model/ParameterCard :card_id source-card-id {:order-by [[:parameter_id :asc]]})))
      ;; update card with removing the products.category
      (testing "on update result_metadata"
        (t2/update! :model/Card source-card-id
                    (mt/card-with-source-metadata-for-query
                     (mt/mbql-query products {:fields [(mt/$ids $products.title)]
                                              :limit 5})))

        (testing "ParameterCard for dashboard is removed"
          (is (=? [{:card_id                   source-card-id
                    :parameter_id              "param_1"
                    :parameterized_object_type :card
                    :parameterized_object_id   (:id card)}]
                  (t2/select :model/ParameterCard :card_id source-card-id))))

        (testing "update the dashboard parameter and remove values_config of dashboard"
          (is (=? [{:id   "param_2"
                    :name "Param 2"
                    :type :category}]
                  (t2/select-one-fn :parameters :model/Dashboard :id (:id dashboard))))

          (testing "but no changes with parameter on card"
            (is (=? [{:name                 "Param 1"
                      :id                   "param_1"
                      :type                 :category
                      :values_source_type   "card"
                      :values_source_config {:card_id     source-card-id
                                             :value_field (mt/$ids $products.title)}}]
                    (t2/select-one-fn :parameters :model/Card :id (:id card)))))))

      (testing "on archive card"
        (t2/update! :model/Card source-card-id {:archived true})

        (testing "ParameterCard for card is removed"
          (is (=? [] (t2/select :model/ParameterCard :card_id source-card-id))))

        (testing "update the dashboard parameter and remove values_config of card"
          (is (=? [{:id   "param_1"
                    :name "Param 1"
                    :type :category}]
                  (t2/select-one-fn :parameters :model/Card :id (:id card)))))))))

(deftest ^:parallel descendants-test
  (testing "regular cards don't depend on anything"
    (mt/with-temp [:model/Card card {:name "some card"}]
      (is (empty? (serdes/descendants "Card" (:id card)))))))

(deftest ^:parallel descendants-test-2
  (testing "cards which have another card as the source depend on that card"
    (mt/with-temp [:model/Card card1 {:name "base card"}
                   :model/Card card2 {:name "derived card"
                                      :dataset_query {:query {:source-table (str "card__" (:id card1))}}}]
      (is (empty? (serdes/descendants "Card" (:id card1))))
      (is (= {["Card" (:id card1)] {"Card" (:id card2)}}
             (serdes/descendants "Card" (:id card2)))))))

(deftest ^:parallel descendants-test-3
  (testing "cards that has a native template tag"
    (mt/with-temp [:model/NativeQuerySnippet snippet {:name "category" :content "category = 'Gizmo'"}
                   :model/Card               card
                   {:name          "Business Card"
                    :dataset_query {:native
                                    {:template-tags {:snippet {:name         "snippet"
                                                               :type         :snippet
                                                               :snippet-name "snippet"
                                                               :snippet-id   (:id snippet)}}
                                     :query "select * from products where {{snippet}}"}}}]
      (is (= {["NativeQuerySnippet" (:id snippet)] {"Card" (:id card)}}
             (serdes/descendants "Card" (:id card)))))))

(deftest ^:parallel descendants-test-4
  (testing "cards which have parameter's source is another card"
    (mt/with-temp [:model/Card card1 {:name "base card"}
                   :model/Card card2 {:name       "derived card"
                                      :parameters [{:id                   "valid-id"
                                                    :type                 "id"
                                                    :values_source_type   "card"
                                                    :values_source_config {:card_id (:id card1)}}]}]
      (is (= {["Card" (:id card1)] {"Card" (:id card2)}}
             (serdes/descendants "Card" (:id card2)))))))

(deftest ^:parallel extract-test
  (let [metadata (qp.preprocess/query->expected-cols (mt/mbql-query venues))
        query    (mt/mbql-query venues)]
    (testing "every card retains result_metadata"
      (mt/with-temp [:model/Card {card1-id :id} {:dataset_query   query
                                                 :result_metadata metadata}
                     :model/Card {card2-id :id} {:type            :model
                                                 :dataset_query   query
                                                 :result_metadata metadata}]
        (doseq [card-id [card1-id card2-id]]
          (let [extracted (serdes/extract-one "Card" nil (t2/select-one :model/Card :id card-id))]
            ;; card2 is model, but card1 is not
            (is (= (= card-id card2-id)
                   (= :model (:type extracted))))
            (is (string? (:display_name (first (:result_metadata extracted)))))
            ;; this is a quick comparison, since the actual stored metadata is quite complex
            (is (= (map :display_name metadata)
                   (map :display_name (:result_metadata extracted))))))))))

;;; ------------------------------------------ Viz Settings Tests  ------------------------------------------

(deftest ^:parallel upgrade-to-v2-db-test
  (testing ":visualization_settings v. 1 should be upgraded to v. 2 on select"
    (mt/with-temp [:model/Card {card-id :id} {:visualization_settings {:pie.show_legend true}}]
      (is (= {:version 2
              :pie.show_legend true
              :pie.percent_visibility "inside"}
             (t2/select-one-fn :visualization_settings :model/Card :id card-id))))))

(deftest upgrade-to-v2-db-test-2
  (testing ":visualization_settings v. 1 should be upgraded to v. 2 and persisted on update"
    (mt/with-temp [:model/Card {card-id :id} {:visualization_settings {:pie.show_legend true}}]
      (t2/update! :model/Card card-id {:name "Favorite Toucan Foods"})
      (is (= {:version 2
              :pie.show_legend true
              :pie.percent_visibility "inside"}
             (-> (t2/select-one (t2/table-name :model/Card) {:where [:= :id card-id]})
                 :visualization_settings
                 json/decode+kw))))))

(deftest storing-metabase-version
  (testing "Newly created Card should know a Metabase version used to create it"
    (mt/with-temp [:model/Card card {}]
      (is (= config/mb-version-string (:metabase_version card)))

      (with-redefs [config/mb-version-string "blablabla"]
        (t2/update! :model/Card :id (:id card) {:description "test"}))

      ;; we store version of metabase which created the card
      (is (= config/mb-version-string
             (t2/select-one-fn :metabase_version :model/Card :id (:id card)))))))

(deftest ^:parallel changed?-test
  (letfn [(changed? [before after]
            (#'card/changed? @#'card/card-compare-keys before after))]
    (testing "Ignores keyword/string"
      (is (false? (changed? {:dataset_query {:type :query}} {:dataset_query {:type "query"}}))))
    (testing "Ignores properties not in `api.card/card-compare-keys"
      (is (false? (changed? {:collection_id 1
                             :collection_position 0}
                            {:collection_id 2
                             :collection_position 1}))))
    (testing "Sees changes"
      (is (true? (changed? {:dataset_query {:type :query}}
                           {:dataset_query {:type :query
                                            :query {}}})))
      (testing "But only when they are different in the after, not just omitted"
        (is (false? (changed? {:dataset_query {} :collection_id 1}
                              {:collection_id 1})))
        (is (true? (changed? {:dataset_query {} :collection_id 1}
                             {:dataset_query nil :collection_id 1})))))))

(deftest hydrate-dashboard-count-test
  (mt/with-temp
    [:model/Card          card1 {}
     :model/Card          card2 {}
     :model/Card          card3 {}
     :model/Dashboard     dash  {}
     :model/DashboardCard _dc1  {:card_id (:id card1) :dashboard_id (:id dash)}
     :model/DashboardCard _dc2  {:card_id (:id card1) :dashboard_id (:id dash)}
     :model/DashboardCard _dc3  {:card_id (:id card2) :dashboard_id (:id dash)}]
    (is (= [2 1 0]
           (map :dashboard_count (t2/hydrate [card1 card2 card3] :dashboard_count))))))

(deftest hydrate-parameter-usage-count-test
  (mt/with-temp
    [:model/Card          card1 {}
     :model/Card          card2 {}
     :model/Card          card3 {}
     :model/ParameterCard _pc1  {:card_id (:id card1)
                                 :parameter_id              "param_1"
                                 :parameterized_object_type "card"
                                 :parameterized_object_id (:id card1)}
     :model/ParameterCard _pc2  {:card_id (:id card1)
                                 :parameter_id              "param_2"
                                 :parameterized_object_type "card"
                                 :parameterized_object_id (:id card2)}
     :model/ParameterCard _pc3  {:card_id (:id card2)
                                 :parameter_id              "param_3"
                                 :parameterized_object_type "card"
                                 :parameterized_object_id (:id card3)}]
    (is (= [2 1 0]
           (map :parameter_usage_count (t2/hydrate [card1 card2 card3] :parameter_usage_count))))))

(deftest ^:parallel average-query-time-and-last-query-started-test
  (let [now       (t/offset-date-time)
        yesterday (t/minus now (t/days 1))]
    (mt/with-temp
      [:model/Card           card {}
       :model/QueryExecution _qe1 {:card_id      (:id card)
                                   :started_at   now
                                   :cache_hit    false
                                   :running_time 50}
       :model/QueryExecution _qe2 {:card_id      (:id card)
                                   :started_at   yesterday
                                   :cache_hit    false
                                   :running_time 100}]
      (is (= 75 (-> card (t2/hydrate :average_query_time) :average_query_time int)))
      ;; the DB might save last_query_start with a different level of precision than the JVM does, on my machine
      ;; `offset-date-time` returns nanosecond precision (9 decimal places) but `last_query_start` is coming back with
      ;; microsecond precision (6 decimal places). We don't care about such a small difference, just strip it off of the
      ;; times we're comparing.
      (is (= (.withNano now 0)
             (-> (-> card (t2/hydrate :last_query_start) :last_query_start)
                 t/offset-date-time
                 (.withNano 0)))))))

(deftest save-mlv2-card-test
  (testing "App DB CRUD should work for a Card with an MLv2 query (#39024)"
    (let [metadata-provider (lib.metadata.jvm/application-database-metadata-provider (mt/id))
          venues            (lib.metadata/table metadata-provider (mt/id :venues))
          query             (lib/query metadata-provider venues)]
      (mt/with-temp [:model/Card card {:dataset_query query}]
        (testing "Save to app DB: table_id and database_id should get populated"
          (is (=? {:dataset_query {:lib/type     :mbql/query
                                   :database     (mt/id)
                                   :stages       [{:lib/type :mbql.stage/mbql, :source-table (mt/id :venues)}]
                                   :lib/metadata metadata-provider}
                   :table_id      (mt/id :venues)
                   :database_id   (mt/id)}
                  card)))
        (testing "Save to app DB: Check MLv2 query was serialized to app DB in a sane way. Metadata provider should be removed"
          (is (= {"lib/type" "mbql/query"
                  "database" (mt/id)
                  "stages"   [{"lib/type"     "mbql.stage/mbql"
                               "source-table" (mt/id :venues)}]}
                 (json/decode (t2/select-one-fn :dataset_query (t2/table-name :model/Card) :id (u/the-id card))))))
        (testing "fetch from app DB"
          (is (=? {:dataset_query {:lib/type     :mbql/query
                                   :database     (mt/id)
                                   :stages       [{:lib/type :mbql.stage/mbql, :source-table (mt/id :venues)}]
                                   :lib/metadata (lib.metadata.jvm/application-database-metadata-provider (mt/id))}
                   :query_type    :query
                   :table_id      (mt/id :venues)
                   :database_id   (mt/id)}
                  (t2/select-one :model/Card :id (u/the-id card)))))
        (testing "Update query: change table to ORDERS; query and table_id should reflect that"
          (let [orders (lib.metadata/table metadata-provider (mt/id :orders))]
            (is (= 1
                   (t2/update! :model/Card :id (u/the-id card)
                               {:dataset_query (lib/query metadata-provider orders)})))
            (is (=? {:dataset_query {:lib/type     :mbql/query
                                     :database     (mt/id)
                                     :stages       [{:lib/type :mbql.stage/mbql, :source-table (mt/id :orders)}]
                                     :lib/metadata (lib.metadata.jvm/application-database-metadata-provider (mt/id))}
                     :query_type    :query
                     :table_id      (mt/id :orders)
                     :database_id   (mt/id)}
                    (t2/select-one :model/Card :id (u/the-id card))))))))))

(deftest can-run-adhoc-query-test
  (let [metadata-provider (lib.metadata.jvm/application-database-metadata-provider (mt/id))
        venues            (lib.metadata/table metadata-provider (mt/id :venues))
        query             (lib/query metadata-provider venues)]
    (mt/with-current-user (mt/user->id :crowberto)
      (mt/with-temp [:model/Card card {:dataset_query query}
                     :model/Card no-query {}]
        (is (=? {:can_run_adhoc_query true}
                (t2/hydrate card :can_run_adhoc_query)))
        (is (=? {:can_run_adhoc_query false}
                (t2/hydrate no-query :can_run_adhoc_query)))))))

(deftest audit-card-permisisons-test
  (testing "Cards in audit collections are not readable or writable on OSS, even if they exist (#42645)"
    ;; Here we're testing the specific scenario where an EE instance is downgraded to OSS, but still has the audit
    ;; collections and cards installed. Since we can't load audit content on OSS, let's just redef the audit collection
    ;; to a temp collection and ensure permission checks work properly.
    (mt/with-premium-features #{}
      (mt/with-temp [:model/Collection collection {}
                     :model/Card       card       {:collection_id (:id collection)}]
        (with-redefs [audit/default-audit-collection (constantly collection)]
          (mt/with-test-user :rasta
            (is (false? (mi/can-read? card)))
            (is (false? (mi/can-write? card))))

          (mt/with-test-user :crowberto
            (is (false? (mi/can-read? card)))
            (is (false? (mi/can-write? card)))))))))

(deftest breakouts-->identifier->action-fn-test
  (are [b1 b2 expected--identifier->action] (= expected--identifier->action
                                               (#'card/breakouts-->identifier->action b1 b2))
    [[:field 10 {:temporal-unit :day}]]
    nil
    nil

    [[:expression "x" {:temporal-unit :day}]]
    nil
    nil

    [[:expression "x" {:temporal-unit :day}]]
    [[:expression "x" {:temporal-unit :month}]]
    {[:expression "x"] [:update [:expression "x" {:temporal-unit :month}]]}

    [[:expression "x" {:temporal-unit :day}]]
    [[:expression "x" {:temporal-unit :day}]]
    nil

    [[:field 10 {:temporal-unit :day}] [:expression "x" {:temporal-unit :day}]]
    [[:expression "x" {:temporal-unit :day}] [:field 10 {:temporal-unit :month}]]
    {[:field 10] [:update [:field 10 {:temporal-unit :month}]]}

    [[:field 10 {:temporal-unit :year}] [:field 10 {:temporal-unit :day-of-week}]]
    [[:field 10 {:temporal-unit :year}]]
    nil))

(deftest update-for-dashcard-fn-test
  (are [indetifier->action quasi-dashcards expected-quasi-dashcards]
       (= expected-quasi-dashcards
          (#'card/updates-for-dashcards indetifier->action quasi-dashcards))

    {[:field 10] [:update [:field 10 {:temporal-unit :month}]]}
    [{:parameter_mappings []}]
    nil

    {[:field 10] [:update [:field 10 {:temporal-unit :month}]]}
    [{:id 1 :parameter_mappings [{:target [:dimension [:field 10 nil]]}]}]
    [[1 {:parameter_mappings [{:target [:dimension [:field 10 {:temporal-unit :month}]]}]}]]

    {[:field 10] [:noop]}
    [{:id 1 :parameter_mappings [{:target [:dimension [:field 10 nil]]}]}]
    nil

    {[:field 10] [:update [:field 10 {:temporal-unit :month}]]}
    [{:id 1 :parameter_mappings [{:target [:dimension [:field 10 {:temporal-unit :year}]]}
                                 {:target [:dimension [:field 33 {:temporal-unit :month}]]}
                                 {:target [:dimension [:field 10 {:temporal-unit :day}]]}]}]
    [[1 {:parameter_mappings [{:target [:dimension [:field 10 {:temporal-unit :month}]]}
                              {:target [:dimension [:field 33 {:temporal-unit :month}]]}
                              {:target [:dimension [:field 10 {:temporal-unit :month}]]}]}]]))

(deftest we-cannot-insert-invalid-dashboard-internal-cards
  (mt/with-temp [:model/Collection {coll-id :id} {}
                 :model/Collection {other-coll-id :id} {}
                 :model/Dashboard {dash-id :id} {:collection_id coll-id}]
    (mt/with-model-cleanup [:model/Card]
      (testing "You can't insert a card with a collection_id different than its dashboard's collection_id"
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Invalid dashboard-internal card"
                              (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                                             :dashboard_id dash-id
                                                             :collection_id other-coll-id))))
        (testing "including if it's `nil`"
          (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Invalid dashboard-internal card"
                                (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                                               :dashboard_id dash-id
                                                               :collection_id nil)))))
        (testing "But you can insert a card with the *same* collection_id"
          (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                         :dashboard_id dash-id
                                         :collection_id coll-id)))
        (testing "... or no collection_id"
          (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                         :dashboard_id dash-id))))
      (testing "You can't insert a card with a type other than `:question` as a dashboard-internal card"
        (testing "invalid"
          (doseq [invalid-type (disj card/card-types :question)]
            (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Invalid dashboard-internal card"
                                  (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                                                 :dashboard_id dash-id
                                                                 :type invalid-type))))))
        (testing "these are valid"
          (doseq [valid-type [:question "question"]]
            (is (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                               :dashboard_id dash-id
                                               :type valid-type))))))
      (testing "You can't insert a dashboard-internal card with a collection_position"
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Invalid dashboard-internal card"
                              (t2/insert! :model/Card (assoc (mt/with-temp-defaults :model/Card)
                                                             :dashboard_id dash-id
                                                             :collection_position 5))))))))

(deftest no-updating-dashboard-internal-cards-with-invalid-data
  (mt/with-temp [:model/Collection {coll-id :id} {}
                 :model/Collection {other-coll-id :id} {}
                 :model/Dashboard {dash-id :id} {:collection_id coll-id}
                 :model/Card card {:dashboard_id dash-id}]
    (mt/with-test-user :rasta
      (testing "Can't update the collection_id"
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Cannot manually set `collection_id` on a Dashboard Question"
                              (card/update-card! {:card-before-update card
                                                  :card-updates {:collection_id other-coll-id}}))))
      (testing "CAN 'update' the collection_id"
        (is (card/update-card! {:card-before-update card
                                :card-updates {:collection_id coll-id}})))
      (testing "Can't update the collection_position"
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Cannot set `collection_position` on a Dashboard Question"
                              (card/update-card! {:card-before-update card
                                                  :card-updates {:collection_position 5}}))))
      (testing "CAN 'update' the collection_position"
        (is (card/update-card! {:card-before-update card
                                :card-updates {:collection_position nil}})))
      (testing "Can't update the type"
        (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Cannot set `type` on a Dashboard Question"
                              (card/update-card! {:card-before-update card
                                                  :card-updates {:type :model}}))))
      (testing "CAN 'update' the type"
        (is (card/update-card! {:card-before-update card
                                :card-updates {:type :question}}))))))

(deftest update-does-not-break
  ;; There's currently a footgun in Toucan2 - if 1) the result of `before-update` doesn't have an ID, 2) part of your
  ;; `update` would change a subset of selected rows, and 3) part of your `update` would change *every* selected row
  ;; (in this case, that's the `updated_at` we automatically set), then it emits an update without a `WHERE` clause.
  ;;
  ;;This can be removed after https://github.com/camsaul/toucan2/pull/196 is merged.
  (mt/with-temp [:model/Card {card-1-id :id} {:name "Flippy"}
                 :model/Card {card-2-id :id} {:name "Dog Man"}
                 :model/Card {card-3-id :id} {:name "Petey"}]
    (testing "only the two cards specified get updated"
      (t2/update! :model/Card :id [:in [card-1-id card-2-id]]
                  {:name "Flippy"})
      (is (= "Petey" (t2/select-one-fn :name :model/Card :id card-3-id))))))

(deftest ^:parallel query-description-in-metric-cards-test
  (testing "Metric cards contain query_description key (#51303)"
    (let [mp (lib.metadata.jvm/application-database-metadata-provider (mt/id))]
      (mt/with-temp
        [:model/Card
         {id :id}
         {:name "My metric"
          :type :metric
          :dataset_query (-> (lib/query mp (lib.metadata/table mp (mt/id :orders)))
                             (lib/aggregate (lib/count))
                             lib.convert/->legacy-MBQL)}]
        (is (= "Orders, Count"
               (:query_description (t2/select-one :model/Card :id id))))))))

(defn- bare-query []
  (mt/$ids orders
    {:database (mt/id)
     :type     :query
     :query    {:source-query {:source-table $$orders
                               :aggregation  [[:count] [:sum $subtotal]]
                               :breakout     [$subtotal [:expression "yo"]]
                               :expressions  {"yo" [:+ $subtotal 7]}}
                :joins        [{:alias        "a_join"
                                :condition    [:= $product_id &a_join.products.id]
                                :source-table $$products}
                               {:alias        "another_join"
                                :condition    [:= $user_id &another_join.people.id]
                                :source-table $$people}]}}))

(comment
  (def q1
    (mt/mbql-query orders
      {:source-query {:source-table $$orders
                      :aggregation  [[:count] [:sum $subtotal]]
                      :breakout     [$subtotal [:expression "yo"]]
                      :expressions  {"yo" [:+ $subtotal 7]}}}))
  (-> q1 :query :source-query)
  (qp.preprocess/query->expected-cols q1))

(defn- bare-query-exp [eid]
  (mt/$ids orders
    {:source-query {:source-table       $$orders
                    :aggregation        [[:count] [:sum $subtotal]]
                    :aggregation-idents {0 (str "aggregation_" eid "@0__0")
                                         1 (str "aggregation_" eid "@0__1")}
                    :breakout           [$subtotal [:expression "yo"]]
                    :breakout-idents    {0 (str "breakout_" eid "@0__0")
                                         1 (str "breakout_" eid "@0__1")}
                    :expressions        {"yo" [:+ $subtotal 7]}
                    :expression-idents  {"yo" (str "expression_" eid "@0__yo")}}
     :joins        [{:alias "a_join"
                     :ident (str "join_" eid "@1__a_join")}
                    {:alias "another_join"
                     :ident (str "join_" eid "@1__another_join")}]}))

(deftest ^:sequential idents-populated-on-insert
  (mt/with-temp [:model/Card {eid   :entity_id
                              query :dataset_query} {:name          "A card"
                                                     :dataset_query (bare-query)}]
    (testing "on insert, a :dataset_query with missing idents gets them filled in"
      (is (string? eid))
      (is (=? {:source-query {:aggregation-idents {0 string?}
                              :breakout-idents    {0 string?}
                              :expression-idents  {"yo" string?}}
               :joins        [{:alias "a_join"
                               :ident string?}
                              {:alias "another_join"
                               :ident string?}]}
              (:query query))))))

(deftest ^:sequential entity-id-used-for-idents-if-missing-test
  (mt/with-temp [:model/Card {id :id} {:name          "A card"
                                       :dataset_query (bare-query)}]
    ;; :idents are populated on initial insert; update to remove them. (Update does not populate them like insert.)
    (t2/update! :model/Card id {:dataset_query (bare-query)})
    ;; Can't use the one from `with-temp` since it came before the above edit.
    (let [{eid   :entity_id
           query :dataset_query} (t2/select-one :model/Card :id id)]
      (testing "on read, a :dataset_query with missing idents gets them filled in based on entity_id"
        ;; These idents are: kind_EID@stage__index, eg. "aggregation_4QsLuEnriHKkXCWqbPMQ8@0__0"
        (is (string? eid))
        (is (=? (bare-query-exp eid)
                (:query query)))))))

(deftest ^:sequential fall-back-to-hashing-entity-id-test
  (mt/with-temp [:model/Card {id :id} {:name          "A card"
                                       :dataset_query (bare-query)}]
    ;; :idents are populated on initial insert; update to remove them. (Update does not populate them like insert.)
    ;; Also remove the generated :entity_id.
    (t2/update! :model/Card id {:dataset_query (bare-query)
                                :entity_id     nil})
    ;; Can't use the one from `with-temp` since it came before the above edit.
    (let [{eid   :entity_id
           query :dataset_query} (t2/select-one :model/Card :id id)]
      (testing "on read, a :dataset_query with missing idents AND :entity_id gets a hashed entity_id and idents"
        ;; These idents are: kind_EID@stage__index, eg. "aggregation_4QsLuEnriHKkXCWqbPMQ8@0__0"
        ;; The entity_id is hashed based on created_at, so it's still always different!
        (is (string? eid))
        (is (=? (bare-query-exp eid)
                (:query query)))))))

(deftest ^:sequential e2e-entity-id-and-idents-test
  (mt/with-temp [:model/Card {id :id} {:name          "A card"
                                       :dataset_query (bare-query)}]
    ;; :idents in the query are populated on initial insert; send a t2/update! to remove them.
    ;; (Update does not populate them like insert.)
    ;; Also remove the generated :entity_id.
    (t2/update! :model/Card id {:dataset_query (bare-query)
                                :entity_id     nil})
    ;; Can't use the one from `with-temp` since it came before the above edit.
    (let [{eid   :entity_id
           query :dataset_query} (t2/select-one :model/Card :id id)]
      (testing "idents should be populated on read"
        ;; These idents are: kind_EID@stage__index, eg. "aggregation_4QsLuEnriHKkXCWqbPMQ8@0__0"
        ;; The entity_id is hashed based on created_at, so it's still always different!
        (is (string? eid))
        (is (=? (bare-query-exp eid)
                (:query query)))

        (testing "but not written back to appdb"
          (let [{raw-query :dataset_query} (t2/select-one :report_card :id id)]
            (is (string? raw-query))
            (is (nil? (str/index-of raw-query "-idents")))))

        (testing "converted to pMBQL"
          (let [converted   (lib/query (lib.metadata.jvm/application-database-metadata-provider (mt/id)) query)
                agg-idents  (-> query :query :source-query :aggregation-idents)
                brk-idents  (-> query :query :source-query :breakout-idents)
                expr-idents (-> query :query :source-query :expression-idents)
                [jid1 jid2] (->> query :query :joins (map :ident))
                expected    {:stages [{:aggregation [[:count {:ident (get agg-idents 0)}]
                                                     [:sum   {:ident (get agg-idents 1)} some?]]
                                       :breakout    [[:field      {:ident (get brk-idents 0)} some?]
                                                     [:expression {:ident (get brk-idents 1)} some?]]
                                       :expressions [[:+ {:lib/expression-name "yo"
                                                          :ident               (get expr-idents "yo")}
                                                      vector? 7]]}
                                      {:joins [{:alias "a_join"
                                                :ident jid1}
                                               {:alias "another_join"
                                                :ident jid2}]}]}
                exp-legacy  {:query {:source-query {:aggregation-idents agg-idents
                                                    :breakout-idents    brk-idents
                                                    :expression-idents  expr-idents}
                                     :joins [{:alias "a_join"
                                              :ident jid1}
                                             {:alias "another_join"
                                              :ident jid2}]}}]
            (is (=? expected converted))

            (testing "and converted back to legacy"
              (is (=? exp-legacy (lib.convert/->legacy-MBQL converted))))

            (testing "edited without changing the idents"
              (let [[expr] (lib/expressions converted 0)
                    edited (lib/replace-clause converted 0 expr (lib/with-expression-name expr "new name"))]
                (is (=? (assoc-in expected [:stages 0 :expressions 0 1 :lib/expression-name] "new name")
                        edited))

                (testing "converted back to legacy"
                  (let [round-trip (lib.convert/->legacy-MBQL edited)
                        exp-edited (update-in exp-legacy [:query :source-query :expression-idents]
                                              update-keys (constantly "new name"))]
                    (is (=? exp-edited round-trip))

                    (testing "saved to appdb, preserving the idents"
                      (t2/update! :model/Card id {:dataset_query round-trip})
                      (let [{raw    :dataset_query} (t2/select-one :report_card :id id)
                            {cooked :dataset_query} (t2/select-one :model/Card  :id id)]
                        (doseq [ident (concat (vals agg-idents)
                                              (vals brk-idents)
                                              (vals expr-idents)
                                              [jid1 jid2])]
                          (is (number? (str/index-of raw ident))))
                        (is (=? exp-edited cooked))))))))))))))

(defn- nano-id? [x]
  (and (string? x)
       (boolean (re-matches #"^[A-Za-z0-9_-]{21}$" x))))

(def ^:private idents-randomized
  {:query {:joins        [{:ident nano-id?}
                          {:ident nano-id?}]
           :source-query {:aggregation-idents {0 nano-id?, 1 nano-id?}
                          :breakout-idents    {0 nano-id?, 1 nano-id?}
                          :expression-idents  {"yo" nano-id?}}}})

(def ^:private idents-backfilled
  {:query {:joins        [{:ident #"^join_[A-Za-z0-9_-]{21}@1__a_join"}
                          {:ident #"^join_[A-Za-z0-9_-]{21}@1__another_join"}]
           :source-query {:aggregation-idents {0 #"aggregation_[A-Za-z0-9_-]{21}@0__0"
                                               1 #"aggregation_[A-Za-z0-9_-]{21}@0__1"}
                          :breakout-idents    {0 #"breakout_[A-Za-z0-9_-]{21}@0__0"
                                               1 #"breakout_[A-Za-z0-9_-]{21}@0__1"}
                          :expression-idents  {"yo" #"expression_[A-Za-z0-9_-]{21}@0__yo"}}}})

(deftest ^:sequential ident-invariant-test-1a-two-cards-with-identical-queries
  (testing ":ident invariant: two cards with identical queries get unique idents"
    (mt/with-temp [:model/Card {id1 :id} {:name          "First card"
                                          :dataset_query (bare-query)}

                   :model/Card {id2 :id} {:name          "Second card"
                                          :dataset_query (bare-query)}]
      (testing "with randomized idents from initial insert"
        (let [{q1 :dataset_query} (t2/select-one :model/Card :id id1)
              {q2 :dataset_query} (t2/select-one :model/Card :id id2)]
          ;; Comparing the diff here implies (1) they are different, and (2) each one matches the pattern.
          (is (=? [idents-randomized idents-randomized some?]
                  (data/diff q1 q2)))))

      (testing "with :idents removed from one card"
        ;; Strip the idents off `id1`. update! does not populate idents like insert! does.
        (t2/update! :model/Card id1 {:dataset_query (bare-query)})
        (let [{q1 :dataset_query} (t2/select-one :model/Card :id id1)
              {q2 :dataset_query} (t2/select-one :model/Card :id id2)]
          (is (=? idents-backfilled q1))
          (is (=? idents-randomized q2))))

      (testing "with :idents removed from both cards"
        ;; Strip the idents off `id2` as well.
        (t2/update! :model/Card id2 {:dataset_query (bare-query)})
        (let [{q1 :dataset_query} (t2/select-one :model/Card :id id1)
              {q2 :dataset_query} (t2/select-one :model/Card :id id2)]
          ;; Using diff again: implies that they're different, and that both match `idents-backfilled`.
          (is (=? [idents-backfilled idents-backfilled some?]
                  (data/diff q1 q2))))))))

(deftest ^:sequential ident-invariant-test-1b-agg-in-two-stages
  (testing ":ident invariant: two identical aggregations in different stages get unique idents"
    (let [query (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-query {:source-table $$orders
                                             :aggregation  [[:count]]}
                              :aggregation  [[:count]]}})]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query query}]
        (testing "with randomized idents from initial insert"
          (let [query (->> (t2/select-one :model/Card :id id) :dataset_query :query)]
            (is (=? nano-id? (get-in query [:aggregation-idents 0])))
            (is (=? nano-id? (get-in query [:source-query :aggregation-idents 0])))
            (is (not= (get-in query [:aggregation-idents 0])
                      (get-in query [:source-query :aggregation-idents 0])))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query query})
          (let [query (->> (t2/select-one :model/Card :id id) :dataset_query :query)]
            (is (=? #"aggregation_[A-Za-z0-9_-]{21}@1__0" (get-in query [:aggregation-idents 0])))
            (is (=? #"aggregation_[A-Za-z0-9_-]{21}@0__0" (get-in query [:source-query :aggregation-idents 0])))
            (is (not= (get-in query [:aggregation-idents 0])
                      (get-in query [:source-query :aggregation-idents 0])))))))))

(deftest ^:sequential ident-invariant-test-1c-duplicate-aggs
  (testing ":ident invariant: two identical aggregations in one stage get unique idents"
    (let [query (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-table $$orders
                              :aggregation  [[:count] [:count]]}})]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query query}]
        (testing "with randomized idents from initial insert"
          (let [{ident0 0
                 ident1 1} (->> (t2/select-one :model/Card :id id) :dataset_query :query :aggregation-idents)]
            (is (=? nano-id? ident0))
            (is (=? nano-id? ident1))
            (is (not= ident0 ident1))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query query})
          (let [{ident0 0
                 ident1 1} (->> (t2/select-one :model/Card :id id) :dataset_query :query :aggregation-idents)]
            (is (=? #"aggregation_[A-Za-z0-9_-]{21}@0__0" ident0))
            (is (=? #"aggregation_[A-Za-z0-9_-]{21}@0__1" ident1))
            (is (not= ident0 ident1))))))))

(deftest ^:sequential ident-invariant-test-1d-time-granularity
  (testing ":ident invariant: two breakouts with different time granularity get unique idents"
    (let [query (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-table $$orders
                              :aggregation  [[:count]]
                              :breakout     [!month.created_at !day.created_at]}})]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query query}]
        (testing "with randomized idents from initial insert"
          (let [{{agg0 0} :aggregation-idents
                 {brk0 0
                  brk1 1} :breakout-idents} (->> (t2/select-one :model/Card :id id) :dataset_query :query)]
            (is (=? nano-id? agg0))
            (is (=? nano-id? brk0))
            (is (=? nano-id? brk1))
            (is (= 3 (count #{agg0 brk0 brk1})))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query query})
          (let [{{agg0 0} :aggregation-idents
                 {brk0 0
                  brk1 1} :breakout-idents} (->> (t2/select-one :model/Card :id id) :dataset_query :query)]
            (is (=? #"aggregation_[A-Za-z0-9_-]{21}@0__0" agg0))
            (is (=? #"breakout_[A-Za-z0-9_-]{21}@0__0"    brk0))
            (is (=? #"breakout_[A-Za-z0-9_-]{21}@0__1"    brk1))
            (is (= 3 (count #{agg0 brk0 brk1})))))))))

(deftest ^:sequential ident-invariant-test-2a-new-clause-random-ident
  (testing ":ident invariant: a new clause keeps its randomized ident"
    (let [base  (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-table $$orders
                              :aggregation  [[:count]]
                              :breakout     [!month.created_at]}})
          touch (fn [query]
                  (-> (lib/query (lib.metadata.jvm/application-database-metadata-provider (mt/id)) query)
                      (lib/aggregate (lib/sum (meta/field-metadata :orders :subtotal)))
                      lib.convert/->legacy-MBQL))]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query base}]
        (testing "with randomized idents from initial insert"
          (let [original  (:dataset_query (t2/select-one :model/Card :id id))
                modified  (touch original)
                new-ident (get-in modified [:query :aggregation-idents 1])
                _         (t2/update! :model/Card id {:dataset_query modified})
                reread    (:dataset_query (t2/select-one :model/Card :id id))]
            (is (= modified reread))
            ;; Expects a diff with nothing removed, and only the new aggregation and its ident added.
            (is (=? [nil
                     {:query {:aggregation   [nil [:sum some?]]
                              :aggregation-idents {1 new-ident}}}
                     some?]
                    (data/diff original modified)))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query base})
          (let [original  (:dataset_query (t2/select-one :model/Card :id id))
                modified  (touch original)
                new-ident (get-in modified [:query :aggregation-idents 1])
                _         (t2/update! :model/Card id {:dataset_query modified})
                reread    (:dataset_query (t2/select-one :model/Card :id id))]
            (is (= modified reread))
            (is (nano-id? new-ident))
            ;; Expects a diff with nothing removed, and only the new aggregation and its ident added.
            (is (=? [nil
                     {:query {:aggregation   [nil [:sum some?]]
                              :aggregation-idents {1 new-ident}}}
                     some?]
                    (data/diff original modified)))))))))

(deftest ^:sequential ident-invariant-test-2b-removed-clause
  (testing ":ident invariant: removing a clause preserves other idents - EVEN IF they encode now-incorrect indexes!"
    (let [base  (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-table $$orders
                              :aggregation  [[:count] [:sum $subtotal]]
                              :breakout     [!month.created_at $products.category]}})
          touch (fn [query]
                  (let [converted (lib/query (lib.metadata.jvm/application-database-metadata-provider (mt/id)) query)
                        [agg0]    (lib/aggregations converted)
                        [brk0]    (lib/breakouts converted)]
                    (-> converted
                        (lib/remove-clause agg0)
                        (lib/remove-clause brk0)
                        lib.convert/->legacy-MBQL)))]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query base}]
        (testing "with randomized idents from initial insert"
          (let [original   (:dataset_query (t2/select-one :model/Card :id id))
                modified   (touch original)
                _          (t2/update! :model/Card id {:dataset_query modified})
                reread     (:dataset_query (t2/select-one :model/Card :id id))
                agg-idents (-> original :query :aggregation-idents)
                brk-idents (-> original :query :breakout-idents)]
            (is (= modified reread))
            (is (= 2
                   (-> agg-idents vals set count)
                   (-> brk-idents vals set count)))
            ;; NOTE: What were previously the 1st clauses is now 0th; their idents have not changed.
            (is (= {0 (get agg-idents 1)}
                   (-> modified :query :aggregation-idents)))
            (is (= {0 (get brk-idents 1)}
                   (-> modified :query :breakout-idents)))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query base})
          (let [original   (:dataset_query (t2/select-one :model/Card :id id))
                modified   (touch original)
                _          (t2/update! :model/Card id {:dataset_query modified})
                reread     (:dataset_query (t2/select-one :model/Card :id id))
                agg-idents (-> original :query :aggregation-idents)
                brk-idents (-> original :query :breakout-idents)]
            (is (= modified reread))
            (is (= 2
                   (-> agg-idents vals set count)
                   (-> brk-idents vals set count)))
            ;; NOTE: What were previously the 1st clauses is now 0th; their idents have not changed.
            (is (= {0 (get agg-idents 1)}
                   (-> modified :query :aggregation-idents)))
            (is (= {0 (get brk-idents 1)}
                   (-> modified :query :breakout-idents)))

            ;; Specific check: the backfilled idents "enshrine" a now-incorrect index forever; that's okay!
            (is (=? {0 #"aggregation_[A-Za-z0-9_-]{21}@0__1"}
                    (-> modified :query :aggregation-idents)))
            (is (=? {0 #"breakout_[A-Za-z0-9_-]{21}@0__1"}
                    (-> modified :query :breakout-idents)))))))))

(deftest ^:sequential ident-invariant-test-2c-edit-would-change-ident-but-does-not
  (testing ":ident invariant: removing a clause preserves other idents - EVEN IF they encode now-incorrect indexes!"
    (let [name1 "tax rate"
          name2 "My name is Michael J. Caboose and I HATE TAXES!!!"
          base  (mt/$ids orders
                  {:database (mt/id)
                   :type     :query
                   :query    {:source-table $$orders
                              :expressions  {name1 [:/ $tax $subtotal]}}})
          touch (fn [query]
                  (let [converted (lib/query (lib.metadata.jvm/application-database-metadata-provider (mt/id)) query)
                        [expr]    (lib/expressions converted)]
                    (-> converted
                        (lib/replace-clause expr (lib/with-expression-name expr name2))
                        lib.convert/->legacy-MBQL)))]
      (mt/with-temp [:model/Card {id :id} {:name          "The card"
                                           :dataset_query base}]
        (testing "with randomized idents from initial insert"
          (let [original (:dataset_query (t2/select-one :model/Card :id id))
                modified (touch original)
                _        (t2/update! :model/Card id {:dataset_query modified})
                reread   (:dataset_query (t2/select-one :model/Card :id id))
                idents   (-> original :query :expression-idents)]
            (is (= modified reread))
            (is (= {name2 (get idents name1)}
                   (-> modified :query :expression-idents)))
            (is (=? {name1 nano-id?} idents))))

        (testing "with :idents backfilled"
          ;; Strip the idents off `id`. update! does not populate idents like insert! does.
          (t2/update! :model/Card id {:dataset_query base})
          (let [original (:dataset_query (t2/select-one :model/Card :id id))
                modified (touch original)
                _        (t2/update! :model/Card id {:dataset_query modified})
                reread   (:dataset_query (t2/select-one :model/Card :id id))
                idents   (-> original :query :expression-idents)]
            (is (= modified reread))
            (is (= {name2 (get idents name1)}
                   (-> modified :query :expression-idents)))
            ;; NOTE: Both the original and modified queries use the original ident for the expression, even though
            ;; it "enshrines" the original expression name forever! This is intentional - idents should never change.
            (is (=? {name1 #"expression_[A-Za-z0-9_-]{21}@0__tax rate"} idents))
            (is (=? {name2 #"expression_[A-Za-z0-9_-]{21}@0__tax rate"}
                    (-> modified :query :expression-idents)))))))))
