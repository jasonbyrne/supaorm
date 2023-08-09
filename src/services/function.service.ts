import {
  FindManyFunctionQueryParams,
  FindOneFunctionQueryParams,
  FunctionArguments,
  FunctionList,
  FunctionRow,
  ValidFunctionName,
} from "../types/function.types";
import { OrmInterface } from "../types/interface";
import { DatabaseStructure, ListResult } from "../types/supaorm.types";
import { getResultsPagination } from "../utils/get-results-pagination";
import { getQueryPagination } from "../utils/get-query-pagination";

export const generateFunctionService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <FunctionName extends ValidFunctionName<Database>>(
    functionName: ValidFunctionName<Database>
  ) => {
    return class<
      ListSchema = FunctionList<Database, FunctionName>,
      RowSchema = FunctionRow<Database, FunctionName>,
    > {
      public ref(args: FunctionArguments<Database, FunctionName>) {
        return orm.supabase.rpc(functionName, args);
      }

      public async execute(args: FunctionArguments<Database, FunctionName>) {
        return this.ref(args);
      }

      public async findOne(
        args: FunctionArguments<Database, FunctionName>,
        query?: FindOneFunctionQueryParams
      ): Promise<RowSchema | null> {
        const sp = this.ref(args);
        if (query?.filters) {
          query.filters.forEach((filter) => {
            sp.filter(filter[0], filter[1], filter[2]);
          });
        }
        const result = await sp
          .select(query?.select || "*")
          .limit(1)
          .single();
        if (result.error) throw result.error;
        if (!result.data) return null;
        return result.data as RowSchema;
      }

      public async findMany<T = ListSchema>(
        args: FunctionArguments<Database, FunctionName>,
        query?: FindManyFunctionQueryParams
      ): Promise<ListResult<T>> {
        const pagination = getQueryPagination(
          query?.page || 1,
          query?.perPage || 50
        );
        try {
          const result = await (() => {
            const r = this.ref(args);
            if (query?.filters) {
              query.filters.forEach((filter) => {
                r.filter(filter[0], filter[1], filter[2]);
              });
            }
            return r
              .select(query?.select || "*")
              .range(pagination.startIndex, pagination.endIndex);
          })();
          result.count = result.data ? result.data.length : null;
          if (result.error) throw result.error;
          if (result.count === null) throw "Could not get result count.";
          return {
            data: result.data as T[],
            pagination: getResultsPagination(pagination, result.count),
          };
        } catch {
          return { data: [], pagination: getResultsPagination(pagination) };
        }
      }
    };
  };
};
