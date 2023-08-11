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
