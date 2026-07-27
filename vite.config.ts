import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

type VercelFunction = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value
  }
  const devPort = numberFromEnv(process.env.VITE_DEV_PORT, 5173)
  const devHost = process.env.VITE_DEV_HOST || '0.0.0.0'

  return {
    envPrefix: ['VITE_', 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'],
    plugins: [vue(), vuetify({ autoImport: true }), apiFunctionsDevPlugin()],
    server: {
      host: devHost,
      port: devPort,
      strictPort: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['vue-i18n'],
    },
  }
})

function numberFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * Vite dev plugin that mounts the Vercel Serverless Functions as Connect middleware,
 * so the same API handlers work both locally and in production on Vercel.
 */
async function apiFunctionsDevPlugin(): Promise<Plugin> {
  const uploadFunctionUrl = new URL('./api/google-drive-upload.mjs', import.meta.url).href
  const imageFunctionUrl = new URL('./api/google-drive-image.mjs', import.meta.url).href

  const [uploadModule, imageModule] = await Promise.all([
    import(uploadFunctionUrl) as Promise<{ default: VercelFunction }>,
    import(imageFunctionUrl) as Promise<{ default: VercelFunction }>,
  ])

  return {
    name: 'santi-sena-api-dev',
    apply: 'serve',
    configureServer(server) {
      // Vercel Serverless Functions use the (req, res) signature,
      // which is directly compatible with Connect middleware.
      server.middlewares.use('/api/google-drive-upload', uploadModule.default)
      server.middlewares.use('/api/google-drive-image', imageModule.default)
    },
  }
}
