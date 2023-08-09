import { OrmInterface } from "../types/interface";
import { DatabaseStructure } from "../types/supaorm.types";
import {
  ValidViewColumn,
  ValidViewName,
  ViewFindManyQueryParams,
  ViewRow,
  ViewServiceOpts,
} from "../types/view.types";
import { getQueryPagination } from "../utils/get-query-pagination";
import { getResultsPagination } from "../utils/get-results-pagination";
import { getSelectedCols } from "../utils/get-selected-cols";

export const generateViewService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
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
      public get ref() {
        return orm.supabase.from(viewName);
      }

      /**
       * This is designed so that we can override it in child classes
       */
      public mapOutbound(row: ViewSchema) {
        return row;
      }

      public async findOne(
        id: string,
        query?: ViewFindManyQueryParams<Database, ViewName>
      ): Promise<ViewSchema | null> {
        const result = await this.ref
          .select(getSelectedCols(query?.select))
          .eq(pk, id)
          .limit(1)
          .single();
        if (!result.data) return null;
        return result.data as ViewSchema;
      }

      public async findMany(
        query?: ViewFindManyQueryParams<Database, ViewName>
      ) {
        const sort = query?.sort || defaultSort;
        const pagination = getQueryPagination(
          query?.page || 1,
          query?.perPage || 50
        );
        try {
          const result = await (() => {
            const r = this.ref
              .select(getSelectedCols(query?.select), { count: "estimated" })
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
          const data = result.data as ViewSchema[];
          return {
            data: data.map((row) => this.mapOutbound(row)),
            pagination: getResultsPagination(pagination, result.count),
          };
        } catch {
          return { data: [], pagination: getResultsPagination(pagination) };
        }
      }

      public async count() {
        const result = await this.ref.select("*", {
          count: "estimated",
          head: true,
        });
        return result.count || 0;
      }
    };
  };
};
