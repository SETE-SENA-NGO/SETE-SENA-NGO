# Google Drive + Netlify + Vue 3 + Supabase Setup

This project supports two media workflows:

1. Paste a public image URL in the admin panel.
2. Upload an image in the admin panel through a Netlify Function that stores it in Google Drive.

The first workflow works now after Supabase is configured. The second workflow needs Google Drive API
credentials and Netlify secret environment variables.

## Supabase

Run the SQL files in `supabase/SETUP.md`, then configure these public frontend variables locally and
in Netlify build variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_USE_GOOGLE_DRIVE_IMAGES=false
```

Set this secret only for Netlify Functions:

```env
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Never use `VITE_` for the service role key.

## Netlify

The repo includes `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"
```

In Netlify, add environment variables in Project configuration > Environment variables. Public
`VITE_` variables need Build scope. Secret upload variables need Functions scope.

## Google Drive Manual URL Mode

1. Upload an image into the Google Drive folder.
2. Share the file as `Anyone with the link`.
3. Copy the share URL, for example `https://drive.google.com/file/d/FILE_ID/view`.
4. Paste it in Media Library, Page Editor, News, or Donation QR fields.

The app converts normal Drive share links into thumbnail URLs automatically.

## Google Drive Upload Mode

The Netlify Function supports two Google auth styles:

- Service account JSON: best when the target folder is in a Google Workspace Shared Drive.
- OAuth refresh token: best when the target folder is in a normal personal My Drive account.

Google's Drive API docs note that service accounts don't have normal Drive storage ownership, so
personal My Drive uploads can fail even when the folder is shared with the service account. If that
happens, use the OAuth option.

### Option A: Service Account

1. Create a Google Cloud project.
2. Enable Google Drive API.
3. Create a service account.
4. Create a JSON key for the service account.
5. Share your website image folder with the service account email as Editor.
6. Copy the folder ID from the Google Drive folder URL.
7. Add these Netlify Function secrets:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=base64-encoded-service-account-json
```

On Windows PowerShell, encode the service account JSON:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\service-account.json"))
```

### Option B: OAuth Refresh Token

Use this when the upload folder is in a personal Google My Drive account.

Add these Netlify Function secrets instead of the service-account JSON:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
```

The upload endpoint is:

```text
POST /api/google-drive-upload
```

The Vue admin Media Library sends the logged-in Supabase access token to that endpoint. The function
checks the user's `profiles.role`, uploads the image to Google Drive, makes it public, and saves the
resulting URL into `media_assets`.

## Local Testing

Use Netlify Dev for testing the upload function locally:

```powershell
npx netlify dev
```

Plain `npm run dev` runs only Vite. It can test pasted image URLs, but not the Netlify upload
function.

## References

- Supabase Vue quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/vue
- Netlify environment variables: https://docs.netlify.com/build/environment-variables/overview/
- Netlify Functions API: https://docs.netlify.com/build/functions/api/
- Google Drive uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Google Drive sharing: https://developers.google.com/workspace/drive/api/guides/manage-sharing
- Google Drive service-account ownership note: https://developers.google.com/workspace/drive/api/guides/folder
