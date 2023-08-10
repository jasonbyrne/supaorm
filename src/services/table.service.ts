import { OrmInterface } from "../types/interface";
import { hasFields } from "../utils/has-fields";
import {
  InsertRow,
  SelectRow,
  TableColumn,
  TableFindManyQueryParams,
  TableFindOneQueryParams,
  TableQueryFilter,
  TableServiceOpts,
  TableSortField,
  UpdateRow,
  ValidTableColumn,
  ValidTableName,
} from "../types/table.types";
import { DatabaseStructure } from "../types/supaorm.types";
import { getQueryPagination } from "../utils/get-query-pagination";
import { getResultsPagination } from "../utils/get-results-pagination";
import { CountMethods, ListResult, NameAndValue } from "../types/query.types";
import { getSelectedCols } from "../utils/get-selected-cols";
import type { Except } from "type-fest";

export const generateTableService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <
    TableName extends ValidTableName<Database>,
    TablePk extends ValidTableColumn<Database, TableName>,
  >(
    tableName: TableName,
    pk: TablePk,
    opts?: TableServiceOpts<Database, TableName>
  ) => {
    /**
     * Define types for use within this table
     */
    type TableSchema = SelectRow<Database, TableName>;
    type UpdateSchema = UpdateRow<Database, TableName>;
    type InsertSchema = InsertRow<Database, TableName>;
    type ValidColumn = ValidTableColumn<Database, TableName>;
    type ColumnValue<ColumnName extends ValidColumn> = TableColumn<
      Database,
      TableName,
      ColumnName
    >;
    type QueryMany = TableFindManyQueryParams<Database, TableName>;
    type QueryOne = TableFindOneQueryParams<Database, TableName>;
    type SortField = TableSortField<Database, TableName>;
    type WhereClause = TableQueryFilter<Database, TableName>;
    type WithoutSelect<T extends { select?: unknown }> = Except<T, "select">;
    type List = ListResult<TableSchema>;
    type QueryValue = {
      where?: WhereClause[];
      sort?: SortField;
    };
    type QueryCount = {
      where?: WhereClause[];
      count?: CountMethods;
    };

    /**
     * Extract from opts
     */
    const searchField = opts?.searchField;
    const defaultSort = opts?.defaultSort;

    return class {
      public readonly tableName = tableName;
      public readonly pk = pk;

      public get ref() {
        return orm.supabase.from(tableName);
      }

      public async findValue<ColumnName extends ValidColumn>(
        fieldName: ColumnName,
        query?: QueryValue
      ): Promise<ColumnValue<ColumnName>> {
        const sort = query?.sort || defaultSort;
        const result = await (() => {
          const r = this.ref.select(fieldName);
          if (sort) {
            r.order(sort.field, {
              ascending: !!sort.ascending,
              nullsFirst: !!sort.nullsFirst,
            });
          }
          if (query?.where) {
            query.where.forEach((filter) => {
              r.filter(filter[0], filter[1], filter[2]);
            });
          }
          return r.limit(1).single();
        })();
        return result.data as ColumnValue<ColumnName>;
      }

      public async findOneOrFail(id: string, query?: QueryOne) {
        const row = await (query ? this.findOne(id, query) : this.findOne(id));
        if (row === null) throw `Could not find row with id ${id}`;
        return row;
      }

      public async findOne(id: string): Promise<TableSchema | null>;
      public async findOne(
        id: string,
        query: WithoutSelect<QueryOne>
      ): Promise<TableSchema | null>;
      public async findOne<T extends ValidColumn>(
        id: string,
        query: QueryOne & {
          select: T[];
        }
      ): Promise<Pick<TableSchema, T> | null>;
      public async findOne(id: string, query?: QueryOne) {
        const result = await this.ref
          .select(getSelectedCols(query?.select))
          .eq(pk, id)
          .limit(1)
          .single();
        if (result.error) throw result.error;
        if (!result.data) return null;
        return result.data as unknown as TableSchema;
      }

      public async findManyAsNameValue(
        nameField: ValidColumn,
        query: Except<QueryMany, "select">
      ): Promise<NameAndValue[]> {
        const results = await this.findMany({
          ...query,
          select: [pk, nameField],
        });
        return results.data.map((row) => {
          if (hasFields(row, pk, nameField)) {
            // Need to hack this so that TypeScript is happy, even though we tested for the fields above
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let castRow = row as any;
            return { name: castRow[nameField], value: castRow[pk] };
          }
          return { name: "", value: "" };
        });
      }

      public async findMany(): Promise<List>;
      public async findMany(
        query: WithoutSelect<TableFindManyQueryParams<Database, TableName>>
      ): Promise<List>;
      public async findMany<T extends keyof TableSchema>(
        query: TableFindManyQueryParams<Database, TableName> & {
          select: T[];
        }
      ): Promise<ListResult<Pick<TableSchema, T>>>;
      public async findMany(
        query?: TableFindManyQueryParams<Database, TableName>
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
              .range(pagination.startIndex, pagination.endIndex);
            if (sort) {
              r.order(sort.field, {
                ascending: !!sort.ascending,
                nullsFirst: !!sort.nullsFirst,
              });
            }
            if (query?.where) {
              query.where.forEach((filter) => {
                r.filter(filter[0], filter[1], filter[2]);
              });
            }
            if (query?.search) {
              if (!searchField) {
                throw `No search field is specified on ${this.tableName}`;
              }
              r.textSearch(searchField, query.search, {
                type: "websearch",
                config: "english",
              });
            }
            return r;
          })();
          if (result.error) throw result.error;
          if (result.count === null) throw "Could not get result count.";
          const data = result.data as unknown as TableSchema[];
          return {
            data: data,
            pagination: getResultsPagination(pagination, result.count),
          };
        } catch {
          return { data: [], pagination: getResultsPagination(pagination) };
        }
      }

      public async count(
        column?: string,
        value?: string | null | string[],
        query?: QueryCount
      ): Promise<number> {
        if (column && value) {
          const searchValue = Array.isArray(value) ? value : [value];
          const result = await (() => {
            const r = this.ref
              .select(pk, { count: query?.count ?? "estimated", head: true })
              .in(column, searchValue);

            if (query?.where) {
              query.where.forEach((filter) => {
                r.filter(filter[0], filter[1], filter[2]);
              });
            }

            return r;
          })();
          return result.count || 0;
        }
        const result = await this.ref.select(pk, {
          count: "estimated",
          head: true,
        });
        return result.count || 0;
      }

      public save(data: InsertSchema | InsertSchema[]) {
        data = Array.isArray(data) ? data : [data];
        return Promise.all(
          data.map((row) => {
            // If row has a property called pk
            if (Object.hasOwnProperty.call(row, pk)) {
              return this.update((row as any)[pk], row as any as UpdateSchema);
            }
            return this.insert(row as InsertSchema);
          })
        );
      }

      public update<Inbound = UpdateSchema>(pkValue: string, data: Inbound) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.ref.update(data as any).eq(pk, pkValue);
      }

      public insert(data: InsertSchema | InsertSchema[]) {
        return (
          this.ref
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert(data as any)
            .select()
            .single()
        );
      }

      public upsert(data: InsertSchema | InsertSchema[]) {
        return (
          this.ref
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert(data as any)
            .select()
            .single()
        );
      }
    };
  };
};
