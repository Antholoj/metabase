(ns metabase.util.string
  "Util for building strings"
  (:require
   [clojure.string :as str]
   [metabase.util.i18n :refer [deferred-tru]]))

(set! *warn-on-reflection* true)

(defn build-sentence
  "Join parts of a sentence together to build a compound one.

  Options:
  - stop? (default true): whether to add a period at the end of the sentence

  Examples:

    (build-sentence [\"foo\" \"bar\" \"baz\"]) => \"foo, bar and baz.\"

    (build-sentence [\"foo\" \"bar\" \"baz\"] :stop? false) => \"foo, bar and baz\"

  Note: this assumes we're building a sentence with parts from left to right,
  It might not works correctly with right-to-left language.
  Also not all language uses command and \"and\" to represting 'listing'."
  ([parts]
   (build-sentence parts :stop? true))
  ([parts & {:keys [stop?]
             :or   {stop? true}
             :as options}]
   (when (seq parts)
     (cond
       (= (count parts) 1) (str (first parts) (when stop? \.))
       (= (count parts) 2) (str (first parts) " " (deferred-tru "and")  " " (second parts) (when stop? \.))
       :else               (str (first parts) ", " (build-sentence (rest parts) options))))))

(defn mask
  "Mask string value behind 'start...end' representation.

  First four and last four symbols are shown. Even less if string is shorter
  than 8 chars."
  ([s]
   (mask s 4))
  ([s start-limit]
   (mask s start-limit 4))
  ([s start-limit end-limit]
   (if (str/blank? s)
     s
     (let [cnt (count s)]
       (str
        (subs s 0 (max 1 (min start-limit (- cnt 2))))
        "..."
        (when (< (+ end-limit start-limit) cnt)
          (subs s (- cnt end-limit) cnt)))))))

(defn valid-uuid?
  "True if the given string is formatted like a UUID"
  [s] (try (java.util.UUID/fromString s) true
           (catch Exception _e false)))

(defn elide
  "Elides the string to the specified length, adding '...' if it exceeds that length."
  [s max-length]
  (if (> (count s) max-length)
    (str (subs s 0 (- max-length 3)) "...")
    s))

(defn- remove-chars
  "Removes individual chars until it fits in the required bytes"
  [s max-bytes]
  (if (nil? s)
    s
    (loop [index (count s)]
      (let [truncated (subs s 0 index)
            bytes (.getBytes ^String truncated "UTF-8")]
        (if (<= (count bytes) max-bytes)
          truncated
          (recur (dec index)))))))

(defn limit-bytes
  "Limits the string to the given number of bytes, ensuring it's still a valid UTF-8 string"
  [s max-bytes]
  (if (nil? s)
    s
    (let [bytes (.getBytes ^String s "UTF-8")]
      (if (<= (count bytes) max-bytes)
        s
        ;; first do big first-pass at truncating, then truncate the rest of the way to preserve a valid string
        (remove-chars (String. (byte-array (take max-bytes bytes)) "UTF-8") max-bytes)))))

(defn random-string
  "Returns a string of `n` random alphanumeric characters.

  NOTE: this is not a cryptographically secure random string."
  [n]
  (apply str (take n (repeatedly #(rand-nth "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")))))
