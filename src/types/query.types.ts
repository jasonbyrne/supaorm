import { Except } from "type-fest";
import { DatabaseStructure, ValidTableOrViewName } from "./supaorm.types";

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

export type CountMethods = "exact" | "planned" | "estimated";

export type OrderBy<ValidColumn extends string> = {
  field: ValidColumn;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type AggregateFunctions = "count" | "sum" | "avg" | "max" | "min";

export type WhereStatement<ValidColumn extends string> = [
  ValidColumn,
  `${"" | "not."}${FilterOperator}`,
  unknown,
];

export type JoinSelect<Database extends DatabaseStructure> = {
  table: ValidTableOrViewName<Database>;
  columns: string[];
  type: "inner" | "outer";
};

export type WhereClause<ValidColumn extends string> =
  WhereStatement<ValidColumn>[];

export type FindManyParams<ValidColumn extends string> = {
  select?: Array<ValidColumn | `${ValidColumn}.${AggregateFunctions}()`>;
  where?: WhereClause<ValidColumn>;
  search?: string;
  orderBy?: OrderBy<ValidColumn>;
  page?: number;
  perPage?: number;
};

export type FindOneParams<ValidColumn extends string> = {
  select?: ValidColumn[];
  where?: WhereClause<ValidColumn>;
  orderBy?: OrderBy<ValidColumn>;
};

export type FindValueParams<ValidColumn extends string> = Except<
  FindOneParams<ValidColumn>,
  "select"
>;

export type FindColParams<ValidColumn extends string> = Except<
  FindManyParams<ValidColumn>,
  "select"
>;

export type FindCountParams<ValidColumn extends string> =
  FindOneParams<ValidColumn> & {
    countMethod?: CountMethods;
  };
