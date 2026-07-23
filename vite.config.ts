import { Buffer } from 'node:buffer'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

type NetlifyFunction = (request: Request) => Promise<Response> | Response

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value
  }

  return {
    envPrefix: ['VITE_', 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'],
    plugins: [vue(), googleDriveUploadDevPlugin()],
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
  }
})

function googleDriveUploadDevPlugin(): Plugin {
  return {
    name: 'santi-sena-google-drive-upload-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/google-drive-upload', async (request, response, next) => {
        try {
          const uploadRequest = await toFetchRequest(request)
          const uploadFunctionUrl = new URL('./netlify/functions/google-drive-upload.mjs', import.meta.url).href
          const uploadFunction = (await import(uploadFunctionUrl)) as { default: NetlifyFunction }
          const uploadResponse = await uploadFunction.default(uploadRequest)

          await sendFetchResponse(response, uploadResponse)
        } catch (error) {
          server.ssrFixStacktrace(error as Error)
          next(error)
        }
      })
    },
  }
}

async function toFetchRequest(request: IncomingMessage) {
  const origin = `http://${request.headers.host || 'localhost:5173'}`
  const url = new URL('/api/google-drive-upload', origin)
  const body = await readRequestBody(request)

  return new Request(url, {
    method: request.method,
    headers: toFetchHeaders(request),
    body: body.length ? new Uint8Array(body) : undefined,
  })
}

function toFetchHeaders(request: IncomingMessage) {
  const headers = new Headers()

  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item))
    } else if (value) {
      headers.set(name, value)
    }
  }

  return headers
}

function readRequestBody(request: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    request.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

async function sendFetchResponse(response: ServerResponse, fetchResponse: Response) {
  response.statusCode = fetchResponse.status
  fetchResponse.headers.forEach((value, name) => response.setHeader(name, value))

  const body = Buffer.from(await fetchResponse.arrayBuffer())
  response.end(body)
}
