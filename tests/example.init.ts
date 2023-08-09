import SupaOrm from "../src/supaorm";
import { Database } from "./example.schema";
import supabase from "./supabase";

const orm = SupaOrm<Database>().init(supabase);

export default orm;
