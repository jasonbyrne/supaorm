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
