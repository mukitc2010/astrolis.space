'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      try {
        const profile = await api.me(session.access_token)
        setDisplayName(profile.display_name || '')
        setBio(profile.bio || '')
      } catch {
        // handle error
      }
    }
    load()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      await api.updateProfile(session.access_token, { display_name: displayName, bio })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setPending(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-[#111827] p-5 space-y-4">
        <div>
          <label htmlFor="display_name" className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-700 bg-[#0a0f1a] px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {saved && <p className="text-xs text-green-400">Profile saved!</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-red-900/50 bg-[#111827] p-5">
        <h2 className="text-sm font-semibold text-white mb-2">Account</h2>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}
