import { createClient } from "@supabase/supabase-js";
import { generateTableService } from "./table.service";
import type { DatabaseStructure } from "./types/supabase-schema.type";
import { generateViewService } from "./view.service";

export type SupaOrmOpts = {
  projectUrl?: string;
  anonKey: string;
};

const SupaOrm = <Db extends DatabaseStructure>(initOpts?: SupaOrmOpts) => {
  // Defaults options
  const opts = {
    ...initOpts,
    projectUrl: initOpts?.projectUrl || process.env.PUBLIC_SUPABASE_URL || "",
    anonKey: initOpts?.anonKey || process.env.PUBLIC_SUPABASE_ANON_KEY || "",
  };

  // Instantiate Supabase client
  const supabase = createClient<Db>(opts.projectUrl, opts.anonKey);

  return {
    getClient: () => supabase,
    TableService: generateTableService<Db>(supabase),
    ViewService: generateViewService<Db>(supabase),
  };
};

export default SupaOrm;
