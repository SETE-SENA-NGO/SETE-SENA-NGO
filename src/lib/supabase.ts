import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY

function createMockClient(): SupabaseClient {
  const noop = () => Promise.resolve({ data: null, error: null })

  // Proxy-based query builder: supports infinite chaining and is awaitable.
  // Define a self-referential proxy safely to satisfy TS7022.
  // Proxy-based query builder: supports infinite chaining and is awaitable.
  // Use an untyped proxy to avoid TS7022 and relax typing (mock mode only).
  // Using `unknown` instead of `any` to satisfy eslint while keeping mock behavior.
  const chain = {} as unknown


  const chainProxy = new Proxy(chain as Record<string, unknown>, {
    get: () => chain,
    apply: () => chain,
  }) as unknown as Record<string, unknown>



  chainProxy.then = (resolve: (v: { data: null; error: null }) => void) =>
    resolve({ data: null, error: null })

  // (no-op) - chainProxy is intentionally untyped to act like supabase query builders.






  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: new Error('Supabase not configured in development mode'),
        }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () =>
        Promise.resolve({
          data: {},
          error: new Error('Supabase not configured in development mode'),
        }),
      updateUser: () =>
        Promise.resolve({
          data: { user: null },
          error: new Error('Supabase not configured in development mode'),
        }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: new Error('Supabase not configured in development mode'),
        }),
      exchangeCodeForSession: () =>
        Promise.resolve({
          data: { session: null },
          error: new Error('Supabase not configured in development mode'),
        }),
      setSession: () =>
        Promise.resolve({
          data: { session: null },
          error: new Error('Supabase not configured in development mode'),
        }),
      signInWithOAuth: () =>
        Promise.resolve({
          data: { provider: '', url: '' },
          error: new Error('Supabase not configured'),
        }),
      mfa: {} as any,
      admin: {} as any,
    },
    from: () => chain,
    storage: {
      from: () => ({
        upload: noop,
        download: noop,
        list: noop,
        remove: noop,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: () => Promise.resolve({ data: { signedUrl: '' }, error: null }),
      }),
    },
    rpc: noop,
    channel: () => ({ subscribe: () => ({}), unsubscribe: () => {} }),
    functions: {} as any,
    realtime: {} as any,
    schema: () => chain,
    transaction: async () => chain,
  } as unknown as SupabaseClient
}

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.MODE !== 'development') {
    throw new Error(
      'Missing Supabase env vars: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  console.warn(
    'Supabase env vars are missing. The app will run in development mode without Supabase connectivity.',
  )
}

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()
