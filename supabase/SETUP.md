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
3. `supabase/migrations/0003_admin_security.sql`
4. `supabase/migrations/0004_media_free_tier_limits.sql`
5. `supabase/seed.sql`

## Create Admin Login

In Supabase Dashboard, go to Authentication > Users > Add user. Use a real site-admin email and a strong generated password.

```text
Email: your-admin@example.com
Password: use a strong generated password
```

Then edit `supabase/create_admin_profile.sql` with that email and run it to grant admin access.

If `public.profiles` does not exist yet, run the migration files above first. The admin profile
helper also creates the minimal profile table so login can work, but the website CMS still needs
the full migrations and seed data.

## Image URLs

Frontend fallback images use built-in placeholders until Google Drive is ready. To turn on the
default Google Drive images, make every file publicly viewable and set this Netlify environment
variable:

```env
VITE_USE_GOOGLE_DRIVE_IMAGES=true
```

The current admin media library stores image URLs in Supabase. It does not upload files into Google
Drive by itself. A real "upload to someone's Google Drive" workflow needs a backend such as Netlify
Functions with Google Drive API credentials or OAuth consent from the Drive owner.

To test from the admin panel, upload an image to Drive, share it publicly by link, paste the URL in
Media URLs, a page editor hero/section image field, or Donation QR, then save and refresh the public
page.
