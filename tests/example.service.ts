import { DatabaseStructure, ValidTableColumn, ValidTableName } from "../src";
import orm from "./example.init";
import { Database } from "./example.schema";

export class ContactService extends orm.TableService("contact", "id") {
  public findByOrganizationId(id: string) {
    return this.findMany({ where: [["organization_id", "eq", id]] });
  }
}

export class OrganizationService<
  Db extends DatabaseStructure = Database,
  TableName extends ValidTableName<Db> = "organization",
> extends orm.TableService("organization", "id") {
  public echo(columnName: ValidTableColumn<Db, TableName>) {
    return columnName;
  }
}

export class ViewContactService extends orm.ViewService("view_contact", "id") {}
