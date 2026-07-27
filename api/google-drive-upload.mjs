import { Buffer } from 'node:buffer'
import { createPrivateKey, randomUUID, sign } from 'node:crypto'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Busboy = require('busboy')

const adminRoles = new Set(['super_admin', 'admin', 'editor'])
const defaultMaxUploadBytes = 8 * 1024 * 1024
const driveScope = 'https://www.googleapis.com/auth/drive'

/**
 * Vercel Serverless Function – Google Drive upload, admin status check, and delete.
 *
 * POST   /api/google-drive-upload  – upload an image to Google Drive
 * GET    /api/google-drive-upload  – check admin status
 * DELETE /api/google-drive-upload  – delete a media asset (and its Drive file)
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    await adminStatusResponse(req, res)
    return
  }

  if (req.method === 'DELETE') {
    await deleteMediaAssetResponse(req, res)
    return
  }

  if (req.method !== 'POST') {
    json(res, { error: 'Method not allowed' }, 405)
    return
  }

  try {
    const config = readConfig()
    const user = await requireAdminUser(req, config)

    const { files } = await parseMultipartForm(req)
    const file = files.file

    if (!isUploadFile(file)) {
      json(res, { error: 'Choose an image file to upload.' }, 400)
      return
    }

    const maxUploadBytes = Number(process.env.GOOGLE_DRIVE_MAX_UPLOAD_BYTES || defaultMaxUploadBytes)
    if (file.size > maxUploadBytes) {
      json(res, { error: `Image is too large. Limit is ${formatBytes(maxUploadBytes)}.` }, 413)
      return
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      json(res, { error: 'Only image uploads are allowed.' }, 400)
      return
    }

    const requestedName = stringValue(file.name) // fallback; the form may not send a name field separately
    const fileName = sanitizeFileName(requestedName || file.name || `image-${Date.now()}.jpg`)
    await ensureMediaAssetsReady(config.supabase, user.authorization)

    const accessToken = await googleAccessToken(config.google)
    const driveFile = await uploadDriveFile({
      accessToken,
      file,
      fileName,
      folderId: config.google.folderId,
      mimeType,
    })

    await makeDriveFilePublic(accessToken, driveFile.id)

    const publicUrl = googleThumbnailUrl(driveFile.id)
    const media = await saveMediaAsset(
      config.supabase,
      {
        userId: user.id,
        authorization: user.authorization,
        fileName,
        publicUrl,
        mimeType,
        size: file.size,
        driveFile,
      },
      user.authorization,
    )

    json(res, {
      url: publicUrl,
      fileId: driveFile.id,
      media,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
    const status = typeof error?.status === 'number' ? error.status : 500
    const details = error?.details && typeof error.details === 'object' ? error.details : undefined
    json(res, { error: message, details }, status)
  }
}

// ── Parsing ──────────────────────────────────────────────────────

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers })
    const fields = {}
    const files = {}

    busboy.on('field', (name, val) => {
      fields[name] = val
    })

    busboy.on('file', (fieldname, stream, info) => {
      const { filename, encoding, mimeType: detectedMime } = info
      const chunks = []

      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => {
        const buf = Buffer.concat(chunks)
        files[fieldname] = {
          name: filename,
          size: buf.length,
          type: detectedMime,
          encoding,
          arrayBuffer: () => Promise.resolve(buf.buffer),
          buffer: buf,
        }
      })
    })

    busboy.on('finish', () => resolve({ fields, files }))
    busboy.on('error', reject)

    req.pipe(busboy)
  })
}

// ── Admin helpers ────────────────────────────────────────────────

async function deleteMediaAssetResponse(req, res) {
  try {
    const config = readConfig()
    const user = await requireAdminUser(req, config)
    const payload = await readJsonBody(req)
    const mediaId = stringValue(payload?.id || payload?.mediaId)

    if (!mediaId) {
      json(res, { error: 'Media asset id is required.' }, 400)
      return
    }

    await ensureMediaAssetsReady(config.supabase, user.authorization)

    const media = await getMediaAsset(config.supabase, {
      id: mediaId,
      authorization: user.authorization,
    })

    if (!media) {
      json(res, { deleted: true, media: null })
      return
    }

    const driveFileId = googleDriveFileIdFromMedia(media)
    if (driveFileId) {
      const accessToken = await googleAccessToken(config.google)
      await deleteDriveFile(accessToken, driveFileId)
    }

    await deleteMediaAsset(config.supabase, {
      id: mediaId,
      authorization: user.authorization,
    })

    json(res, {
      deleted: true,
      media: {
        id: media.id,
        bucket: media.bucket,
        path: media.path,
        googleDriveFileId: driveFileId || null,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed.'
    const status = typeof error?.status === 'number' ? error.status : 500
    const details = error?.details && typeof error.details === 'object' ? error.details : undefined
    json(res, { error: message, details }, status)
  }
}

async function adminStatusResponse(req, res) {
  try {
    const admin = await resolveAdminContext(req, readConfig())
    json(res, publicAdminContext(admin), admin.ok ? 200 : admin.status)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not check admin status.'
    const status = typeof error?.status === 'number' ? error.status : 500
    json(res, { ok: false, step: 'config', error: message }, status)
  }
}

export function readConfig() {
  const supabaseUrl = env('SUPABASE_URL') || env('VITE_SUPABASE_URL')
  const supabaseAnonKey =
    env('SUPABASE_PUBLISHABLE_KEY') ||
    env('VITE_SUPABASE_PUBLISHABLE_KEY') ||
    env('SUPABASE_ANON_KEY')
  const folderId = env('GOOGLE_DRIVE_FOLDER_ID')
  const googleAuth = googleAuthConfig()

  const missing = []
  if (!supabaseUrl) missing.push('SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('SUPABASE_PUBLISHABLE_KEY')
  if (!folderId) missing.push('GOOGLE_DRIVE_FOLDER_ID')
  missing.push(...missingGoogleAuthFields(googleAuth))

  if (missing.length) {
    throw httpError(`Missing Vercel environment variables: ${missing.join(', ')}`, 500)
  }

  return {
    supabase: {
      url: trimSlash(supabaseUrl),
      anonKey: supabaseAnonKey,
    },
    google: {
      folderId,
      scope: env('GOOGLE_DRIVE_SCOPE') || driveScope,
      ...googleAuth,
    },
  }
}

function googleAuthConfig() {
  const authType = env('GOOGLE_DRIVE_AUTH_TYPE')?.toLowerCase()
  const refreshToken = env('GOOGLE_OAUTH_REFRESH_TOKEN')
  if (authType === 'oauth' || refreshToken) {
    return {
      authType: 'oauth',
      clientId: env('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: env('GOOGLE_OAUTH_CLIENT_SECRET'),
      refreshToken,
    }
  }

  const encoded = env('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64')
  if (encoded) {
    let json
    try {
      json = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
    } catch {
      throw httpError('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not valid base64-encoded JSON.', 500)
    }

    return {
      authType: 'service_account',
      clientEmail: stringValue(json.client_email),
      privateKey: stringValue(json.private_key).replace(/\\n/g, '\n'),
    }
  }

  return {
    authType: 'service_account',
    clientEmail: env('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    privateKey: env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
  }
}

function missingGoogleAuthFields(config) {
  if (config.authType === 'oauth') {
    return [
      ['GOOGLE_OAUTH_CLIENT_ID', config.clientId],
      ['GOOGLE_OAUTH_CLIENT_SECRET', config.clientSecret],
      ['GOOGLE_OAUTH_REFRESH_TOKEN', config.refreshToken],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name)
  }

  const missing = []
  if (!config.clientEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  if (!config.privateKey) missing.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
  return missing
}

async function requireAdminUser(req, config) {
  const admin = await resolveAdminContext(req, config)

  if (!admin.ok) {
    throw httpError(admin.error, admin.status, publicAdminContext(admin))
  }

  return {
    id: admin.user.id,
    authorization: admin.authorization,
  }
}

async function resolveAdminContext(req, config) {
  const authorization = req.headers['authorization'] || ''
  if (!authorization.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      step: 'authorization',
      error: 'Admin login is required.',
    }
  }

  const headers = userHeaders(config.supabase, authorization)

  const userResponse = await fetch(`${config.supabase.url}/auth/v1/user`, {
    headers,
  })

  if (!userResponse.ok) {
    return {
      ok: false,
      status: 401,
      step: 'auth-user',
      error: 'Admin login is invalid or expired.',
      supabaseStatus: userResponse.status,
      supabaseMessage: await responseErrorMessage(userResponse),
    }
  }

  const user = await userResponse.json()
  if (!user?.id) {
    return {
      ok: false,
      status: 401,
      step: 'auth-user',
      error: 'Admin login is invalid or expired.',
    }
  }

  const profileUrl = `${config.supabase.url}/rest/v1/profiles?id=eq.${encodeURIComponent(
    user.id,
  )}&select=id,email,role&limit=1`

  const profileResponse = await fetch(profileUrl, {
    headers: {
      apikey: config.supabase.anonKey,
      authorization,
      'content-type': 'application/json',
    },
  })

  if (!profileResponse.ok) {
    return {
      ok: false,
      status: 403,
      step: 'profile-read',
      error: 'Could not read your admin profile from Supabase.',
      user: publicUser(user),
      supabaseStatus: profileResponse.status,
      supabaseMessage: await responseErrorMessage(profileResponse),
    }
  }

  const profiles = await profileResponse.json()
  const profile = profiles?.[0] ?? null

  if (!profile) {
    return {
      ok: false,
      status: 403,
      step: 'profile-missing',
      error: `No public.profiles row was found for ${user.email || user.id}.`,
      user: publicUser(user),
      profile: null,
    }
  }

  const role = profile.role
  const ok = adminRoles.has(role)

  return {
    ok,
    status: ok ? 200 : 403,
    step: 'role-check',
    error: ok
      ? ''
      : `Your profile role is "${role || 'missing'}"; uploads require super_admin, admin, or editor.`,
    user: publicUser(user),
    profile: publicProfile(profile),
    authorization,
  }
}

export async function googleAccessToken(config) {
  if (config.authType === 'oauth') return googleOAuthAccessToken(config)
  return googleServiceAccountAccessToken(config)
}

async function googleOAuthAccessToken(config) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    throw googleAuthError(config, data)
  }

  return data.access_token
}

async function googleServiceAccountAccessToken(config) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlJson({ alg: 'RS256', typ: 'JWT' })
  const payload = base64UrlJson({
    iss: config.clientEmail,
    scope: config.scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })
  const signingInput = `${header}.${payload}`
  const key = createPrivateKey(config.privateKey)
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), key).toString('base64url')
  const assertion = `${signingInput}.${signature}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.access_token) {
    throw googleAuthError(config, data)
  }

  return data.access_token
}

async function uploadDriveFile({ accessToken, file, fileName, folderId, mimeType }) {
  const boundary = `santi-sena-${randomUUID()}`
  const metadata = {
    name: fileName,
    parents: [folderId],
  }
  const content = file.buffer || Buffer.from(await file.arrayBuffer())
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
        metadata,
      )}\r\n`,
    ),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    content,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ])

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,webViewLink',
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': `multipart/related; boundary=${boundary}`,
        'content-length': String(body.length),
      },
      body,
    },
  )

  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.id) {
    throw httpError(data?.error?.message || 'Could not upload image to Google Drive.', 502)
  }

  return data
}

async function makeDriveFilePublic(accessToken, fileId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId,
    )}/permissions?supportsAllDrives=true`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    },
  )

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw httpError(
      data?.error?.message ||
        'Image uploaded, but Google Drive did not allow public sharing for this file.',
      502,
      {
        step: 'google-drive-share',
        googleMessage: driveErrorMessage(
          data,
          'Image uploaded, but Google Drive did not allow public sharing for this file.',
        ),
      },
    )
  }
}

function driveErrorMessage(data, fallback) {
  const message = data?.error?.message
  if (typeof message !== 'string') return fallback

  if (/service accounts do not have storage quota/i.test(message)) {
    return [
      'Google Drive rejected the upload because the service account cannot own files in a normal My Drive folder.',
      'Use a Google Workspace Shared Drive folder, or configure Google OAuth with GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN.',
    ].join(' ')
  }

  return message
}

async function saveMediaAsset(
  config,
  { userId, fileName, publicUrl, mimeType, size, driveFile },
  authorization,
) {
  const response = await fetch(
    `${config.url}/rest/v1/media_assets?on_conflict=bucket,path&select=id,bucket,path,public_url,file_name,mime_type,file_size,created_at`,
    {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        authorization,
        'content-type': 'application/json',
        prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        bucket: 'google-drive',
        path: publicUrl,
        public_url: publicUrl,
        file_name: fileName,
        mime_type: mimeType,
        file_size: size,
        folder: 'google-drive',
        uploaded_by: userId,
        metadata: {
          google_drive_file_id: driveFile.id,
          google_drive_web_view_link:
            driveFile.webViewLink || `https://drive.google.com/file/d/${driveFile.id}/view`,
        },
      }),
    },
  )

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw httpError(
      data?.message || 'Image uploaded, but Supabase media record could not be saved.',
      502,
      {
        step: 'media-assets-save',
        supabaseStatus: response.status,
        supabaseMessage: responseDataMessage(data, response.statusText),
      },
    )
  }

  return Array.isArray(data) ? data[0] : data
}

function userHeaders(config, authorization) {
  return {
    apikey: config.anonKey,
    authorization,
    'content-type': 'application/json',
  }
}

async function ensureMediaAssetsReady(config, authorization) {
  const response = await fetch(`${config.url}/rest/v1/media_assets?select=id&limit=1`, {
    method: 'GET',
    headers: userHeaders(config, authorization),
  })

  if (response.ok) return

  const data = await response.json().catch(() => null)
  const message = responseDataMessage(data, response.statusText)

  if (response.status === 404 || data?.code === 'PGRST205' || /schema cache/i.test(message)) {
    throw httpError(
      'Supabase media_assets table is missing. Run supabase/complete_setup.sql, then try again.',
      503,
      { step: 'media-assets-check', supabaseStatus: response.status, supabaseMessage: message },
    )
  }

  throw httpError(message || 'Could not verify the media_assets table is ready.', 502, {
    step: 'media-assets-check',
    supabaseStatus: response.status,
    supabaseMessage: message,
  })
}

async function getMediaAsset(config, { id, authorization }) {
  const response = await fetch(
    `${config.url}/rest/v1/media_assets?id=eq.${encodeURIComponent(
      id,
    )}&select=id,bucket,path,public_url,file_name,mime_type,file_size,metadata&limit=1`,
    { headers: userHeaders(config, authorization) },
  )

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw httpError(
      responseDataMessage(data, 'Could not read the media asset.'),
      response.status === 404 ? 404 : 502,
      { step: 'media-assets-read', supabaseStatus: response.status },
    )
  }

  const rows = await response.json().catch(() => [])
  return Array.isArray(rows) ? rows[0] ?? null : null
}

async function deleteMediaAsset(config, { id, authorization }) {
  const response = await fetch(`${config.url}/rest/v1/media_assets?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: userHeaders(config, authorization),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw httpError(responseDataMessage(data, 'Could not delete the media asset record.'), 502, {
      step: 'media-assets-delete',
      supabaseStatus: response.status,
    })
  }
}

async function deleteDriveFile(accessToken, fileId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
    {
      method: 'DELETE',
      headers: { authorization: `Bearer ${accessToken}` },
    },
  )

  if (!response.ok && response.status !== 404) {
    const data = await response.json().catch(() => null)
    throw httpError(data?.error?.message || 'Could not delete the image from Google Drive.', 502, {
      step: 'google-drive-delete',
      supabaseStatus: response.status,
    })
  }
}

function googleDriveFileIdFromMedia(media) {
  const metaId = media?.metadata?.google_drive_file_id
  if (typeof metaId === 'string' && metaId) return metaId

  return googleDriveFileIdFromUrl(media?.public_url || media?.path || '')
}

export function googleDriveFileIdFromUrl(value) {
  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.hostname === 'drive.google.com') {
      const match = url.pathname.match(/\/(?:file\/)?d\/([^/?#]+)/)
      return match?.[1] || url.searchParams.get('id') || ''
    }
    if (url.hostname === 'lh3.googleusercontent.com') {
      const match = url.pathname.match(/\/d\/([^/?#=]+)/)
      return match?.[1] || ''
    }
  } catch {
    return ''
  }

  return ''
}

// ── Body reading helpers ─────────────────────────────────────────

async function readJsonBody(req) {
  try {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks).toString('utf8')
    return body ? JSON.parse(body) : null
  } catch {
    return null
  }
}

// ── Response helpers ─────────────────────────────────────────────

function json(res, body, status = 200) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

// ── Utilities ────────────────────────────────────────────────────

function publicUser(user) {
  return {
    id: user?.id,
    email: user?.email,
  }
}

function publicProfile(profile) {
  return {
    role: profile?.role ?? null,
  }
}

function publicAdminContext(admin) {
  return {
    ok: admin.ok,
    step: admin.step,
    error: admin.error,
    user: admin.user,
    profile: admin.profile,
    supabaseStatus: admin.supabaseStatus,
  }
}

async function responseErrorMessage(response) {
  const data = await response.json().catch(() => null)
  return responseDataMessage(data, response.statusText)
}

function responseDataMessage(data, fallback) {
  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof data?.error === 'string' && data.error) return data.error
  if (typeof data?.error?.message === 'string' && data.error.message) return data.error.message
  return fallback || 'Unknown error.'
}

function googleAuthError(config, data) {
  const message = data?.error_description || data?.error || 'Could not authorize Google Drive.'
  return httpError(message, 502, {
    step: 'google-auth',
    googleAuthType: config.authType,
    googleMessage: message,
  })
}

function googleThumbnailUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w3200`
}

function sanitizeFileName(value) {
  const clean = value
    .replace(/[^\w.\- ]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)

  return clean || `image-${Date.now()}.jpg`
}

function isUploadFile(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.arrayBuffer === 'function' &&
      typeof value.size === 'number',
  )
}

function httpError(message, status, details) {
  const error = new Error(message)
  error.status = status
  if (details) error.details = details
  return error
}

function env(name) {
  return process.env[name]?.trim() || ''
}

function trimSlash(value) {
  return value.replace(/\/+$/, '')
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Math.round(bytes / (1024 * 1024))} MB`
}
