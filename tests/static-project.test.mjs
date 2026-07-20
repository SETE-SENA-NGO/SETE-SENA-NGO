import { strict as assert } from 'node:assert'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8')
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    if (['.git', 'dist', 'node_modules', '.codex-run'].includes(entry)) continue

    const absolute = join(dir, entry)
    const stats = statSync(absolute)

    if (stats.isDirectory()) {
      walk(absolute, files)
      continue
    }

    const projectPath = relative(root, absolute).replace(/\\/g, '/')
    if (/\.(vue|ts|js|mjs|json|md|sql|env|example|html)$/.test(projectPath)) {
      files.push(projectPath)
    }
  }

  return files
}

function walkEveryFile(dir, files = []) {
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    const absolute = join(dir, entry)
    const stats = statSync(absolute)

    if (stats.isDirectory()) {
      walkEveryFile(absolute, files)
      continue
    }

    files.push(relative(root, absolute).replace(/\\/g, '/'))
  }

  return files
}

test('project text files have no merge conflict markers', () => {
  for (const file of walk(root)) {
    const body = read(file)
    assert.doesNotMatch(body, /^<{7}|^={7}|^>{7}/m, file)
  }
})

test('frontend env examples do not expose secrets or demo credentials', () => {
  for (const file of ['.env', '.env.example']) {
    const body = read(file)
    assert.doesNotMatch(body, /VITE_.*(SECRET|SERVICE|PASSWORD|PRIVATE)/i, file)
    assert.doesNotMatch(body, /password123|admin@gmail\.com/i, file)
  }
})

test('Supabase setup lists every migration in order', () => {
  const setup = read('supabase/SETUP.md')
  const expected = [
    '0001_initial.sql',
    '0002_admin_editable_content_schema.sql',
    '0003_admin_security.sql',
    '0004_media_free_tier_limits.sql',
    'seed.sql',
  ]

  let previousIndex = -1
  for (const migration of expected) {
    const index = setup.indexOf(migration)
    assert.ok(index > previousIndex, `${migration} should appear after the previous migration`)
    previousIndex = index
  }
})

test('auth roles and donation settings match the canonical schema', () => {
  const authStore = read('src/stores/auth.store.ts')
  assert.match(authStore, /super_admin/)
  assert.match(authStore, /admin/)
  assert.match(authStore, /editor/)
  assert.match(authStore, /adminRoles\.has/)
  assert.doesNotMatch(authStore, /password123|VITE_ADMIN_PASSWORD|admin@gmail\.com/)

  const donationSettings = read('src/lib/donationSettings.ts')
  assert.match(donationSettings, /slug/)
  assert.match(donationSettings, /account_number/)
  assert.match(donationSettings, /qr_media/)
  assert.match(donationSettings, /metadata/)
})

test('routes are lazy loaded and admin modules no longer use demo records', () => {
  const publicRoutes = read('src/router/publicRoutes.ts')
  const adminRoutes = read('src/router/adminRoutes.ts')
  const adminModule = read('src/views/admin/AdminModuleView.vue')

  assert.match(publicRoutes, /component: \(\) => import/)
  assert.match(adminRoutes, /component: \(\) => import/)
  assert.doesNotMatch(publicRoutes, /^import .*View/m)
  assert.doesNotMatch(adminRoutes, /^import .*View/m)
  assert.doesNotMatch(adminModule, /seedRecords/)
  assert.match(adminModule, /supabase\s*\./)
})

test('rendered images are stored as external Google Drive URLs', () => {
  const localImageFiles = [...walkEveryFile(join(root, 'src')), ...walkEveryFile(join(root, 'public'))]
    .filter((file) => /\.(png|jpe?g|webp|gif|svg|ico|avif)$/i.test(file))
    .filter((file) => !['public/favicon.ico', 'src/assets/favicon.ico'].includes(file))

  assert.deepEqual(localImageFiles, [])

  for (const file of walk(root)) {
    const body = read(file)
    assert.doesNotMatch(body, /@\/assets|new URL\(['"]@\/assets/, file)
  }

  const imageUrls = read('src/lib/imageUrls.ts')
  assert.match(imageUrls, /googleDriveImageFolderUrl/)
  assert.match(imageUrls, /googleDriveImageUrl/)
  assert.match(imageUrls, /VITE_USE_GOOGLE_DRIVE_IMAGES/)

  const mediaStore = read('src/stores/media.store.ts')
  assert.match(mediaStore, /addUrl/)
  assert.match(mediaStore, /uploadToGoogleDrive/)
  assert.match(mediaStore, /\/api\/google-drive-upload/)
  assert.doesNotMatch(mediaStore, /supabase\.storage/)

  const driveUploadFunction = read('netlify/functions/google-drive-upload.mjs')
  assert.match(driveUploadFunction, /GOOGLE_DRIVE_FOLDER_ID/)
  assert.match(driveUploadFunction, /GOOGLE_SERVICE_ACCOUNT_JSON_BASE64/)
  assert.match(driveUploadFunction, /GOOGLE_OAUTH_REFRESH_TOKEN/)
  assert.match(driveUploadFunction, /media_assets/)

  for (const migration of walk(join(root, 'supabase', 'migrations'))) {
    const body = read(migration)
    assert.doesNotMatch(body, /storage\.buckets|storage\.objects|CREATE POLICY .*media.*storage/i)
  }
})
