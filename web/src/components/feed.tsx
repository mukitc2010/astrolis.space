'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { PostCard } from './post-card'
import { CreatePost } from './create-post'
import type { Post } from '@/lib/types'

export function Feed({ token }: { token: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = useCallback(async (cursorParam?: string) => {
    try {
      const result = await api.getFeed(token, cursorParam)
      if (cursorParam) {
        setPosts(prev => [...prev, ...result.posts])
      } else {
        setPosts(result.posts)
      }
      setCursor(result.next_cursor)
      setHasMore(!!result.next_cursor)
    } catch {
      // Silently fail for now
    }
  }, [token])

  useEffect(() => {
    setLoading(true)
    loadPosts().finally(() => setLoading(false))
  }, [loadPosts])

  const loadMore = async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    await loadPosts(cursor)
    setLoadingMore(false)
  }

  const handlePostCreated = () => {
    loadPosts()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CreatePost token={token} onCreated={handlePostCreated} />

      {posts.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-[#111827] p-12 text-center">
          <p className="text-gray-400 text-sm">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} token={token} />
        ))
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full rounded-lg border border-gray-800 bg-[#111827] py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
