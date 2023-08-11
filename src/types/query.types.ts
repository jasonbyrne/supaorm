import { Except } from "type-fest";

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

export type OrderBy<ValidColumn> = {
  field: ValidColumn;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type WhereStatement<ValidColumn> = [
  ValidColumn,
  `${"" | "not."}${FilterOperator}`,
  unknown,
];

export type WhereClause<ValidColumn> = WhereStatement<ValidColumn>[];

export type FindManyParams<ValidColumn> = {
  select?: ValidColumn[];
  where?: WhereClause<ValidColumn>;
  search?: string;
  orderBy?: OrderBy<ValidColumn>;
  page?: number;
  perPage?: number;
};

export type FindOneParams<ValidColumn> = {
  select?: ValidColumn[];
  where?: WhereClause<ValidColumn>;
  orderBy?: OrderBy<ValidColumn>;
};

export type FindValueParams<ValidColumn> = Except<
  FindOneParams<ValidColumn>,
  "select"
>;

export type FindColParams<ValidColumn> = Except<
  FindManyParams<ValidColumn>,
  "select"
>;

export type FindCountParams<ValidColumn> = FindOneParams<ValidColumn> & {
  countMethod?: CountMethods;
};
