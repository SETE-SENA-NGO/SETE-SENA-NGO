# Santi Sena NGO Website

Vue 3 + Vite public website with a Supabase-backed admin console and Google Drive media uploads through Netlify Functions.

## Customer Setup

For production handoff, start here:

- [Customer handoff checklist](docs/customer-handoff.md)
- [Supabase setup](supabase/SETUP.md)
- [Environment template](.env.example)

The customer only needs to provide environment variables and run the Supabase SQL setup. No credentials should be committed to the repo.

## Required Production Services

- Netlify site connected to this repository
- Supabase project for auth, database, and admin roles
- Google Drive folder for uploaded images
- Google OAuth credentials for personal My Drive uploads, or a service account for Google Workspace Shared Drive uploads

## Local Development

```sh
npm install
cp .env.example .env
npm run dev
```

Fill only local development values in `.env`. Production secrets belong in Netlify environment variables.
During local development, Vite serves `POST /api/google-drive-upload` through the same function used
on Netlify, so admin image uploads work from `http://localhost:5173`.

## Production Build

```sh
npm run dev          # local development
npm run type-check   # Vue/TypeScript check
npm run lint         # Oxlint + ESLint autofix
npm run test         # static project safety tests
npm run build        # type-check + production bundle
```

## Deployment

Netlify uses the same command from `netlify.toml` and publishes `dist`. For another static host, build with `npm run build` and deploy the generated `dist/` directory. Configure the same public Supabase environment variables in the host dashboard.

Before production, rotate any secret that was ever placed in a frontend `.env`, keep RLS enabled, and verify admin users use real emails and strong generated passwords.

## Admin Media Uploads

The admin media library uploads images to:

```text
POST /api/google-drive-upload
```

That Netlify Function checks the logged-in Supabase admin role, uploads the image to Google Drive, makes it publicly readable, and stores the public image URL in `public.media_assets`.

For personal Google Drive accounts, use OAuth refresh-token credentials. Service accounts require a Google Workspace Shared Drive.
