import { ListOf } from "../src/types/supaorm.types";
import {
  ContactService,
  OrganizationService,
  ViewContactService,
} from "./example.service";

const organizations = new OrganizationService();
const all: ListOf<OrganizationService> = await organizations.findMany();

const orgs = await organizations.findMany({
  select: ["id", "name", "country"],
});

all.data.forEach((r) => {
  console.log(r?.created_at);
});

orgs.data.forEach((r) => {
  console.log(r.country);
});

const thisOrg = await organizations.findOne("XYZ", {
  select: ["id", "name"],
});

if (thisOrg) console.log(thisOrg.id);

organizations.echo("country");

orgs.data.forEach((row) => {
  console.log(row.name);
});

const contacts = new ContactService();

const contact = await contacts.findOneOrFail("adsfasdf", {
  select: ["id", "first_name", "last_name"],
  where: [["organization_id", "eq", "123"]],
});

if (contact) console.log(contact);

const viewContacts = new ViewContactService();

const orgContacts = await viewContacts.findMany({
  select: ["id", "first_name", "last_name"],
  where: [["organization_id", "eq", "123XYZ"]],
});

orgContacts.data.forEach((c) => {
  console.log(c.first_name, c.email);
});
