import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatabaseStructure } from "./types/supabase-schema.type";
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
} from "./types/supaorm.types";
import { hasIdAndName } from "./supaorm.utils";

export const generateTableService = <
  Database extends DatabaseStructure,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database
>(
  supabase: SupabaseClient<Database, SchemaName>
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
      InsertSchema = InsertRow<Database, TableName>
    > {
      protected get table() {
        return supabase.from(tableName);
      }

      public async findOne(
        id: string,
        query?: FindOneTableQueryParams<Database, TableName>
      ) {
        const result = await this.table
          .select(query?.select || "*")
          .eq(pk, id)
          .limit(1)
          .single();
        if (result.error) throw result.error;
        if (!result.data) return null;
        return result.data as TableSchema;
      }

      public async findAllAsNameValue(
        query?: FindManyTableQueryParams<Database, TableName>
      ): Promise<NameAndValue[]> {
        const results = await this.findAll({
          ...query,
          select: `${pk}, name`,
        });
        return results.data.map((row) => {
          if (hasIdAndName(row)) {
            return { name: row.name, value: row.id };
          }
          return { name: "", value: "" };
        });
      }

      public async findAll(
        query?: FindManyTableQueryParams<Database, TableName>
      ) {
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
          return {
            data: result.data as TableSchema[],
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
            const r = this.table
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
        const result = await this.table.select(pk, {
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return this.update((row as any)[pk], row as any as UpdateSchema);
            }
            return this.insert(row);
          })
        );
      }

      public update(pkValue: string, data: UpdateSchema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.table.update(data as any).eq(pk, pkValue);
      }

      public insert(data: InsertSchema | InsertSchema[]) {
        return (
          this.table
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert(data as any)
            .select()
            .single()
        );
      }

      public upsert(data: InsertSchema | InsertSchema[]) {
        return (
          this.table
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .upsert(data as any)
            .select()
            .single()
        );
      }
    };
  };
};
