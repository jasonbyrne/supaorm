import { DatabaseStructure, SchemaName } from "./supaorm.types";

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
> = FunctionReturns<Db, FunctionName> extends Array<any>
  ? FunctionReturns<Db, FunctionName>[number]
  : FunctionReturns<Db, FunctionName>;

export type ValidFunctionColumn<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = string & keyof FunctionRow<Db, FunctionName>;

export type FunctionArguments<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Args"];

export type ValidFunctionArgument<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = string & keyof FunctionArguments<Db, FunctionName>;
