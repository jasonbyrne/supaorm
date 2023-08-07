# supaorm

Service-based ORM that augments the Supabbase JavaScript Client

## How to use

Supabase allows to to generate your TypeScript database schema with this command:

```bash
npx supabase gen types typescript --project-id '<YOUR-PROJECT-ID>' --schema public > src/types/supabase.ts
```

You should also have your Supabase URL and Anon Key defined as environment variables `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, which is standard in the Supabase setup procedure.

Create a file in your project called something like `src/supaorm.ts` with this contents:

```typescript
import SupaOrm from "supaorm";
import { Database } from "./types/supabase.ts";

const orm = SupaOrm<Database>();
export default orm;
```

Create a new folder called `src/services` to contain the services for your individual tables. For this example, our first file will be for a table called `organization` and called `src/services/organization.service.ts` with these contents:

```typescript
import orm from "../supaorm";

export class OrganizationService extends orm.TableService(
  "organization",
  "id"
) {}
```

Now in another file in your project you can use it like this to get a list of all organizations:

```typescript
import { OrganizationService } from "./services/organization.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany();
```
