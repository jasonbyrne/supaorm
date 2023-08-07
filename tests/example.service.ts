import SupaOrm from "../src/supaorm";
import { Database } from "./example.schema";

const orm = SupaOrm<Database>();

export class ContactService extends orm.TableService("contact", "id") {}
export class OrganizationService extends orm.TableService(
  "organization",
  "id"
) {}

export class ViewContactService extends orm.ViewService("view_contact", "id") {}
