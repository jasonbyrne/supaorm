import {
  FunctionArguments,
  FunctionList,
  FunctionRow,
  ValidFunctionColumn,
  ValidFunctionName,
} from "../types/function.types";
import { OrmInterface } from "../types/interface";
import { DatabaseStructure } from "../types/supaorm.types";
import { getResultsPagination } from "../utils/get-results-pagination";
import { getQueryPagination } from "../utils/get-query-pagination";
import { FindManyParams, FindOneParams } from "../types/query.types";
import { getSelectedCols } from "../utils/get-selected-cols";

export const generateFunctionService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <FunctionName extends ValidFunctionName<Database>>(
    functionName: ValidFunctionName<Database>
  ) => {
    /**
     * Define types for use within this function
     */
    type ListSchema = FunctionList<Database, FunctionName>;
    type RowSchema = FunctionRow<Database, FunctionName>;
    type ValidColumn = ValidFunctionColumn<Database, FunctionName>;
    type FunctionArgs = FunctionArguments<Database, FunctionName>;

    return class {
      public get functionName() {
        return functionName;
      }

      public ref(args: FunctionArguments<Database, FunctionName>) {
        return orm.supabase.rpc(functionName, args);
      }

      public async execute(args: FunctionArguments<Database, FunctionName>) {
        return this.ref(args);
      }

      public async findOne(
        args: FunctionArgs,
        query?: FindOneParams<ValidColumn>
      ): Promise<RowSchema | null> {
        const sp = this.ref(args);
        if (query?.where) {
          query.where.forEach((filter) => {
            sp.filter(filter[0], filter[1], filter[2]);
          });
        }
        const result = await sp
          .select(getSelectedCols(query?.select))
          .limit(1)
          .single();
        if (result.error) throw result.error;
        if (!result.data) return null;
        return result.data as RowSchema;
      }

      public async findMany(
        args: FunctionArgs,
        query?: FindManyParams<ValidColumn>
      ) {
        const pagination = getQueryPagination(
          query?.page || 1,
          query?.perPage || 50
        );
        try {
          const result = await (() => {
            const r = this.ref(args);
            if (query?.where) {
              query.where.forEach((filter) => {
                r.filter(filter[0], filter[1], filter[2]);
              });
            }
            return r
              .select(getSelectedCols(query?.select))
              .range(pagination.startIndex, pagination.endIndex);
          })();
          result.count = result.data ? result.data.length : null;
          if (result.error) throw result.error;
          if (result.count === null) throw "Could not get result count.";
          return {
            data: result.data as unknown as ListSchema[],
            pagination: getResultsPagination(pagination, result.count),
          };
        } catch {
          return { data: [], pagination: getResultsPagination(pagination) };
        }
      }
    };
  };
};
