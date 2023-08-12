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

export type PartialRow<
  Db extends DatabaseStructure,
  TableName extends ValidTableName<Db>,
> = Partial<SelectRow<Db, TableName>>;
