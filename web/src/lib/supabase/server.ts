import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = 'https://xjlduvebsavwdxowbhdl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbGR1dmVic2F2d2R4b3diaGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzIyMTcsImV4cCI6MjA5MTIwODIxN30.c_xZfvrjA5eIT9l54u1LV9SLGWdokinq4MozuqHNY6k'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Can be ignored in Server Components (read-only)
        }
      },
    },
  })
}
