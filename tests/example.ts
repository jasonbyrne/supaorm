import {
  ContactService,
  OrganizationService,
  ViewContactService,
} from "./example.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany({
  select: ["id", "name"],
});

const contacts = new ContactService();

const contact = await contacts.findOneOrFail("adsfasdf", {
  select: ["created_at"],
  filters: [["organization_id", "eq", "sdfasd"]],
});

const viewContacts = new ViewContactService();
const orgContacts = await viewContacts.findMany({
  filters: [["organization_id", "eq", "asdfasdf"]],
  select: ["first_name", "last_name"],
});

orgContacts.data.forEach((c) => {
  console.log(c.first_name);
});
