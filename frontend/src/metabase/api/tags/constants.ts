export type TagType = (typeof TAG_TYPES)[number];

export const TAG_TYPES = [
  "action",
  "alert",
  "aliases",
  "api-key",
  "bookmark",
  "card",
  "cloud-migration",
  "channel",
  "collection",
  "dashboard",
  "dashboard-question-candidates",
  "database",
  "field",
  "field-values",
  "indexed-entity",
  "model-index",
  "parameter-values",
  "permissions-group",
  "persisted-info",
  "persisted-model",
  "revision",
  "schema",
  "segment",
  "snippet",
  "subscription",
  "subscription-channel",
  "table",
  "task",
  "timeline",
  "timeline-event",
  "user",
  "public-dashboard",
  "embed-dashboard",
  "public-card",
  "embed-card",
  "public-action",
  "user-key-value",
] as const;

export const TAG_TYPE_MAPPING = {
  collection: "collection",
  card: "card",
  dashboard: "dashboard",
  database: "database",
  "indexed-entity": "indexed-entity",
  table: "table",
  dataset: "card",
  action: "action",
  segment: "segment",
  metric: "card",
  snippet: "snippet",
  pulse: "subscription",
} as const;
