import type { SupabaseClient } from "@supabase/supabase-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import { ListResult } from "./query.types";

export type SchemaName = "public";
export type DatabaseStructure = {
  public: GenericSchema;
};

export type Supabase<Db extends DatabaseStructure> = SupabaseClient<Db>;

export type SomeService = {
  findMany: () => Promise<any>;
  findOne: (id: any) => Promise<any>;
};

export type ListOf<T extends SomeService> = ListResult<RowOf<T>>;
export type RowOf<T extends SomeService> = Awaited<
  NonNullable<ReturnType<T["findOne"]>>
>;
