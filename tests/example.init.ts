import { Database } from "./example.schema";
import supabase from "./supabase";
import SupaORM from "../src";

const orm = SupaORM<Database>().init(supabase);

export default orm;
