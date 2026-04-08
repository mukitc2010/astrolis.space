import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Astrolis — Space Community Network',
  description: 'The professional social network for the space community. Connect, share, and collaborate.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null

  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('id', data.user.id)
          .single()
        user = profile
      }
    }
  } catch {
    // Not logged in
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
