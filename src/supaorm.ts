import { SupabaseClient } from "@supabase/supabase-js";
import { generateTableService } from "./table.service";
import type { DatabaseStructure } from "./types/supabase-schema.type";
import { generateViewService } from "./view.service";
import { generateFunctionService } from "./function.service";

const SupaOrm = <Database extends DatabaseStructure>(
  supabaseClient: SupabaseClient<Database>
) => {
  return {
    supabase: supabaseClient,
    TableService: generateTableService<Database>(supabaseClient),
    ViewService: generateViewService<Database>(supabaseClient),
    FunctionService: generateFunctionService<Database>(supabaseClient),
  };
};

export default SupaOrm;
