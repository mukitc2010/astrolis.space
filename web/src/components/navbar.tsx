import Link from 'next/link'

export function Navbar({ user }: { user: { display_name: string; username: string } | null }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0f1a]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-white">
          Astrolis
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                Feed
              </Link>
              <Link href={`/profile/${user.username}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                Profile
              </Link>
              <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">
                Settings
              </Link>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
