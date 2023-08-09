import type { SupabaseClient } from "@supabase/supabase-js";
import { ColumnType, DatabaseStructure, RowType } from "./supabase-schema.type";

type SchemaName = "public";

export type Supabase<Db extends DatabaseStructure> = SupabaseClient<
  Db,
  SchemaName
>;

export type ValidTableOrView<Db extends DatabaseStructure> =
  keyof (Db[SchemaName]["Tables"] & Db[SchemaName]["Views"]);

export type ValidTableName<Db extends DatabaseStructure> = string &
  keyof Db[SchemaName]["Tables"];
export type ValidTableColumn<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = string & keyof Db[SchemaName]["Tables"][TableName]["Row"];

export type ValidViewName<Db extends DatabaseStructure> = string &
  keyof Db[SchemaName]["Views"];
export type ValidViewColumn<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = string & keyof Db[SchemaName]["Views"][ViewName]["Row"];

export type ValidFunctionName<Db extends DatabaseStructure> = string &
  keyof Db[SchemaName]["Functions"];

export type FunctionReturns<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Returns"];

export type FunctionList<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Returns"] extends Array<any>
  ? Db[SchemaName]["Functions"][FunctionName]["Returns"]
  : never;

export type FunctionRow<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Returns"] extends Array<any>
  ? Db[SchemaName]["Functions"][FunctionName]["Returns"][number]
  : ColumnType | RowType;

export type ValidFunctionColumn<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = string &
  Db[SchemaName]["Functions"][FunctionName]["Returns"] extends RowType
  ? keyof Db[SchemaName]["Functions"][FunctionName]["Returns"]
  : Db[SchemaName]["Functions"][FunctionName]["Returns"] extends Array<any>
  ? Db[SchemaName]["Functions"][FunctionName]["Returns"][number] extends RowType
    ? keyof Db[SchemaName]["Functions"][FunctionName]["Returns"][number]
    : never
  : never;

export type FunctionArguments<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Args"];

export type ValidFunctionArgument<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = string & keyof FunctionArguments<Db, FunctionName>;

export type InsertRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Db[SchemaName]["Tables"][TableName]["Insert"];

export type UpdateRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Db[SchemaName]["Tables"][TableName]["Update"];

export type SelectRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Db[SchemaName]["Tables"][TableName]["Row"];

export type ViewRow<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = Db[SchemaName]["Views"][ViewName]["Row"];

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike"
  | "is"
  | "in"
  | "cs"
  | "cd"
  | "sl"
  | "sr"
  | "nxl"
  | "nxr"
  | "adj"
  | "ov"
  | "fts"
  | "plfts"
  | "phfts"
  | "wfts";

export interface QueryPagination {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly page: number;
  readonly perPage: number;
}

export interface ResultsPagination extends QueryPagination {
  readonly totalRows: number;
  readonly isNextPage: boolean;
  readonly isPrevPage: boolean;
  readonly numberOfPages: number;
}

export const getQueryPagination = (
  page: number,
  perPage: number
): QueryPagination => {
  page = Math.floor(page) || 1;
  perPage = Math.floor(perPage) || 1;
  const startIndex = (page - 1) * perPage;
  return {
    page,
    perPage,
    startIndex,
    endIndex: startIndex + perPage - 1,
  };
};

export const getResultsPagination = (
  queryPagination: QueryPagination,
  totalRows = 0
) => {
  const numberOfPages = Math.max(
    Math.ceil(totalRows / queryPagination.perPage),
    1
  );
  return {
    ...queryPagination,
    totalRows,
    numberOfPages,
    isNextPage: queryPagination.page < numberOfPages,
    isPrevPage: queryPagination.page > 1,
  };
};

export type QueryFilter = [string, `${"" | "not."}${FilterOperator}`, unknown];

export type SortField = {
  field: string;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type FindManyQueryParams = {
  page?: number;
  perPage?: number;
  filters?: QueryFilter[];
  search?: string;
  sort?: SortField;
  select?: string;
};

export interface ListResult<T> {
  data: T[];
  pagination: ResultsPagination;
}

export interface NameAndValue {
  name: string;
  value: string;
}

export type SortBehavior = { ascending: boolean; nullsFirst: boolean };
export type SortOrder = [fieldName: string, behavior: SortBehavior];

export type SortTableField<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  field: ValidTableColumn<Db, TableName>;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type TableServiceOpts<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  defaultSort?: SortTableField<Db, TableName>;
  searchField?: ValidTableColumn<Db, TableName>;
};

export type FindOneTableQueryParams<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  sort?: SortTableField<Db, TableName>;
  select?: string;
};

export type FindManyTableQueryParams<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = FindOneTableQueryParams<Db, TableName> & {
  page?: number;
  perPage?: number;
  filters?: QueryFilter[];
  search?: string;
};

export type ViewSortField<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  field: ValidViewColumn<Db, ViewName>;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type FindManyViewQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  page?: number;
  perPage?: number;
  filters?: QueryFilter[];
  search?: string;
  sort?: ViewSortField<Db, ViewName>;
  select?: string;
};

export type FindOneViewQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  sort?: ViewSortField<Db, ViewName>;
  select?: string;
};

export type ViewServiceOpts<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  defaultSort?: ViewSortField<Db, ViewName>;
  searchField?: ValidViewColumn<Db, ViewName>;
};

export type FunctionSortField<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = {
  field: ValidFunctionColumn<Db, FunctionName>;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type FindManyFunctionQueryParams<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = {
  page?: number;
  perPage?: number;
  filters?: QueryFilter[];
  sort?: FunctionSortField<Db, FunctionName>;
  select?: string;
};

export type FindOneFunctionQueryParams<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = {
  sort?: FunctionSortField<Db, FunctionName>;
  select?: string;
  filters?: QueryFilter[];
};
