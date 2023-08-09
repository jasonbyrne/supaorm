import { DatabaseStructure, ValidTableColumn, ValidTableName } from "../src";
import orm from "./example.init";
import { Database } from "./example.schema";

export class ContactService extends orm.TableService("contact", "id") {}

export class OrganizationService<
  Db extends DatabaseStructure = Database,
  TableName extends ValidTableName<Db> = "organization",
> extends orm.TableService("organization", "id", {
  outbound: (data) => ({ ...data, org_name: data.name || "" }),
}) {
  public echo(columnName: ValidTableColumn<Db, TableName>) {
    return columnName;
  }
}

export class ViewContactService extends orm.ViewService("view_contact", "id") {}
