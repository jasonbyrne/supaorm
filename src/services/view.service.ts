import { Except } from "type-fest";
import { OrmInterface } from "../types/interface";
import {
  FindCountParams,
  FindManyParams,
  FindOneParams,
  ListResult,
  OrderBy,
} from "../types/query.types";
import { DatabaseStructure } from "../types/supaorm.types";
import { ValidViewColumn, ValidViewName, ViewRow } from "../types/view.types";
import { getQueryPagination } from "../utils/get-query-pagination";
import { getResultsPagination } from "../utils/get-results-pagination";
import { getSelectedCols } from "../utils/get-selected-cols";
import { countRows } from "../utils/count-rows";

type ViewServiceOpts<ValidColumn> = {
  defaultOrderBy?: OrderBy<ValidColumn>;
  searchField?: ValidColumn;
};

export const generateViewService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <
    ViewName extends ValidViewName<Database>,
    ViewPk extends ValidViewColumn<Database, ViewName>,
  >(
    viewName: ViewName,
    pk: ViewPk,
    opts?: ViewServiceOpts<ValidViewColumn<Database, ViewName>>
  ) => {
    /**
     * Define types for use within this view
     */
    type ViewSchema = ViewRow<Database, ViewName>;
    type ValidColumn = ValidViewColumn<Database, ViewName>;
    type List = ListResult<ViewSchema>;

    const searchField = opts?.searchField;
    const defaultOrderBy = opts?.defaultOrderBy;

    return class {
      public get viewName() {
        return viewName;
      }

      public get pk() {
        return pk;
      }

      public get ref() {
        return orm.supabase.from(viewName);
      }

      /**
       * This is designed so that we can override it in child classes
       */
      public mapOutbound(row: ViewSchema) {
        return row;
      }

      public async findOne(id: string): Promise<ViewSchema | null>;
      public async findOne(
        id: string,
        query: Except<FindOneParams<ValidColumn>, "select">
      ): Promise<ViewSchema | null>;
      public async findOne<T extends ValidColumn>(
        id: string,
        query: FindOneParams<ValidColumn> & {
          select: T[];
        }
      ): Promise<Pick<ViewSchema, T> | null>;
      public async findOne(id: string, query?: FindOneParams<ValidColumn>) {
        const result = await this.ref
          .select(getSelectedCols(query?.select))
          .eq(pk, id)
          .limit(1)
          .single();
        if (!result.data) return null;
        return result.data as unknown as ViewSchema;
      }

      public async findMany(): Promise<List>;
      public async findMany(
        query: Except<FindManyParams<ValidColumn>, "select">
      ): Promise<List>;
      public async findMany<T extends ValidColumn>(
        query: FindManyParams<ValidColumn> & {
          select: T[];
        }
      ): Promise<ListResult<Pick<ViewSchema, T>>>;
      public async findMany(query?: FindManyParams<ValidColumn>) {
        const orderBy = query?.orderBy || defaultOrderBy;
        const pagination = getQueryPagination(query);
        try {
          const result = await (() => {
            const r = this.ref
              .select(getSelectedCols(query?.select), { count: "estimated" })
              .range(pagination.startIndex, pagination.endIndex);
            if (orderBy) {
              r.order(orderBy.field, {
                ascending: !!orderBy.ascending,
                nullsFirst: !!orderBy.nullsFirst,
              });
            }
            if (query?.where) {
              query.where.forEach((filter) => {
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
          const data = result.data as unknown as ViewSchema[];
          return {
            data: data.map((row) => this.mapOutbound(row)),
            pagination: getResultsPagination(pagination, result.count),
          };
        } catch {
          return { data: [], pagination: getResultsPagination(pagination) };
        }
      }

      public async count(
        query?: FindCountParams<ValidColumn>
      ): Promise<number> {
        return countRows(this.ref, query);
      }
    };
  };
};
