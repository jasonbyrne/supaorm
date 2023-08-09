import { Database } from "./example.schema";
import SupaORM from "../src";
import supabase from "./supabase";

const orm = SupaORM<Database>();

orm.init(supabase);

export default orm;
