'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError('')

    try {
      await api.signup({ email, password, username, display_name: displayName })

      // Auto-login after signup
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email, password })

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Join Astrolis</h1>
        <p className="text-sm text-gray-400 text-center mb-8">Create your account and join the space community</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
            <input
              id="display_name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              pattern="[a-zA-Z0-9_]+"
              className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="janedoe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-700 bg-[#111827] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
        </p>
      </div>
    </div>
  )
}
