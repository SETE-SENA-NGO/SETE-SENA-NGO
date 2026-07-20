# Supabase Setup

The Vue app reads these frontend-safe variables from `.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Do not put `SUPABASE_SECRET_KEY` in the frontend `.env`. This app only needs the publishable key.

## Apply Database Schema

Open Supabase Dashboard, go to SQL Editor, and run these files in order:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_admin_editable_content_schema.sql`
3. `supabase/migrations/0003_media_free_tier_limits.sql`
4. `supabase/seed.sql`

## Create Admin Login

In Supabase Dashboard, go to Authentication > Users > Add user:

```text
Email: admin@gmail.com
Password: password123
```

Then run `supabase/create_admin_profile.sql` to grant that Auth user admin access.

If `public.profiles` does not exist yet, run the migration files above first. The admin profile
helper also creates the minimal profile table so login can work, but the website CMS still needs
the full migrations and seed data.
