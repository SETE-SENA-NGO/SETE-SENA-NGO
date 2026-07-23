# Supabase Setup

The Vue app reads these frontend-safe variables from `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Do not put `SUPABASE_SECRET_KEY` in the frontend `.env`. This app only needs the publishable key.

## Apply Database Schema

Open Supabase Dashboard, go to SQL Editor, and run these files in order:
Fast path for a new or partially configured project:

1. Open `supabase/complete_setup.sql`.
2. Replace `replace-with-your-admin-email@example.org` with your real admin login email.
3. Run the whole file in Supabase Dashboard > SQL Editor.

That file creates the tables, seeds default content, promotes the admin profile, and reloads the REST
schema cache.

Manual path:

Open Supabase Dashboard > SQL Editor and run these files in order:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_admin_editable_content_schema.sql`
3. `supabase/migrations/0003_media_free_tier_limits.sql`
4. `supabase/migrations/0004_home_slides.sql`
5. `supabase/migrations/0005_page_locale_uniqueness.sql`
6. `supabase/seed.sql`

## Create Admin Login

In Supabase Dashboard, go to Authentication > Users > Add user:

```text
Email: your real admin email
Password: a strong unique password
```

Then update `supabase/create_admin_profile.sql` with that email and run it to grant the Auth user
admin access. Do not use public demo credentials for production.

If `public.profiles` does not exist yet, run the migration files above first. The admin profile
helper also creates the minimal profile table so login can work, but the website CMS still needs
the full migrations and seed data.
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

If only `public.news_posts` and `public.partners` are missing, run:

```text
supabase/fix_missing_news_partners.sql
```
