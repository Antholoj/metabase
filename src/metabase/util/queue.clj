(ns metabase.util.queue
  (:require
   [metabase.util :as u]
   [metabase.util.log :as log]
   [metabase.util.malli :as mu]
   [metabase.util.malli.registry :as mr]
   [metabase.util.malli.schema :as ms])
  (:import
   (java.time Duration Instant)
   (java.util.concurrent ArrayBlockingQueue BlockingQueue DelayQueue Delayed ExecutorService Executors SynchronousQueue TimeUnit)
   (org.apache.commons.lang3.concurrent BasicThreadFactory$Builder)))

(set! *warn-on-reflection* true)

(defprotocol BoundedTransferQueue
  (maybe-put! [queue msg]
    "Put a message on the queue if there is space for it, otherwise drop it.
     Returns whether the item was enqueued.")
  (blocking-put! [queue timeout msg]
    "Put a message on the queue. If necessary, block until there is space for it.")
  (blocking-take! [queue timeout]
    "Take a message off the queue, blocking if necessary.")
  (clear! [queue]
    "Discard all messages on the given queue."))

;; Similar to java.util.concurrent.LinkedTransferQueue, but bounded.
(deftype ^:private ArrayTransferQueue [^ArrayBlockingQueue async-queue
                                       ^SynchronousQueue sync-queue
                                       ^long block-ms
                                       ^long sleep-ms]
  BoundedTransferQueue
  (maybe-put! [_ msg]
    (.offer async-queue msg))
  (blocking-put! [_ timeout msg]
    (.offer sync-queue msg timeout TimeUnit/MILLISECONDS))
  (blocking-take! [_ timeout]
    (loop [time-remaining timeout]
      (when (pos? time-remaining)
        ;; Async messages are given higher priority, as sync messages will never be dropped.
        (or (.poll async-queue)
            (.poll sync-queue block-ms TimeUnit/MILLISECONDS)
            (do (Thread/sleep ^long sleep-ms)
                ;; This is an underestimate, as the thread may have taken a while to wake up. That's OK.
                (recur (- time-remaining block-ms sleep-ms)))))))
  (clear! [_]
    (.clear sync-queue)
    (.clear async-queue)))

(defn bounded-transfer-queue
  "Create a bounded transfer queue, specialized based on the high-level options."
  [capacity & {:keys [block-ms sleep-ms]
               :or   {block-ms 100
                      sleep-ms 100}}]
  (->ArrayTransferQueue (ArrayBlockingQueue. capacity)
                        (SynchronousQueue.)
                        block-ms
                        sleep-ms))

(defrecord DelayValue [value ^Instant ready-at]
  Delayed
  (getDelay [_ unit]
    (.convert unit (- (.toEpochMilli ready-at) (System/currentTimeMillis)) TimeUnit/MILLISECONDS))
  (compareTo [this other]
    (Long/compare (.getDelay this TimeUnit/MILLISECONDS)
                  (.getDelay ^Delayed other TimeUnit/MILLISECONDS))))

(defn delay-queue
  "Return an unbounded queue that returns each item only after some specified delay."
  ^DelayQueue []
  (DelayQueue.))

(defn put-with-delay!
  "Put an item on a delay queue, with a delay given in milliseconds."
  [^DelayQueue queue delay-ms value]
  (.offer queue (->DelayValue value (.plus (Instant/now) (Duration/ofMillis delay-ms)))))

(defn- take-batch* [^BlockingQueue queue ^long max-messages ^long latest-time acc]
  (loop [acc acc]
    (let [remaining-ms (- latest-time (System/currentTimeMillis))]
      (if (or (neg? remaining-ms) (>= (count acc) max-messages))
        acc
        (if-let [item (.poll queue remaining-ms TimeUnit/MILLISECONDS)]
          (recur (conj acc
                       (if (instance? DelayQueue queue)
                         (:value item)
                         item)))
          (not-empty acc))))))

(def ^:dynamic *take-batch-wait-ms*
  "Time to wait for the first message to be available in take-batch! in milliseconds."
  Long/MAX_VALUE)

(defn take-batch!
  "Get a batch of messages off the given queue.
  Will wait for the first message to be available, then will collect up to max-messages in max-batch-ms, whichever comes first.
  For convenience, if the queue is a DelayQueue, the returned values will be the actual values, not the Delay objects.

  By default, will wait indefinitely for the first message, but that can be controlled with *take-batch-wait-ms*."
  ([^BlockingQueue queue ^long max-batch-messages ^long max-batch-ms]
   (when-let [fst (.poll queue *take-batch-wait-ms* TimeUnit/MILLISECONDS)]
     (take-batch* queue max-batch-messages (+ (System/currentTimeMillis) max-batch-ms) [(if (instance? DelayQueue queue) (:value fst) fst)]))))

(defonce ^:private listeners (atom {}))

(mr/def ::listener-options [:map [:success-handler {:optional true} [:=> [:cat :any :double :string] :any]
                                  :err-handler {:optional true} [:=> [:cat [:fn (ms/InstanceOfClass Throwable) :string]] :any]
                                  :pool-size {:optional true} number?
                                  :max-batch-messages {:optional true} number?
                                  :max-batch-ms {:optional true} number?]])

(defn listener-exists?
  "Returns true if there is a running listener with the given name"
  [listener-name]
  (contains? @listeners listener-name))

(mu/defn- listener-thread [listener-name :- :string
                           queue :- (ms/InstanceOfClass BlockingQueue)
                           handler :- [:=> [:cat [:sequential :any]] :any]
                           {:keys [success-handler err-handler max-batch-messages max-batch-ms]} :- ::listener-options]
  (log/infof "Listener %s started" listener-name)
  (while true
    (try
      (log/debugf "Listener %s waiting for next batch..." listener-name)
      (let [batch (take-batch! queue max-batch-messages max-batch-ms)]
        (if (seq batch)
          (do
            (log/debugf "Listener %s processing batch of %d" listener-name (count batch))
            (log/tracef "Listener %s processing batch: %s" listener-name batch)
            (let [timer (u/start-timer)
                  output (handler batch)
                  duration (u/since-ms timer)]
              (log/debugf "Listener %s processed batch in %.0fms" listener-name duration)
              (success-handler output duration listener-name)))
          (log/debugf "Listener %s found no items to process" listener-name)))
      (catch InterruptedException e
        (log/infof "Listener %s interrupted" listener-name)
        (throw e))
      (catch Exception e
        (err-handler e listener-name)
        (log/errorf e "Error in %s while processing batch" listener-name))))
  (log/infof "Listener %s stopped" listener-name))

(mu/defn listen!
  "Starts an async listener on the given queue.

  Arguments:
  - listener-name: A unique string. Calls to register another listener with the same name will be a no-op
  - queue: The queue to listen on
  - handler: A function taking a list of 1 or more values that have been sent to the queue.

  Options:
  - success-handler: A function called when handler does not throw an exception. Accepts [result-of-handler, duration-in-ms, listener-name]
  - err-handler: A function called when the handler throws an exception. Accepts [exception, duration-in-ms, listener-name]
  - pool-size: Number of threads in the listener. Default: 1
  - max-batch-messages: Max number of items to batch up before calling handler. Default 50
  - max-batch-ms: Max number of ms to let queued items collect before calling the handler. Default 100"
  [listener-name :- :string
   queue :- (ms/InstanceOfClass BlockingQueue)
   handler :- [:=> [:cat [:sequential :any]] :any]
   {:keys [success-handler
           err-handler
           pool-size
           max-batch-messages
           max-batch-ms]
    :or   {success-handler (constantly nil)
           err-handler (constantly nil)
           pool-size       1
           max-batch-messages 50
           max-batch-ms     100}} :- ::listener-options]
  (if (listener-exists? listener-name)
    (log/errorf "Listener %s already exists" listener-name)

    (let [executor (Executors/newFixedThreadPool
                    pool-size
                    (.build
                     (doto (BasicThreadFactory$Builder.)
                       (.namingPattern (str "queue-" listener-name "-%d"))
                       (.daemon true))))]
      (log/infof "Starting listener %s with %d threads" listener-name pool-size)
      (.addShutdownHook
       (Runtime/getRuntime)
       (Thread. ^Runnable (fn []
                            (.shutdownNow ^ExecutorService executor)
                            (try
                              (.awaitTermination ^ExecutorService executor 30 TimeUnit/SECONDS)
                              (catch InterruptedException _
                                (log/warn (str "Interrupted while waiting for " listener-name "executor to terminate")))))))

      (dotimes [_ pool-size]
        (.submit ^ExecutorService executor ^Callable #(listener-thread listener-name queue handler
                                                                       {:success-handler  success-handler
                                                                        :err-handler     err-handler
                                                                        :max-batch-messages max-batch-messages
                                                                        :max-batch-ms     max-batch-ms})))

      (swap! listeners assoc listener-name executor))))

(mu/defn stop-listening!
  "Stops the listener previously started with (listen!).
  If there is no running listener with the given name, it is a no-op"
  [listener-name :- :string]
  (if-let [executor (get @listeners listener-name)]
    (do
      (log/infof "Stopping listener %s..." listener-name)
      (.shutdownNow ^ExecutorService executor)
      (.awaitTermination ^ExecutorService executor 30 TimeUnit/SECONDS)

      (swap! listeners dissoc listener-name)
      (log/infof "Stopping listener %s...done" listener-name))
    (log/infof "No running listener named %s" listener-name)))
