import { Buffer } from 'node:buffer'
import { createPrivateKey, randomUUID, sign } from 'node:crypto'

const adminRoles = new Set(['super_admin', 'admin', 'editor'])
const defaultMaxUploadBytes = 8 * 1024 * 1024
const driveScope = 'https://www.googleapis.com/auth/drive'

export default async function googleDriveUpload(request) {
  if (request.method === 'OPTIONS') return emptyResponse(204)
  if (request.method === 'GET') return adminStatusResponse(request)
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const config = readConfig()
    const user = await requireAdminUser(request, config)
    const formData = await request.formData()
    const file = formData.get('file')

    if (!isUploadFile(file)) {
      return jsonResponse({ error: 'Choose an image file to upload.' }, 400)
    }

    const maxUploadBytes = Number(process.env.GOOGLE_DRIVE_MAX_UPLOAD_BYTES || defaultMaxUploadBytes)
    if (file.size > maxUploadBytes) {
      return jsonResponse({ error: `Image is too large. Limit is ${formatBytes(maxUploadBytes)}.` }, 413)
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      return jsonResponse({ error: 'Only image uploads are allowed.' }, 400)
    }

    const requestedName = stringValue(formData.get('name'))
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
    const media = await saveMediaAsset(config.supabase, {
      userId: user.id,
      authorization: user.authorization,
      fileName,
      publicUrl,
      mimeType,
      size: file.size,
      driveFile,
    })

    return jsonResponse({
      url: publicUrl,
      fileId: driveFile.id,
      media,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.'
    const status = typeof error?.status === 'number' ? error.status : 500
    const details = error?.details && typeof error.details === 'object' ? error.details : undefined
    return jsonResponse({ error: message, details }, status)
  }
}

export const config = {
  path: '/api/google-drive-upload',
}

function readConfig() {
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
    throw httpError(`Missing Netlify environment variables: ${missing.join(', ')}`, 500)
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
  const authType = env('GOOGLE_DRIVE_AUTH_TYPE').toLowerCase()
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

async function requireAdminUser(request, config) {
  const admin = await resolveAdminContext(request, config)

  if (!admin.ok) {
    throw httpError(admin.error, admin.status, publicAdminContext(admin))
  }

  return {
    id: admin.user.id,
    authorization: admin.authorization,
  }
}

async function adminStatusResponse(request) {
  try {
    const admin = await resolveAdminContext(request, readConfig())
    return jsonResponse(publicAdminContext(admin), admin.ok ? 200 : admin.status)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not check admin status.'
    const status = typeof error?.status === 'number' ? error.status : 500
    return jsonResponse({ ok: false, step: 'config', error: message }, status)
  }
}

async function resolveAdminContext(request, config) {
  const authorization = request.headers.get('authorization') || ''
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
    headers,
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

async function googleAccessToken(config) {
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
  const content = Buffer.from(await file.arrayBuffer())
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
<<<<<<< HEAD
    throw httpError(data?.error?.message || 'Could not upload image to Google Drive.', 502)
=======
<<<<<<< HEAD
    throw httpError(data?.error?.message || 'Could not upload image to Google Drive.', 502)
=======
    throw httpError(driveErrorMessage(data, 'Could not upload image to Google Drive.'), 502, {
      step: 'google-drive-upload',
      googleMessage: driveErrorMessage(data, 'Could not upload image to Google Drive.'),
    })
>>>>>>> 55583b0716dc2b69d3d421af643b1a41cdef9c57
>>>>>>> feature/admin-media
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

async function saveMediaAsset(config, { userId, fileName, publicUrl, mimeType, size, driveFile }) {
  const response = await fetch(
    `${config.url}/rest/v1/media_assets?on_conflict=bucket,path&select=id,bucket,path,public_url,file_name,mime_type,file_size,created_at`,
    {
      method: 'POST',
      headers: {
        ...userHeaders(config, authorization),
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
    throw httpError(data?.message || 'Image uploaded, but Supabase media record could not be saved.', 502, {
      step: 'media-assets-save',
      supabaseStatus: response.status,
      supabaseMessage: responseDataMessage(data, response.statusText),
    })
  }

  return Array.isArray(data) ? data[0] : data
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> feature/admin-media
function serviceHeaders(config) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
  }
<<<<<<< HEAD
=======
=======
async function ensureMediaAssetsReady(config, authorization) {
  const response = await fetch(`${config.url}/rest/v1/media_assets?select=id&limit=1`, {
    method: 'GET',
    headers: userHeaders(config, authorization),
  })

  if (response.ok) return

  const message = await responseErrorMessage(response)
  throw httpError(
    'Supabase media table is not ready. Run supabase/complete_setup.sql before uploading images.',
    502,
    {
      step: 'media-assets-check',
      supabaseStatus: response.status,
      supabaseMessage: message,
    },
  )
}

function userHeaders(config, authorization) {
  return {
    apikey: config.anonKey,
    authorization,
  }
}

function publicAdminContext(context) {
  const { authorization: _authorization, ...safeContext } = context
  return safeContext
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
  }
}

function publicProfile(profile) {
  return {
    email: profile.email,
    role: profile.role,
  }
}

async function responseErrorMessage(response) {
  const data = await response.json().catch(() => null)
  return responseDataMessage(data, response.statusText)
}

function responseDataMessage(data, fallback) {
  return data?.message || data?.error_description || data?.error || fallback
>>>>>>> 55583b0716dc2b69d3d421af643b1a41cdef9c57
>>>>>>> feature/admin-media
}

function googleThumbnailUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`
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

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  })
}

function emptyResponse(status) {
  return new Response(null, { status })
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

