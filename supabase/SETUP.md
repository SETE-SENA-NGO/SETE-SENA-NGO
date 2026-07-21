# Supabase Setup

Run this setup once per customer Supabase project.

## Frontend Variables

The Vue app needs these frontend-safe variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Never expose the service role key through a `VITE_` variable.

## Apply Database Schema

Open Supabase Dashboard > SQL Editor and run these files in order:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_admin_editable_content_schema.sql`
3. `supabase/migrations/0002_module_records.sql`
4. `supabase/migrations/0003_admin_security.sql`
5. `supabase/seed.sql`

After running the schema, refresh Supabase's REST schema cache:

```sql
select pg_notify('pgrst', 'reload schema');
```

## Create Admin Login

In Supabase Dashboard, go to Authentication > Users > Add user. Use a real site-admin email and a strong generated password.

```text
Email: customer-admin@example.org
Password: strong unique password
```

Then edit `supabase/create_admin_profile.sql`:

```text
replace-with-your-admin-email@example.org
```

Replace the placeholder with the customer's real admin email, then run the SQL file.

The admin role can be one of:

```text
super_admin
admin
editor
viewer
```

The first customer admin should usually be `super_admin`.

## Required Tables

The admin app expects these tables from the setup:

- `public.profiles`
- `public.pages`
- `public.media_assets`
- `public.donation_methods`
- `public.module_records`

If an admin page reports that a table cannot be found in the schema cache, rerun the missing migration and then run:

```sql
select pg_notify('pgrst', 'reload schema');
```
