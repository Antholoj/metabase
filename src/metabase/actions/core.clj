(ns metabase.actions.core
  "API namespace for the `metabase.actions` module."
  (:require
   [metabase.actions.actions]
   [metabase.actions.error]
   [metabase.actions.events]
   [metabase.actions.execution]
   [metabase.actions.http-action]
   [metabase.actions.models]
   [potemkin :as p]))

(comment
  metabase.actions.actions/keep-me
  metabase.actions.error/keep-me
  metabase.actions.execution/keep-me
  metabase.actions.http-action/keep-me
  metabase.actions.models/keep-me)

(p/import-vars
 [metabase.actions.actions
  action-filter-keys
  cached-value
  check-actions-enabled!
  check-data-editing-enabled-for-database!
  perform-action!
  perform-action!*
  perform-with-system-events!]
 [metabase.actions.error
  incorrect-value-type
  violate-foreign-key-constraint
  violate-not-null-constraint
  violate-unique-constraint]
 [metabase.actions.execution
  execute-action!
  execute-dashcard!
  fetch-values]
 [metabase.actions.http-action
  apply-json-query]
 [metabase.actions.models
  dashcard->action
  select-action])
