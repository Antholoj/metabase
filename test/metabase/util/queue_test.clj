(ns metabase.util.queue-test
  (:require
   [clojure.set :as set]
   [clojure.test :refer [deftest is testing]]
   [metabase.test :as mt]
   [metabase.util :as u]
   [metabase.util.queue :as queue])
  (:import (java.time Duration Instant)
           (java.util.concurrent DelayQueue Delayed DelayQueue TimeUnit)))

(set! *warn-on-reflection* true)

(def ^:private timeout-ms 5000)

(defrecord DelayValue [value ^Instant ready-at]
  Delayed
  (getDelay [_ unit]
    (.convert unit (- (.toEpochMilli ready-at) (System/currentTimeMillis)) TimeUnit/MILLISECONDS))
  (compareTo [this other]
    (Long/compare (.getDelay this TimeUnit/MILLISECONDS)
                  (.getDelay ^Delayed other TimeUnit/MILLISECONDS))))

(defn- put-with-delay!
  "Put an item on the delay queue, with a delay given in milliseconds."
  [^DelayQueue queue delay-ms value]
  (.offer queue (->DelayValue value (.plus (Instant/now) (Duration/ofMillis delay-ms)))))

(defn- simulate-queue! [queue &
                        {:keys [realtime-threads realtime-events backfill-events]
                         :or   {realtime-threads 5}}]
  (let [sent          (atom 0)
        dropped       (atom 0)
        skipped       (atom 0)
        realtime-fn   (fn []
                        (let [id (rand-int 1000)]
                          (doseq [e realtime-events]
                            (case (queue/maybe-put! queue {:thread (str "real-" id) :payload e})
                              true  (swap! sent inc)
                              false (swap! dropped inc)
                              nil   (swap! skipped inc)))))
        background-fn (fn []
                        (doseq [e backfill-events]
                          (queue/blocking-put! queue timeout-ms {:thread "back", :payload e})))
        run!          (fn [f]
                        (future (f)))]

    (run! background-fn)
    (future
      (dotimes [_ realtime-threads]
        (run! realtime-fn)))

    (let [processed (volatile! [])]
      (try
        (while true
          ;; Stop the consumer once we are sure that there are no more events coming.
          (u/with-timeout timeout-ms
            (vswap! processed conj (:payload (queue/blocking-take! queue timeout-ms)))
            ;; Sleep to provide some backpressure
            (Thread/sleep 1)))
        (assert false "this is never reached")
        (catch Exception _
          {:processed @processed
           :sent      @sent
           :dropped   @dropped
           :skipped   @skipped})))))

(deftest bounded-transfer-queue-test
  (let [realtime-event-count 500
        backfill-event-count 1000
        capacity             (- realtime-event-count 100)
        ;; Enqueue background events from oldest to newest
        backfill-events      (range backfill-event-count)
        ;; Enqueue realtime events from newest to oldest
        realtime-events      (take realtime-event-count (reverse backfill-events))
        queue                (queue/bounded-transfer-queue capacity :sleep-ms 10 :block-ms 10)

        {:keys [processed sent dropped skipped] :as _result}
        (simulate-queue! queue
                         :backfill-events backfill-events
                         :realtime-events realtime-events)]

    (testing "We processed all the events that were enqueued"
      (is (= (+ (count backfill-events) sent)
             (count processed))))

    (testing "No items are skipped"
      (is (zero? skipped)))

    (testing "Some items are dropped"
      (is (pos? dropped)))

    (let [expected-events  (set (concat backfill-events realtime-events))
          processed-events (set processed)]
      (testing "All expected events are processed"
        (is (zero? (count (set/difference expected-events processed-events)))))
      (testing "There are no unexpected events processed"
        (is (zero? (count (set/difference processed-events expected-events))))))

    (testing "The realtime events are processed in order"
      (mt/ordered-subset? realtime-events processed))))

