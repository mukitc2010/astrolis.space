import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let profile
  try {
    profile = await api.getProfile(username)
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-white mb-2">User not found</h1>
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">Back to feed</Link>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    researcher: 'bg-green-900 text-green-300',
    engineer: 'bg-blue-900 text-blue-300',
    educator: 'bg-purple-900 text-purple-300',
    organization: 'bg-yellow-900 text-yellow-300',
    member: 'bg-gray-700 text-gray-300',
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="rounded-xl border border-gray-800 bg-[#111827] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shrink-0">
            {profile.display_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{profile.display_name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[profile.role] || roleColors.member}`}>
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-gray-400">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-gray-300 mt-2">{profile.bio}</p>}

            <div className="flex gap-6 mt-4">
              <div>
                <span className="text-sm font-semibold text-white">{profile.followers_count || 0}</span>
                <span className="text-xs text-gray-400 ml-1">Followers</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-white">{profile.following_count || 0}</span>
                <span className="text-xs text-gray-400 ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
