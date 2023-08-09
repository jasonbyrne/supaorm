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
import { CountMethods, NameAndValue } from "../types/query.types";
import { getSelectedCols } from "../utils/get-selected-cols";

export const generateTableService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <
    TableName extends ValidTableName<Database>,
    TablePk extends ValidTableColumn<Database, TableName>,
    TableSchema = SelectRow<Database, TableName>,
    UpdateSchema = UpdateRow<Database, TableName>,
    InsertSchema = InsertRow<Database, TableName>,
  >(
    tableName: TableName,
    pk: TablePk,
    opts?: TableServiceOpts<Database, TableName>
  ) => {
    const searchField = opts?.searchField;
    const defaultSort = opts?.defaultSort;

    return class {
      public get tableName() {
        return tableName;
      }

      public get pk() {
        return pk;
      }

      public get ref() {
        return orm.supabase.from(tableName);
      }

      public async findValue<
        ColumnName extends ValidTableColumn<Database, TableName>,
        ColumnValue extends TableColumn<Database, TableName, ColumnName>,
      >(
        fieldName: ColumnName,
        query?: {
          where?: TableQueryFilter<Database, TableName>[];
          sort?: TableSortField<Database, TableName>;
        }
      ): Promise<ColumnValue> {
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
        return result.data as ColumnValue;
      }

      public async findOneOrFail(
        id: string,
        query?: TableFindOneQueryParams<Database, TableName>
      ) {
        const row = await this.findOne(id, query);
        if (row === null) throw `Could not find row with id ${id}`;
        return row;
      }

      public async findOne(
        id: string,
        query?: TableFindOneQueryParams<Database, TableName>
      ) {
        const result = await this.ref
          .select(getSelectedCols(query?.select))
          .eq(pk, id)
          .limit(1)
          .single();
        if (result.error) throw result.error;
        return result.data ? result.data : null;
      }

      public async findManyAsNameValue(
        query?: TableFindManyQueryParams<Database, TableName> & {
          nameField?: ValidTableColumn<Database, TableName>;
        }
      ): Promise<NameAndValue[]> {
        const nameField = query?.nameField || "name";
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
          const data = result.data as TableSchema[];
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
        args?: {
          where?: TableQueryFilter<Database, TableName>[];
          count?: CountMethods;
        }
      ): Promise<number> {
        if (column && value) {
          const searchValue = Array.isArray(value) ? value : [value];
          const result = await (() => {
            const r = this.ref
              .select(pk, { count: args?.count ?? "estimated", head: true })
              .in(column, searchValue);

            if (args?.where) {
              args.where.forEach((filter) => {
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
