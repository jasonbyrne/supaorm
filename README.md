# SupaORM

SupaORM is a service-based object relationship manager that builds on top of the Supabase JavaScript Client.
It utilizes the types automatically generated by the Supabase CLI to offer strong type safety for your queries.
It provides core convenience functions, while allowing you to expand upon the functionality on an indivudal
table, view, or function level.

## How to use

Supabase allows to to generate your TypeScript database schema with this command:

```bash
npx supabase gen types typescript --project-id '<YOUR-PROJECT-ID>' --schema public > src/types/supabase.ts
```

You should also have your Supabase URL and Anon Key defined as environment variables `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`, which is standard in the Supabase setup procedure.

Create a file in your project called something like `src/supaorm.ts` with this contents:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase.ts";
import SupaORM from "supaorm";

// Instantiate a singleton of SupaORM, referencing the database schema
const orm = SupaORM<Database>();

// Instantiate Supabase client
const supabase = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL || "",
  process.env.PUBLIC_SUPABASE_ANON_KEY || ""
);
// Connect the Supabase client with SupaORM
orm.init(supabase);

export default orm;
```

This creates your Supabase client, with a reference to your database structure, and then passes it into SupaORM.

Create a new folder called `src/services` to contain the services for your individual tables. For this example, our first file will be for a table called `organization` and called `src/services/organization.service.ts` with these contents:

```typescript
import orm from "../supaorm";

export class OrganizationService extends orm.TableService(
  "organization", // Name of the table
  "id" // Name of the primary key column
) {}
```

Now in another file in your project you can use it like this to get a list of all organizations:

```typescript
import { OrganizationService } from "./services/organization.service";

const organizations = new OrganizationService();
const orgs = await organizations.findMany();
```

To find a single organization

```typescript
const org = await organizations.findOne(id);
```

Or to get multiple rows with filtering and pagination

```typescript
const orgs = await organizations.findMany({
  select: ["id", "name"],
  where: [["country", "eq", "USA"]],
  page: 1,
  perPage: 50,
});
```