(deftest ^:synchronized take-batch-test
  (let [q (DelayQueue.)                                     ;using a delay queue to simulate a queue with intermittent messages
        n 5
        batch-size 3
        first-delay 300
        extra-delay 200
        buffer 50
        msg-delay #(+ first-delay (* extra-delay %))]
    (dotimes [i n]
      (put-with-delay! q (msg-delay i) i))
    ;; queue an outlier
    (put-with-delay! q (msg-delay 10) 10)
    (let [started-roughly (u/start-timer)
          since-start #(u/since-ms started-roughly)
          time-until-nth #(max 0 (+ buffer (- (msg-delay %) (since-start))))]
      (binding [queue/*take-batch-wait-ms* (time-until-nth 10)]
        (testing "Take-batch will wait for the first message to be ready"
          (is (= [0 1 2] (map :value (queue/take-batch! q batch-size (time-until-nth 3))))))
        (testing "Some time later we can read an additional batch of messages without any polling delay"
          (Thread/sleep ^long (time-until-nth n))
          (is (= [3 4] (map :value (queue/take-batch! q batch-size 0)))))
        (testing "Eventually the outlier is ready on its own"
          (is (= [10] (map :value (queue/take-batch! q batch-size (time-until-nth 10))))))
        (testing "Afterwards the queue is empty"
          (is (nil? (queue/take-batch! q batch-size 0))))))))

(defn- thread-name-running? [name]
  (some #(= name (.getName ^Thread %)) (keys (Thread/getAllStackTraces))))

(deftest listener-handler-test
  (testing "Standard behavior with a handler"
    (binding [queue/*take-batch-wait-ms* 500] ; keep the test from hanging
      (let [listener-name "test-listener"
            items-handled (atom 0)
            last-batch (atom nil)
            queue (queue/blocking-queue)
            thread-name "queue-test-listener-1"]
        (is (not (thread-name-running? thread-name)))

        (queue/listen! listener-name queue
                       (fn [batch] (swap! items-handled + (count batch)) (reset! last-batch batch))
                       {:max-next-ms 5})
        (is (thread-name-running? thread-name))

        (is (nil? (queue/listen! listener-name queue
                                 (fn [batch] (throw (ex-info "Second listener with the same name cannot be created" {:batch batch})))
                                 {:max-next-ms 5})))

        (queue/put! queue "a")
        (Thread/sleep 10)
        (is (= 1 @items-handled))
        (is (= ["a"] @last-batch))

        (queue/put! queue "b")
        (queue/put! queue "c")
        (queue/put! queue "d")
        (Thread/sleep 10)
        (is (= 4 @items-handled))
        (is (some #{"d"} @last-batch))

        (queue/stop-listening! listener-name)
        (is (not (thread-name-running? thread-name)))

        ; additional calls to stop are no-ops
        (is (nil? (queue/stop-listening! listener-name)))))))

(deftest result-listener-test
  (testing "When result and error handlers are defined, they are called correctly"
    (let [listener-name "test-result-listener"
          queue (queue/blocking-queue)
          result-count (atom 0)
          error-count (atom 0)
          last-error (atom nil)]
      (queue/listen! listener-name queue
                     (fn [batch] (if (some #{"err"} batch)
                                   (throw (ex-info "Test Error" {:batch batch}))
                                   (count batch)))
                     {:result-handler (fn [result duration name]
                                        (is (= listener-name name))
                                        (is (< 0 duration))
                                        (swap! result-count + result))
                      :err-handler    (fn [e] (swap! error-count inc) (reset! last-error e))
                      :max-next-ms    5})
      (queue/put! queue "a")
      (Thread/sleep 10)
      (is (= 0 @error-count))
      (is (= 1 @result-count))

      (queue/put! queue "err")
      (Thread/sleep 10)
      (is (= 1 @error-count))
      (is (= 1 @result-count))
      (is (= "Test Error" (.getMessage ^Exception @last-error)))

      (queue/stop-listening! listener-name))))

(deftest multithreaded-listener-test
  (testing "Test behavior with a multithreaded listener"
    (let [listener-name "test-multithreaded-listener"
          batches-handled (atom 0)
          handlers-used (atom #{})
          queue (queue/blocking-queue)]
      (is (not (thread-name-running? (str "queue-" listener-name "-1"))))
      (is (not (thread-name-running? (str "queue-" listener-name "-2"))))
      (is (not (thread-name-running? (str "queue-" listener-name "-3"))))

      (queue/listen! listener-name
                     queue
                     (fn [batch] (is (<= 10 (count batch))) (count batch))
                     {:result-handler  (fn [result _ name] (swap! batches-handled + result) (swap! handlers-used conj name))
                      :pool-size       3
                      :max-batch-messages 10
                      :max-next-ms     5})
      (is (thread-name-running? (str "queue-" listener-name "-1")))
      (is (thread-name-running? (str "queue-" listener-name "-2")))
      (is (thread-name-running? (str "queue-" listener-name "-3")))

      (dotimes [i 100]
        (queue/put! queue i))

      (Thread/sleep 100)
      (is (= 100 @batches-handled))
      (is (contains? @handlers-used listener-name))

      (queue/stop-listening! listener-name)
      (is (not (thread-name-running? (str "queue-" listener-name "-1"))))
      (is (not (thread-name-running? (str "queue-" listener-name "-2"))))
      (is (not (thread-name-running? (str "queue-" listener-name "-3")))))))
