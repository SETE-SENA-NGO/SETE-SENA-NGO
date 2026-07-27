import {
  googleAccessToken,
  googleDriveFileIdFromUrl,
  readConfig,
} from './google-drive-upload.mjs'

export default async function googleDriveImage(request) {
  if (request.method === 'OPTIONS') return emptyResponse(204)
  if (request.method !== 'GET') return textResponse('Method not allowed', 405)

  try {
    const url = new URL(request.url)
    const id = fileIdFromRequest(url)
    if (!id) return textResponse('Google Drive image id is required.', 400)

    const config = readConfig()
    const accessToken = await googleAccessToken(config.google)
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        id,
      )}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const message = await response.text().catch(() => '')
      return textResponse(message || 'Could not load Google Drive image.', response.status)
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
        'content-type': response.headers.get('content-type') || 'image/jpeg',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load Google Drive image.'
    return textResponse(message, 500)
  }
}

export const config = {
  path: '/api/google-drive-image',
}

function fileIdFromRequest(url) {
  const id = url.searchParams.get('id')
  if (id) return id

  const sourceUrl = url.searchParams.get('url')
  if (sourceUrl) return googleDriveFileIdFromUrl(sourceUrl)

  return ''
}

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}

function emptyResponse(status) {
  return new Response(null, { status })
}
