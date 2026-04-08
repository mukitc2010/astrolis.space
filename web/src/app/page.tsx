import { createClient } from '@/lib/supabase/server'
import { Feed } from '@/components/feed'
import Link from 'next/link'

export default async function Home() {
  let session = null

  try {
    const supabase = await createClient()
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      session = data.session
    }
  } catch {
    // Supabase not available — show landing page
  }

  if (session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-lg font-semibold text-white mb-4">Your Feed</h1>
        <Feed token={session.access_token} />
      </div>
    )
  }

  // Landing page for unauthenticated users
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-5xl font-bold text-white mb-4">
        The Space Community
        <br />
        <span className="text-blue-500">Network</span>
      </h1>
      <p className="max-w-lg text-gray-400 text-lg mb-8">
        Connect with researchers, engineers, educators, and space enthusiasts.
        Share knowledge, discuss discoveries, and build the future of space exploration together.
      </p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-700 px-8 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Log In
        </Link>
      </div>
    </div>
  )
}
