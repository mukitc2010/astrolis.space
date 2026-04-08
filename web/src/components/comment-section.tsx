'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Comment } from '@/lib/types'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function CommentSection({
  postId,
  initialComments,
  token,
}: {
  postId: string
  initialComments: Comment[]
  token?: string
}) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !token || pending) return
    setPending(true)
    try {
      const newComment = await api.createComment(token, postId, { content: content.trim() }) as Comment
      setComments(prev => [newComment, ...prev])
      setContent('')
    } catch {
      // handle error
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      {token && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a comment..."
            maxLength={2000}
            className="flex-1 rounded-lg border border-gray-700 bg-[#0a0f1a] px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!content.trim() || pending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            Reply
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-4">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-medium text-white">
                {comment.author?.display_name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-white">{comment.author?.display_name}</span>
                  <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
