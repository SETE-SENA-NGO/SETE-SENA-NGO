import { fileURLToPath, URL, pathToFileURL } from 'node:url'
import { statSync } from 'node:fs'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Serves the Netlify Google Drive upload function during local dev.
 * In production, Netlify runs this function at /api/google-drive-upload.
 * This plugin intercepts those requests and calls the function directly.
 * Skipped automatically when running under Netlify Dev (NETLIFY_DEV=true).
 */
function googleDriveUploadLocal(): Plugin {
  const FUNCTION_PATH = fileURLToPath(
    new URL('./netlify/functions/google-drive-upload.mjs', import.meta.url),
  )

  // Skip this plugin under Netlify Dev — it serves the function natively
  const isNetlifyDev = process.env.NETLIFY === 'true' || process.env.NETLIFY_DEV === 'true'

  return {
    name: 'google-drive-upload-local',
    configureServer(server) {
      if (isNetlifyDev) return // let Netlify Dev handle the function

      // Ensure all .env variables are on process.env so the Netlify function can find them.
      // Vite's loadEnv reads .env files but doesn't always set everything on process.env.
      const env = loadEnv(server.config.mode, server.config.envDir || process.cwd(), '')
      for (const key of Object.keys(env)) {
        if (!process.env[key]) {
          process.env[key] = env[key]
        }
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/google-drive-upload')) {
          return next()
        }

        try {
          // Gather the request body (supports multipart file uploads)
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(Buffer.from(chunk))
          }
          const rawBody = Buffer.concat(chunks)

          // Build standard Web API headers from Connect-style req.headers
          const headers: Record<string, string> = {}
          for (const [key, value] of Object.entries(req.headers)) {
            if (value) {
              headers[key] = Array.isArray(value) ? value.join(', ') : value
            }
          }

          const protocol = headers['x-forwarded-proto'] || 'http'
          const host = headers.host || 'localhost:5173'
          const url = `${protocol}://${host}${req.url}`

          // Build a standard Web API Request for the Netlify function
          const request = new Request(url, {
            method: req.method || 'GET',
            headers,
            body:
              req.method !== 'GET' && req.method !== 'HEAD' && rawBody.length > 0
                ? new Uint8Array(rawBody)
                : null,
          })

          // Dynamically import the Netlify function.
          // Use pathToFileURL on Windows to avoid ERR_UNSUPPORTED_ESM_URL_SCHEME.
          // Append file mtime as cache-buster so edits to the function take effect without restart.
          const mtime = statSync(FUNCTION_PATH).mtimeMs
          const { default: handler } = await import(pathToFileURL(FUNCTION_PATH).href + `?v=${mtime}`)
          const response = await handler(request)

          // Write the Web API Response back to Node.js ServerResponse
          res.statusCode = response.status
          response.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value)
          })

          const responseBody = await response.text()
          res.end(responseBody)
        } catch (error) {
          console.error('[google-drive-upload-local]', error)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Local upload handler failed.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'],
  plugins: [vue(), googleDriveUploadLocal()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      clientPort: 5173,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
