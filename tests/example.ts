import { ContactService, OrganizationService } from "./example.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany();

const contacts = new ContactService();

contacts.findMany({
  filters: [["organiation_id", "eq", "1234"]],
});
