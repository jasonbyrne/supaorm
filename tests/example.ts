import {
  ContactService,
  OrganizationService,
  ViewContactService,
} from "./example.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany({
  select: ["id", "name"],
});

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
