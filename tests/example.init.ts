import SupaOrm from "../src/supaorm";
import { Database } from "./example.schema";

const orm = SupaOrm<Database>();
export default orm;
