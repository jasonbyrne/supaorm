import { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseStructure } from "./supabase-schema.type";
import { generateTableService } from "../services/table.service";
import { generateViewService } from "../services/view.service";
import { generateFunctionService } from "../services/function.service";

export interface OrmInterface<Database extends DatabaseStructure> {
  supabase: SupabaseClient<Database>;
  init(supabaseClient: SupabaseClient<Database>): this;
  TableService: ReturnType<typeof generateTableService>;
  FunctionService: ReturnType<typeof generateFunctionService>;
  ViewService: ReturnType<typeof generateViewService>;
}
