import { OrmInterface } from "../types/interface";
import { hasFields } from "../utils/has-fields";
import {
  InsertRow,
  SelectRow,
  TableColumn,
  UpdateRow,
  ValidTableColumn,
  ValidTableName,
} from "../types/table.types";
import { DatabaseStructure } from "../types/supaorm.types";
import { getQueryPagination } from "../utils/get-query-pagination";
import { getResultsPagination } from "../utils/get-results-pagination";
import {
  FindCountParams,
  FindManyParams,
  FindOneParams,
  FindValueParams,
  ListResult,
  NameAndValue,
  OrderBy,
} from "../types/query.types";
import { getSelectedCols } from "../utils/get-selected-cols";
import type { Except } from "type-fest";
import { arrayify } from "../utils/arrayify";
import { countRows } from "../utils/count-rows";

export type TableServiceOpts<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  defaultOrderBy?: OrderBy<ValidTableColumn<Db, TableName>>;
  searchField?: ValidTableColumn<Db, TableName>;
};

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
    type PartialSchema = Partial<TableSchema>;
    type ValidColumn = ValidTableColumn<Database, TableName>;
    type ColumnValue<ColumnName extends ValidColumn> = TableColumn<
      Database,
      TableName,
      ColumnName
    >;
    type WithoutSelect<T extends { select?: unknown }> = Except<T, "select">;
    type List = ListResult<TableSchema>;

    /**
     * Extract from opts
     */
    const searchField = opts?.searchField;
    const defaultOrderBy = opts?.defaultOrderBy;

    return class {
      public readonly tableName = tableName;
      public readonly pk = pk;

      public get ref() {
        return orm.supabase.from(tableName);
      }

      public async findValue<ColumnName extends ValidColumn>(
        fieldName: ColumnName,
        query?: FindValueParams<ValidColumn>
      ): Promise<ColumnValue<ColumnName>> {
        const orderBy = query?.orderBy || defaultOrderBy;
        const result = await (() => {
          const r = this.ref.select(fieldName);
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
          return r.limit(1).single();
        })();
        return result.data as ColumnValue<ColumnName>;
      }

      public async findOneOrFail(
        id: string,
        query?: FindOneParams<ValidColumn>
      ) {
        const row = await (query ? this.findOne(id, query) : this.findOne(id));
        if (row === null) throw `Could not find row with id ${id}`;
        return row;
      }

      public async findOne(id: string): Promise<TableSchema | null>;
      public async findOne(
        id: string,
        query: WithoutSelect<FindOneParams<ValidColumn>>
      ): Promise<TableSchema | null>;
      public async findOne<T extends ValidColumn>(
        id: string,
        query: FindOneParams<ValidColumn> & {
          select: T[];
        }
      ): Promise<Pick<TableSchema, T> | null>;
      public async findOne(id: string, query?: FindOneParams<ValidColumn>) {
        const result = await this.ref
          .select(getSelectedCols(query?.select))
          .eq(pk, id)
          .limit(1)
          .single();
        if (result.error) throw result.error;
        if (!result.data) return null;
        return result.data as any;
      }

      public async findManyAsNameValue(
        nameField: ValidColumn,
        query: Except<FindManyParams<ValidColumn>, "select">
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
        query: WithoutSelect<FindManyParams<ValidColumn>>
      ): Promise<List>;
      public async findMany<T extends keyof TableSchema>(
        query: FindManyParams<ValidColumn> & {
          select: T[];
        }
      ): Promise<ListResult<Pick<TableSchema, T>>>;
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
            data,
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

      public save(data: PartialSchema | PartialSchema[]) {
        return Promise.all(
          arrayify(data).map((row) => {
            // If row has a property called pk
            if (Object.hasOwnProperty.call(row, pk)) {
              return this.update(pk, row);
            }
            return this.insert(row);
          })
        );
      }

      public update(pkValue: string, data: UpdateSchema) {
        return this.ref.update(data as any).eq(pk, pkValue);
      }

      public insert(data: InsertSchema | InsertSchema[]) {
        return this.ref
          .insert(data as any)
          .select()
          .single();
      }

      public upsert(data: InsertSchema | InsertSchema[]) {
        return this.ref
          .upsert(data as any)
          .select()
          .single();
      }
    };
  };
};
