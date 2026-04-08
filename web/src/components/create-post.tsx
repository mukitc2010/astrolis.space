'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

const POST_TYPES = [
  { value: 'text', label: 'Post' },
  { value: 'question', label: 'Question' },
  { value: 'article', label: 'Article' },
  { value: 'project_update', label: 'Project Update' },
]

export function CreatePost({ token, onCreated }: { token: string; onCreated?: () => void }) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [tagsInput, setTagsInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || pending) return

    setPending(true)
    setError('')

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      await api.createPost(token, { content: content.trim(), post_type: postType, tags })
      setContent('')
      setTagsInput('')
      setPostType('text')
      onCreated?.()
    } catch (err: any) {
      setError(err.message || 'Failed to create post')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-[#111827] p-5">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind? Share with the space community..."
        rows={3}
        maxLength={5000}
        className="w-full resize-none rounded-lg border border-gray-700 bg-[#0a0f1a] px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* Post type pills */}
          <div className="flex gap-1">
            {POST_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setPostType(type.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  postType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-40 rounded-lg border border-gray-700 bg-[#0a0f1a] px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!content.trim() || pending}
            className="rounded-lg bg-blue-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  )
}
