import { FilterOperator } from "./query.types";
import { DatabaseStructure, SchemaName } from "./supaorm.types";

export type Tables<Db extends DatabaseStructure> = Db[SchemaName]["Tables"];

export type ValidTableName<Db extends DatabaseStructure> = string &
  keyof Tables<Db>;

export type Table<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Tables<Db>[TableName];

export type InsertRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Table<Db, TableName>["Insert"];

export type UpdateRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Table<Db, TableName>["Update"];

export type SelectRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Table<Db, TableName>["Row"];

export type ValidTableColumn<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = string & keyof SelectRow<Db, TableName>;

export type TableColumn<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
  ColumnName extends ValidTableColumn<Db, TableName>,
> = SelectRow<Db, TableName>[ColumnName];

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

export type TableQueryFilter<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = [
  ValidTableColumn<Db, TableName>,
  `${"" | "not."}${FilterOperator}`,
  unknown,
];

export type TableSortField<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  field: ValidTableColumn<Db, TableName>;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type TableSelect<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = "*" | ValidTableColumn<Db, TableName>[];

export type TableFindManyQueryParams<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  page?: number;
  perPage?: number;
  filters?: TableQueryFilter<Db, TableName>[];
  search?: string;
  sort?: TableSortField<Db, TableName>;
  select?: TableSelect<Db, TableName>;
};

export type TableFindOneQueryParams<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = {
  sort?: SortTableField<Db, TableName>;
  select?: TableSelect<Db, TableName>;
  filters?: TableQueryFilter<Db, TableName>[];
};
