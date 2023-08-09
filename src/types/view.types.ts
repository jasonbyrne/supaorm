import { FilterOperator } from "./query.types";
import { DatabaseStructure, SchemaName } from "./supaorm.types";

export type Views<Db extends DatabaseStructure> = Db[SchemaName]["Views"];

export type ValidViewName<Db extends DatabaseStructure> = string &
  keyof Views<Db>;

export type View<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = Views<Db>[ViewName];

export type ViewRow<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = View<Db, ViewName>["Row"];

export type ValidViewColumn<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = string & keyof ViewRow<Db, ViewName>;

export type ViewColumn<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
  ColumnName extends ValidViewColumn<Db, ViewName>,
> = ViewRow<Db, ViewName>[ColumnName];

export type ViewQueryFilter<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = [ValidViewColumn<Db, ViewName>, `${"" | "not."}${FilterOperator}`, unknown];

export type ViewFindOneQueryParams<
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

export type ViewSelect<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = "*" | ValidViewColumn<Db, ViewName>[];

export type ViewFindManyQueryParams<
  Db extends DatabaseStructure,
  ViewName extends ValidViewName<Db>,
> = {
  page?: number;
  perPage?: number;
  where?: ViewQueryFilter<Db, ViewName>[];
  search?: string;
  sort?: ViewSortField<Db, ViewName>;
  select?: ViewSelect<Db, ViewName>;
};
