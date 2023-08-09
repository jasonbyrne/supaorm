import { FilterOperator } from "./query.types";
import { DatabaseStructure, SchemaName } from "./supaorm.types";

export type Tables<Db extends DatabaseStructure> = Db[SchemaName]["Tables"];

export type ValidTableName<Db extends DatabaseStructure> = string &
  keyof Db[SchemaName]["Tables"];
export type ValidTableColumn<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = string & keyof Db[SchemaName]["Tables"][TableName]["Row"];

export type TableColumnType<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
  ColumnName extends ValidTableColumn<Db, TableName>,
> = Db[SchemaName]["Tables"][TableName]["Row"][ColumnName];

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
};

export type TableQueryFilter<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = [
  ValidTableColumn<Db, TableName>,
  `${"" | "not."}${FilterOperator}`,
  unknown,
];
