import {
  ContactService,
  OrganizationService,
  ViewContactService,
} from "./example.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany();

const contacts = new ContactService();

const contact = await contacts.findOneOrFail("adsfasdf");

const viewContacts = new ViewContactService();
const orgContacts = await viewContacts.findMany({
  filters: [["organization_id", "eq", "asdfasdf"]],
});

orgContacts.data.forEach((c) => {
  console.log(c.first_name);
});
