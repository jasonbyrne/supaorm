import type { DatabaseStructure } from "../types/supabase-schema.type";
import {
  getQueryPagination,
  type FindManyTableQueryParams,
  type FindOneTableQueryParams,
  type InsertRow,
  type NameAndValue,
  type QueryFilter,
  type SelectRow,
  type TableServiceOpts,
  type UpdateRow,
  type ValidTableColumn,
  type ValidTableName,
  getResultsPagination,
} from "../types/supaorm.types";
import { OrmInterface } from "../types/interface";
import { hasFields } from "../utils/has-fields";

export const generateTableService = <Database extends DatabaseStructure>(
  orm: OrmInterface<Database>
) => {
  return <TableName extends ValidTableName<Database>>(
    tableName: ValidTableName<Database>,
    pk: ValidTableColumn<Database, TableName>,
    opts?: TableServiceOpts<Database, TableName>
  ) => {
    const searchField = opts?.searchField || "name";
    const defaultSort = opts?.defaultSort || {
      field: "created_at",
      ascending: true,
      nullsFirst: true,
    };

    return class<
      TableSchema = SelectRow<Database, TableName>,
      UpdateSchema = UpdateRow<Database, TableName>,
      InsertSchema = InsertRow<Database, TableName>,
    > {
      public get ref() {
        return orm.supabase.from(tableName);
      }

      /**
       * This is designed so that we can override it in child classes
       */
      public mapOutbound(row: TableSchema) {
        return row;
      }

      /**
       * This is designed so that we can override it in child classes
       */
      public mapInbound<T = TableSchema>(row: any): T {
        return row;
      }

      public async findOneOrFail(
        id: string,
        query?: FindOneTableQueryParams<Database, TableName>
      ): Promise<TableSchema> {
        const row = await this.findOne(id, query);
        if (row === null) throw `Could not find row with id ${id}`;
        return row;
      }

      public async findOne(
        id: string,
        query?: FindOneTableQueryParams<Database, TableName>
      ): Promise<TableSchema | null> {
        const result = await this.ref
          .select(query?.select || "*")
          .eq(pk, id)
          .limit(1)
          .single();
        if (result.error) throw result.error;
        return result.data
          ? this.mapOutbound(result.data as TableSchema)
          : null;
      }

      public async findManyAsNameValue(
        query?: FindManyTableQueryParams<Database, TableName> & {
          nameField?: ValidTableColumn<Database, TableName>;
        }
      ): Promise<NameAndValue[]> {
        const nameField = query?.nameField || "name";
        const results = await this.findMany({
          ...query,
          select: `${pk}, ${nameField}`,
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
        query?: FindManyTableQueryParams<Database, TableName>
      ) {
        const sort = query?.sort || defaultSort;
        const pagination = getQueryPagination(
          query?.page || 1,
          query?.perPage || 50
        );
        try {
          const result = await (() => {
            const r = this.ref
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
            if (query?.search) {
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
            data: data.map((row) => this.mapOutbound(row)),
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
          filters?: QueryFilter[];
          count?: "exact" | "planned" | "estimated";
        }
      ): Promise<number> {
        if (column && value) {
          const searchValue = Array.isArray(value) ? value : [value];
          const result = await (() => {
            const r = this.ref
              .select(pk, { count: args?.count ?? "estimated", head: true })
              .in(column, searchValue);

            if (args?.filters) {
              args.filters.forEach((filter) => {
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
              const inboundRow = this.mapInbound<UpdateSchema>(row);
              return this.update((inboundRow as any)[pk], inboundRow);
            }
            return this.insert(this.mapInbound(row));
          })
        );
      }

      public update(pkValue: string, data: UpdateSchema) {
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
