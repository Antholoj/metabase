(ns metabase.lib.test-util.macros
  (:require
   [clojure.test :refer [testing]]
   [metabase.lib.metadata.overhaul :as lib.metadata.overhaul]
   [metabase.lib.test-util.macros.impl :as lib.tu.macros.impl]
   [metabase.test.data.mbql-query-impl :as mbql-query-impl]))

(defn- do-with-bindings [thunk]
  (binding [mbql-query-impl/*id-fn-symb*              'metabase.lib.test-metadata/id
            mbql-query-impl/*field-name-fn-symb*      `lib.tu.macros.impl/field-name
            mbql-query-impl/*field-base-type-fn-symb* `lib.tu.macros.impl/field-base-type]
    (thunk)))

(defmacro $ids
  "MLv2 version of [[metabase.test/$ids]] that uses the [[metabase.lib.test-metadata]] rather than the application
  database."
  {:style/indent :defn}
  ([form]
   `($ids nil ~form))

  ([table-name & body]
   (do-with-bindings #(mbql-query-impl/parse-tokens table-name `(do ~@body)))))

(defmacro mbql-query
  "MLv2 version of [[metabase.test/mbql-query]] that uses the [[metabase.lib.test-metadata]] rather than the application
  database."
  {:style/indent :defn}
  ([table-name]
   `(mbql-query ~table-name {}))

  ([table-name inner-query]
   {:pre [(map? inner-query)]}
   (do-with-bindings
    #(as-> inner-query <>
       (mbql-query-impl/parse-tokens table-name <>)
       (mbql-query-impl/maybe-add-source-table <> table-name)
       (mbql-query-impl/wrap-populate-idents <>)
       (mbql-query-impl/wrap-inner-query <>)
       (vary-meta <> assoc :type :mbql-query)))))

(defmacro with-testing-against-standard-queries
  "Tests against a number of named expressions that all produce the same columns through different methods."
  [sym & body]
  `(let [queries# [:query-with-implicit-joins
                   (-> (lib/query meta/metadata-provider (meta/table-metadata :orders))
                       (lib/append-stage))
                   :query-with-explicit-table-joins
                   (-> (lib/query meta/metadata-provider (meta/table-metadata :orders))
                       (lib/join (meta/table-metadata :people))
                       (lib/join (meta/table-metadata :products))
                       (lib/append-stage))
                   :query-with-explicit-sub-query-joins
                   (-> (lib/query meta/metadata-provider (meta/table-metadata :orders))
                       (lib/join (lib/join-clause (lib/query meta/metadata-provider (meta/table-metadata :people))))
                       (lib/join (lib/join-clause (lib/query meta/metadata-provider (meta/table-metadata :products))))
                       (lib/append-stage))
                   :query-with-table-joins-from-cards
                   (-> (lib/query meta/metadata-provider (meta/table-metadata :orders))
                       (lib/join (lib/join-clause (lib.tu/query-with-stage-metadata-from-card
                                                   meta/metadata-provider
                                                   (:people (lib.tu/mock-cards)))
                                                  [(lib/= (meta/field-metadata :orders :user-id)
                                                          (meta/field-metadata :people :id))]))
                       (lib/join (lib/join-clause (lib.tu/query-with-stage-metadata-from-card
                                                   meta/metadata-provider
                                                   (:products (lib.tu/mock-cards)))
                                                  [(lib/= (meta/field-metadata :orders :product-id)
                                                          (meta/field-metadata :products :id))]))
                       (lib/append-stage))
                   :query-with-source-card-joins
                   (-> (lib/query (lib.tu/metadata-provider-with-mock-cards) (meta/table-metadata :orders))
                       (lib/join (lib/join-clause (:people (lib.tu/mock-cards))
                                                  [(lib/= (meta/field-metadata :orders :user-id)
                                                          (meta/field-metadata :people :id))]))
                       (lib/join (lib/join-clause (:products (lib.tu/mock-cards))
                                                  [(lib/= (meta/field-metadata :orders :product-id)
                                                          (meta/field-metadata :products :id))]))
                       (lib/append-stage))]]
     (testing "Against set of standard queries."
       (doseq [[idx# [query-name# q#]] (map-indexed vector (partition-all 2 queries#))
               :let [~(symbol sym) q#]]
         (testing (str query-name# " (" idx# ")")
           ~@body)))))

(defmacro with-refs-overhaul
  "Runs the test body with both old refs and new refs enabled.

  To make the test expectations or inputs differ between the two, test [[lib.metadata.overhaul/old-refs?]]
  or [[lib.metadata.overhaul/new-refs?]] or use [[lib.metadata.overhaul/old-new]] to choose between two values.

  If the body is quite different between the two states, prefer separate [[with-new-refs]] and [[with-old-refs]]
  clauses."
  [& body]
  `(doseq [[label# setting#] [["\nwith old refs" :old-only]
                              ["\nwith new refs" :new-only]]]
     (testing label#
       (binding [lib.metadata.overhaul/*overhaul-selector* setting#]
         ~@body))))

(defmacro with-new-refs
  "Runs `body` with new refs enabled, regardless of the global setting."
  [& body]
  `(testing "\nwith new refs"
     (binding [lib.metadata.overhaul/*overhaul-selector* :new-only]
       ~@body)))

(defmacro with-old-refs
  "Runs `body` with old refs enabled, regardless of the global setting."
  [& body]
  `(testing "\nwith old refs"
     (binding [lib.metadata.overhaul/*overhaul-selector* :old-only]
       ~@body)))
