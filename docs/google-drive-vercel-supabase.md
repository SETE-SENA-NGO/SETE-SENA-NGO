# Google Drive + Vercel + Vue 3 + Supabase Setup

This project supports two media workflows:

1. Paste a public image URL in the admin panel.
2. Upload an image in the admin panel through a Vercel Serverless Function that stores it in Google Drive.

The first workflow works now after Supabase is configured. The second workflow needs Google Drive API
credentials and Vercel secret environment variables.

## Supabase

Run the SQL files in `supabase/SETUP.md`, then configure these public frontend variables locally and
in Vercel environment variables:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_USE_GOOGLE_DRIVE_IMAGES=true
```

Set these server-side values for Vercel Serverless Functions:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

The upload function verifies the logged-in admin through Supabase Auth and RLS, so it does not need
the Supabase service-role key.

## Vercel

The repo includes `vercel.json` for SPA rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

API functions are in the `api/` directory. Vercel automatically deploys these as Serverless Functions.

In Vercel, add environment variables in Project Settings > Environment Variables. Public `VITE_`
variables need to be available during Build (Framework). Google OAuth or service-account upload
variables need to be available at Runtime (Serverless Functions).

## Google Drive Manual URL Mode

1. Upload an image into the Google Drive folder.
2. Share the file as `Anyone with the link`.
3. Copy the share URL, for example `https://drive.google.com/file/d/FILE_ID/view`.
4. Paste it in Media Library, Page Editor, News, or Donation QR fields.

The app converts normal Drive share links into thumbnail URLs automatically.

## Google Drive Upload Mode

The Vercel Serverless Function supports two Google auth styles:

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
7. Add these Vercel environment variables (Runtime scope):

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_DRIVE_AUTH_TYPE=service_account
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=base64-encoded-service-account-json
```

On Windows PowerShell, encode the service account JSON:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\service-account.json"))
```

If upload fails with `Invalid JWT Signature`, create a fresh JSON key for the same service account,
replace `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, and restart the dev server or redeploy. That error
means Google could not verify the private key signature.

### Option B: OAuth Refresh Token

Use this when the upload folder is in a personal Google My Drive account.

Add these Vercel environment variables (Runtime scope):

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_DRIVE_AUTH_TYPE=oauth
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

The local Vite dev server mounts the API functions as middleware, so admin uploads work:

```powershell
npm run dev
```

Open the app at `http://localhost:5173`. The browser can post to `POST /api/google-drive-upload`
from that same origin.

You can also use Vercel Dev when you want to test the full Vercel runtime locally:

```powershell
npx vercel dev
```

## References

- Supabase Vue quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/vue
- Vercel environment variables: https://vercel.com/docs/projects/environment-variables
- Vercel Serverless Functions: https://vercel.com/docs/functions/serverless-functions
- Google Drive uploads: https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Google Drive sharing: https://developers.google.com/workspace/drive/api/guides/manage-sharing
- Google Drive service-account ownership note: https://developers.google.com/workspace/drive/api/guides/folder
