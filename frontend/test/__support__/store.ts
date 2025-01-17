import type { Schema as NormalizrSchema } from "normalizr";
import { normalize } from "normalizr";

import {
  ActionSchema,
  CollectionSchema,
  DashboardSchema,
  DatabaseSchema,
  FieldSchema,
  QuestionSchema,
  SchemaSchema,
  SegmentSchema,
  SnippetSchema,
  TableSchema,
  UserSchema,
} from "metabase/schema";
import type {
  Alert,
  Card,
  Collection,
  Dashboard,
  Database,
  Field,
  NativeQuerySnippet,
  SavedQuestionDatabase,
  Schema,
  Segment,
  Table,
  User,
  WritebackAction,
} from "metabase-types/api";
import type { EntitiesState } from "metabase-types/store";
import { createMockNormalizedEntitiesState } from "metabase-types/store/mocks";

export interface EntitiesStateOpts {
  actions?: WritebackAction[];
  alerts?: Alert[];
  collections?: Collection[];
  dashboards?: Dashboard[];
  databases?: (Database | SavedQuestionDatabase)[];
  schemas?: Schema[];
  tables?: Table[];
  fields?: Field[];
  segments?: Segment[];
  snippets?: NativeQuerySnippet[];
  users?: User[];
  questions?: Card[];
}

const EntitiesSchema: Record<keyof EntitiesState, NormalizrSchema<any>> = {
  actions: [ActionSchema],
  alerts: [],
  collections: [CollectionSchema],
  dashboards: [DashboardSchema],
  databases: [DatabaseSchema],
  schemas: [SchemaSchema],
  tables: [TableSchema],
  fields: [FieldSchema],
  segments: [SegmentSchema],
  snippets: [SnippetSchema],
  users: [UserSchema],
  questions: [QuestionSchema],
};

export const createMockEntitiesState = (
  opts: EntitiesStateOpts,
): EntitiesState => {
  const schema = normalize(opts, EntitiesSchema);
  return {
    ...createMockNormalizedEntitiesState(),
    ...schema.entities,
  };
};
