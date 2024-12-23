(ns metabase.test-runner.assert-exprs
  "Custom implementations of a few [[clojure.test/is]] expressions (i.e., implementations of [[clojure.test/assert-expr]]):
  `query=`.

  Other expressions (`re=`, `=?`, and so forth) are implemented with the Hawk test-runner."
  (:require
   [clojure.data :as data]
   [clojure.test :as t]
   [clojure.walk :as walk]
   [mb.hawk.assert-exprs.approximately-equal :as =?]
   [medley.core :as m]
   [metabase.test-runner.assert-exprs.malli-equals]
   [methodical.core :as methodical]))

(comment metabase.test-runner.assert-exprs.malli-equals/keep-me)

(defn derecordize
  "Convert all record types in `form` to plain maps, so tests won't fail."
  [form]
  (walk/postwalk
   (fn [form]
     (if (record? form)
       (into {} form)
       form))
   form))

(declare ^:private strip-generated-idents)

(defn- drop-idents-on-joins
  [joins original-joins generated-join-idents]
  ;; Recursively strip generated idents off the inner queries of joins!
  (let [joins (map strip-generated-idents joins original-joins)]
    (if (seq generated-join-idents)
      (map-indexed (fn [i join]
                     (cond-> join
                       (generated-join-idents i) (dissoc :ident)))
                   joins)
      joins)))

(defn- strip-generated-idents
  "Walk the query's stages, looking in the metadata of each stage for `:generated-idents`.

  That metadata contains sets of keys which were generated in `:aggregation-idents` etc."
  [inner-query original]
  (let [modified (if-let [{:generated-paths/keys [aggregation-idents
                                                  breakout-idents
                                                  expression-idents
                                                  join-idents]}      (-> original meta :generated-idents)]
                   (-> inner-query
                       (m/update-existing :aggregation-idents #(m/remove-keys aggregation-idents %))
                       (m/update-existing :breakout-idents    #(m/remove-keys breakout-idents %))
                       (m/update-existing :expression-idents  #(m/remove-keys expression-idents %))
                       (m/update-existing :joins              drop-idents-on-joins (:joins original) join-idents))
                   inner-query)]
    (cond-> modified
      (:source-query modified) (update :source-query strip-generated-idents (:source-query original)))))

(defn query=-report
  "Impl for [[t/assert-expr]] `query=`."
  [message expected actual]
  (let [expected (derecordize expected)
        actual   (-> (derecordize actual)
                     (m/update-existing :query strip-generated-idents (:query expected)))
        expected (m/update-existing expected :query strip-generated-idents (:query expected))
        pass?    (= expected actual)]
    (merge
     {:type     (if pass? :pass :fail)
      :message  message
      :expected expected
      :actual   actual}
     ;; don't bother adding names unless the test actually failed
     (when-not pass?
       (let [add-names (requiring-resolve 'dev.debug-qp/add-names)]
         {:expected (add-names expected)
          :actual   (add-names actual)
          :diffs    (let [[only-in-actual only-in-expected] (data/diff actual expected)]
                      [[(add-names actual) [(add-names only-in-expected) (add-names only-in-actual)]]])})))))

;; basically the same as normal `=` but will add comment forms to MBQL queries for Field clauses and source tables
;; telling you the name of the referenced Fields/Tables
;; Also ignores mismatched `:ident`s when the `expected` side's idents were generated by the mbql-query macro.
(defmethod t/assert-expr 'query=
  [message [_ expected & actuals]]
  `(do ~@(for [actual actuals]
           `(t/do-report
             (query=-report ~message ~expected ~actual)))))

(methodical/defmethod =?/=?-diff [:mbql-query :mbql-query]
  [expected actual]
  (let [actual   (m/update-existing actual   :query strip-generated-idents (:query expected))
        expected (m/update-existing expected :query strip-generated-idents (:query expected))]
    (=?/=?-diff (vary-meta expected dissoc :type) (vary-meta actual dissoc :type))))

(methodical/defmethod =?/=?-diff [:mbql-query :default]
  [expected actual]
  (let [expected (m/update-existing expected :query strip-generated-idents (:query expected))]
    (=?/=?-diff (vary-meta expected dissoc :type) (vary-meta actual dissoc :type))))

(methodical/defmethod =?/=?-diff [:default :mbql-query]
  [expected actual]
  (=?/=?-diff expected (vary-meta actual dissoc :type)))
