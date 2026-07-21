# Customer Handoff Checklist

This project is ready for customer deployment when the customer provides the credentials below and runs the Supabase setup SQL.

## Credentials To Request

Ask the customer for these values:

### Supabase

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_URL` can be the same value as `VITE_SUPABASE_URL`. `SUPABASE_SERVICE_ROLE_KEY` is private and must never be added to frontend code or a `VITE_` variable.

### Google Drive

For a normal personal Google Drive folder, ask for OAuth credentials:

```env
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```

For a Google Workspace Shared Drive folder, a service account can be used instead:

```env
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=
```

Do not use a service account with a normal personal My Drive folder. Google rejects those uploads because service accounts do not have personal Drive storage quota.

### Admin Account

Ask for the first admin email address. The customer creates the Auth user in Supabase, then runs `supabase/create_admin_profile.sql` with that email.

## Netlify Environment Variables

Add these in Netlify under Project configuration > Environment variables.

Build scope:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Functions scope:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```

If the customer uses a Workspace Shared Drive service account, use `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` instead of the three OAuth values.

## Supabase Setup Order

Open Supabase SQL Editor and run:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_admin_editable_content_schema.sql`
3. `supabase/migrations/0002_module_records.sql`
4. `supabase/migrations/0003_admin_security.sql`
5. `supabase/seed.sql`

Then create the first admin:

1. Supabase Dashboard > Authentication > Users > Add user.
2. Use the customer's real admin email and a strong password.
3. Edit `supabase/create_admin_profile.sql` and replace `replace-with-your-admin-email@example.org`.
4. Run the edited SQL.

## Google OAuth Setup

Use OAuth for normal personal Google Drive folders:

1. Create or select a Google Cloud project.
2. Enable Google Drive API.
3. Configure Google Auth Platform.
4. Create a Web OAuth client.
5. Add this authorized redirect URI:

```text
https://developers.google.com/oauthplayground
```

6. In OAuth Playground, use the customer's OAuth client ID and secret.
7. Use access type `Offline` and force prompt `Consent Screen`.
8. Authorize this scope:

```text
https://www.googleapis.com/auth/drive
```

9. Exchange the authorization code for tokens.
10. Save the refresh token as `GOOGLE_OAUTH_REFRESH_TOKEN`.

## Deploy And Verify

1. Trigger a Netlify deploy.
2. Confirm build, deploy, and post-processing complete.
3. Open `/admin/login` and sign in as the admin user.
4. Open `/admin/media`.
5. Upload a small JPG or PNG.
6. Confirm the image appears in the customer's Google Drive folder.
7. Confirm the image appears in the Media Library.
8. Open `/admin/donate`, save donation settings, and confirm the public donate page updates.

## Common Errors

`Admin login is required.`

The upload function is reachable, but the request is not logged in as an admin.

`Service Accounts do not have storage quota.`

The customer used a service account with a personal My Drive folder. Switch to OAuth, or move the folder to a Google Workspace Shared Drive.

`Could not find the table 'public.media_assets' in the schema cache.`

The Supabase schema was not applied, or PostgREST has not reloaded. Run the Supabase setup SQL, then wait 30 seconds or run:

```sql
select pg_notify('pgrst', 'reload schema');
```

`Failed to save donation settings.`

Confirm `public.donation_methods` exists from `0002_admin_editable_content_schema.sql`, and confirm the logged-in profile role is `super_admin`, `admin`, or `editor`.
