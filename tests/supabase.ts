import { createClient } from "@supabase/supabase-js";
import { Database } from "./example.schema";

// Instantiate Supabase client
const supabase = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL || "",
  process.env.PUBLIC_SUPABASE_ANON_KEY || ""
);

export default supabase;
