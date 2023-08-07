import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatabaseStructure } from "./types/supabase-schema.type";
import {
  getQueryPagination,
  type FindManyViewQueryParams,
  type FindOneViewQueryParams,
  type ListResult,
  type ValidViewColumn,
  type ValidViewName,
  type ViewRow,
  type ViewServiceOpts,
  getResultsPagination,
} from "./types/supaorm.types";

export const generateViewService = <
  Database extends DatabaseStructure,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
>(
  supabase: SupabaseClient<Database, SchemaName>
) => {
  return <
    ViewName extends ValidViewName<Database>,
    ViewSchema = ViewRow<Database, ViewName>,
  >(
    viewName: ViewName,
    pk: ValidViewColumn<Database, ViewName>,
    opts?: ViewServiceOpts<Database, ViewName>
  ) => {
    const searchField = opts?.searchField || "name";
    const defaultSort = opts?.defaultSort || {
      field: "created_at",
      ascending: true,
      nullsFirst: true,
    };

    return class {
      protected get table() {
        return supabase.from(viewName);
      }

      public async findOne(
        id: string,
        query?: FindOneViewQueryParams<Database, ViewName>
      ): Promise<ViewSchema | null> {
        const result = await this.table
          .select(query?.select || "*")
          .eq(pk, id)
          .limit(1)
          .single();
        if (!result.data) return null;
        return result.data as ViewSchema;
      }

      public async findMany<T = ViewSchema>(
        query?: FindManyViewQueryParams<Database, ViewName>
      ): Promise<ListResult<T>> {
        const sort = query?.sort || defaultSort;
        const pagination = getQueryPagination(
          query?.page || 1,
          query?.perPage || 50
        );
        try {
          const result = await (() => {
            const r = this.table
              .select(query?.select || "*", { count: "estimated" })
              .range(pagination.startIndex, pagination.endIndex)
              .order(sort.field, {
                ascending: !!sort.ascending,
                nullsFirst: !!sort.nullsFirst,
              });
            if (query?.filters) {
              query.filters.forEach((filter) => {
                r.filter(filter[0], filter[1], filter[2]);
              });
            }
            if (searchField && query?.search) {
              r.textSearch(searchField, query.search, {
                type: "websearch",
                config: "english",
              });
            }
            return r;
          })();
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

      public async count() {
        const result = await this.table.select("*", {
          count: "estimated",
          head: true,
        });
        return result.count || 0;
      }
    };
  };
};
