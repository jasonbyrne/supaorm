import type { SupabaseClient } from "@supabase/supabase-js";
import { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";

export type SchemaName = "public";
export type DatabaseStructure = {
  public: GenericSchema;
};

export type Supabase<Db extends DatabaseStructure> = SupabaseClient<Db>;
