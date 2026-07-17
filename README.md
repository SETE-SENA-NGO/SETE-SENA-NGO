# Santi Sena NGO Website

Vue 3 + Vite website and Supabase-backed admin console for Santi Sena NGO.

## Stack

- Vue 3, Vue Router, Pinia, TypeScript
- Vite build tooling
- Supabase Auth, Postgres, and RLS
- Admin CMS for pages, media, donations, programs, news, partners, impact records, and profiles

## Local Setup

1. Install dependencies:

```sh
npm install
```

2. Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Only frontend-safe Supabase values belong in `.env`. Do not add service-role keys, secret keys, or passwords.

3. Run the app:

```sh
npm run dev
```

## Supabase Setup

Run the SQL files in this order from the Supabase SQL Editor:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_admin_editable_content_schema.sql`
3. `supabase/migrations/0003_admin_security.sql`
4. `supabase/migrations/0004_media_free_tier_limits.sql`
5. `supabase/seed.sql`

Create admin users in Supabase Auth, then grant their role through `supabase/create_admin_profile.sql` or by updating `public.profiles.role` to `super_admin`, `admin`, or `editor`.

## Image Storage

The website does not store rendered images in the repo or Supabase Storage. Image values point to Google Drive URLs from `src/lib/imageUrls.ts` or URL rows in `public.media_assets`; the current folder is test storage only. When the customer provides their real Google account/folder, upload the images there, make the files publicly viewable, and replace the file IDs or saved URLs.

Admin testing flow:

1. Upload the image to Google Drive.
2. Share the file as publicly viewable by link.
3. Paste the public image URL in `/admin/media`, `/admin/editor/{page-slug}`, or `/admin/donate`.
4. Save, then open the public page to confirm the image renders.

## Scripts

```sh
npm run dev          # local development
npm run type-check   # Vue/TypeScript check
npm run lint         # Oxlint + ESLint autofix
npm run test         # static project safety tests
npm run build        # type-check + production bundle
```

## Deployment

Build with `npm run build` and deploy the generated `dist/` directory to your static host. Configure the same public Supabase environment variables in the host dashboard.

Before production, rotate any secret that was ever placed in a frontend `.env`, keep RLS enabled, and verify admin users use real emails and strong generated passwords.
