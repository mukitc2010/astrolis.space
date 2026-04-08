import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xjlduvebsavwdxowbhdl.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbGR1dmVic2F2d2R4b3diaGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzIyMTcsImV4cCI6MjA5MTIwODIxN30.c_xZfvrjA5eIT9l54u1LV9SLGWdokinq4MozuqHNY6k'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
