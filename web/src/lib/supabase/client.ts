import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Supabase env vars missing:', { url: url ? 'set' : 'MISSING', key: key ? 'set' : 'MISSING' })
    throw new Error(`Supabase not configured. URL: ${url || 'MISSING'}`)
  }

  return createBrowserClient(url, key)
}
