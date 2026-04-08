'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  token,
}: {
  postId: string
  initialLiked: boolean
  initialCount: number
  token?: string
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  const handleLike = async () => {
    if (!token || pending) return
    setPending(true)
    try {
      const result = await api.likePost(token, postId)
      setLiked(result.liked)
      setCount(result.likes_count)
    } catch {
      // Optimistic rollback not needed since we wait for response
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={!token || pending}
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
      } disabled:opacity-50`}
    >
      <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <span>{count}</span>
    </button>
  )
}
