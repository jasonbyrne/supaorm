import { SupabaseClient } from "@supabase/supabase-js";
import { generateTableService } from "../services/table.service";
import { generateViewService } from "../services/view.service";
import { generateFunctionService } from "../services/function.service";
import { DatabaseStructure } from "./supaorm.types";

export interface OrmInterface<Database extends DatabaseStructure> {
  supabase: SupabaseClient<Database>;
  init(supabaseClient: SupabaseClient<Database>): this;
  TableService: ReturnType<typeof generateTableService<Database>>;
  FunctionService: ReturnType<typeof generateFunctionService<Database>>;
  ViewService: ReturnType<typeof generateViewService<Database>>;
}
