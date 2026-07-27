import {
  googleAccessToken,
  googleDriveFileIdFromUrl,
  readConfig,
} from './google-drive-upload.mjs'

/**
 * Vercel Serverless Function – proxy Google Drive image requests.
 *
 * GET /api/google-drive-image?id=FILE_ID
 * GET /api/google-drive-image?url=DRIVE_SHARE_URL
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405)
    res.setHeader('content-type', 'text/plain; charset=utf-8')
    res.end('Method not allowed')
    return
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const id = fileIdFromRequest(url)
    if (!id) {
      res.status(400)
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end('Google Drive image id is required.')
      return
    }

    const config = readConfig()
    const accessToken = await googleAccessToken(config.google)

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        id,
      )}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!driveResponse.ok) {
      const message = await driveResponse.text().catch(() => '')
      res.status(driveResponse.status)
      res.setHeader('content-type', 'text/plain; charset=utf-8')
      res.end(message || 'Could not load Google Drive image.')
      return
    }

    const contentType = driveResponse.headers.get('content-type') || 'image/jpeg'

    // Stream the Google Drive response back to the client
    res.writeHead(200, {
      'cache-control': 'public, max-age=31536000, immutable',
      'content-type': contentType,
    })

    if (driveResponse.body) {
      const reader = driveResponse.body.getReader()
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              res.end()
              break
            }
            res.write(Buffer.from(value))
          }
        } catch (err) {
          res.end()
        }
      }
      pump()
    } else {
      // Fallback: read the entire response body
      const buffer = Buffer.from(await driveResponse.arrayBuffer())
      res.end(buffer)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load Google Drive image.'
    res.status(500)
    res.setHeader('content-type', 'text/plain; charset=utf-8')
    res.end(message)
  }
}

function fileIdFromRequest(url) {
  const id = url.searchParams.get('id')
  if (id) return id

  const sourceUrl = url.searchParams.get('url')
  if (sourceUrl) return googleDriveFileIdFromUrl(sourceUrl)

  return ''
}
