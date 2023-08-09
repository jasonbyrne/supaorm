import { DatabaseStructure, QueryFilter, SchemaName } from "./supaorm.types";

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
> = Db[SchemaName]["Functions"][FunctionName]["Returns"] extends Array<any>
  ? Db[SchemaName]["Functions"][FunctionName]["Returns"][number]
  : unknown;

export type FunctionArguments<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = Db[SchemaName]["Functions"][FunctionName]["Args"];

export type ValidFunctionArgument<
  Db extends DatabaseStructure,
  FunctionName extends ValidFunctionName<Db>,
> = string & keyof FunctionArguments<Db, FunctionName>;

export type FindManyFunctionQueryParams = {
  page?: number;
  perPage?: number;
  filters?: QueryFilter[];
  select?: string;
};

export type FindOneFunctionQueryParams = {
  select?: string;
  filters?: QueryFilter[];
};
