import { SupabaseClient } from "@supabase/supabase-js";
import { generateTableService } from "./services/table.service";
import { generateViewService } from "./services/view.service";
import { generateFunctionService } from "./services/function.service";
import { OrmInterface } from "./types/interface";
import { DatabaseStructure } from "./types/supaorm.types";

class SupaORM_Instance<Database extends DatabaseStructure>
  implements OrmInterface<Database>
{
  public readonly TableService: ReturnType<
    typeof generateTableService<Database>
  >;
  public readonly ViewService: ReturnType<typeof generateViewService<Database>>;
  public readonly FunctionService: ReturnType<
    typeof generateFunctionService<Database>
  >;
  protected supabaseClient: SupabaseClient<Database> | null = null;

  public get supabase(): SupabaseClient<Database> {
    if (!this.supabaseClient) throw "Supabase client not initialized yet";
    return this.supabaseClient;
  }

  /**
   * Initializes the SupaORM instance with a SupabaseClient, this must happen before any queries can be made
   *
   * @param supabaseClient
   * @returns SupaORM_Instance
   */
  public init(supabaseClient: SupabaseClient<Database>) {
    this.supabaseClient = supabaseClient;
    return this;
  }

  public constructor() {
    this.TableService = generateTableService<Database>(this);
    this.ViewService = generateViewService<Database>(this);
    this.FunctionService = generateFunctionService<Database>(this);
  }
}

let instance: SupaORM_Instance<any> | null = null;

/**
 * Returns a singleton instance of SupaORM. The initializion is delayed to allow you to pass in the Supabase client
 * at the appropriate place in the code, but the init() method must be called before any queries can be made.
 *
 * @returns SupaORM_Instance
 */
export default function SupaORM<
  Database extends DatabaseStructure,
>(): SupaORM_Instance<Database> {
  if (instance !== null) return instance;
  instance = new SupaORM_Instance<Database>();
  return instance;
}
