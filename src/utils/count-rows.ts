import { FindCountParams } from "../types/query.types";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import { DatabaseStructure, TableOrView } from "../types/supaorm.types";

export const countRows = async <
  Database extends DatabaseStructure,
  TableName extends string,
  ValidColumn extends string,
  TableSchema extends TableOrView<Database, TableName>,
  Query extends FindCountParams<ValidColumn>,
  Table extends PostgrestQueryBuilder<Database["public"], TableSchema>,
>(
  ref: Table,
  query?: Query
): Promise<number> => {
  const countMethod = query?.countMethod || "estimated";
  const r = ref.select("*", {
    count: countMethod,
    head: true,
  });
  if (query?.where) {
    query.where.forEach((filter) => {
      r.filter(filter[0], filter[1], filter[2]);
    });
  }
  const result = await r.limit(1).single();
  return result.count || 0;
};
