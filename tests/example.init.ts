import SupaOrm from "../src/supaorm";
import supabase from "./supabase";

const orm = SupaOrm(supabase);
export default orm;
