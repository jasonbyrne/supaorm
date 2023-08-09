import { FilterOperator } from "./query.types";
import { DatabaseStructure, SchemaName } from "./supaorm.types";

export type Views<Db extends DatabaseStructure> = Db[SchemaName]["Views"];

export type ValidViewName<Db extends DatabaseStructure> = string &
  keyof Db[SchemaName]["Views"];
export type ValidViewColumn<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = string & keyof Db[SchemaName]["Views"][ViewName]["Row"];

export type ViewRow<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = Db[SchemaName]["Views"][ViewName]["Row"];

export type ViewQueryFilter<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = [ValidViewColumn<Db, ViewName>, `${"" | "not."}${FilterOperator}`, unknown];

export type FindManyViewQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  page?: number;
  perPage?: number;
  filters?: ViewQueryFilter<Db, ViewName>[];
  search?: string;
  sort?: ViewSortField<Db, ViewName>;
  select?: string;
};

export type FindOneViewQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  sort?: ViewSortField<Db, ViewName>;
  select?: ValidViewColumn<Db, ViewName>[];
};

export type ViewServiceOpts<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  defaultSort?: ViewSortField<Db, ViewName>;
  searchField?: ValidViewColumn<Db, ViewName>;
};

export type ViewSortField<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  field: ValidViewColumn<Db, ViewName>;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type TableFindManyQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  page?: number;
  perPage?: number;
  filters?: ViewQueryFilter<Db, ViewName>[];
  search?: string;
  sort?: ViewSortField<Db, ViewName>;
  select?: ValidViewColumn<Db, ViewName>[];
};
