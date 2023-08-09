import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseStructure } from "./supabase-schema.type";

export interface OrmInterface<Database extends DatabaseStructure> {
  supabase: SupabaseClient<Database>;
}
