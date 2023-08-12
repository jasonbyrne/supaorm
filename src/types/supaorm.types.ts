import type { SupabaseClient } from "@supabase/supabase-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import { ListResult } from "./query.types";

export type SchemaName = "public";
export type DatabaseStructure = {
  public: GenericSchema;
};

export type Supabase<Db extends DatabaseStructure> = SupabaseClient<Db>;

export type ValidTableOrViewName<Db extends DatabaseStructure> = string &
  (keyof Db[SchemaName]["Views"] | keyof Db[SchemaName]["Tables"]);

export type TableOrView<Db extends DatabaseStructure, Name extends string> =
  | Db[SchemaName]["Views"][Name]
  | Db[SchemaName]["Tables"][Name];

export type SomeService = {
  findMany: () => Promise<any>;
  findOne: (id: any) => Promise<any>;
};

export type ListOf<T extends SomeService> = ListResult<RowOf<T>>;
export type RowOf<T extends SomeService> = Awaited<
  NonNullable<ReturnType<T["findOne"]>>
>;
