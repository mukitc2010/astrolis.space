import Link from 'next/link'
import type { Post } from '@/lib/types'
import { LikeButton } from './like-button'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export function PostCard({ post, token }: { post: Post; token?: string }) {
  const postTypeColors: Record<string, string> = {
    text: 'bg-gray-700',
    article: 'bg-green-900 text-green-300',
    question: 'bg-yellow-900 text-yellow-300',
    project_update: 'bg-purple-900 text-purple-300',
  }

  return (
    <article className="rounded-xl border border-gray-800 bg-[#111827] p-5">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white shrink-0">
          {post.author?.display_name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <Link href={`/profile/${post.author?.username}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
            {post.author?.display_name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>@{post.author?.username}</span>
            <span>&middot;</span>
            <span>{timeAgo(post.created_at)}</span>
            {post.post_type !== 'text' && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${postTypeColors[post.post_type] || ''}`}>
                {post.post_type.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block">
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </Link>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map(tag => (
            <span key={tag} className="rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs text-blue-300">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-800">
        <LikeButton
          postId={post.id}
          initialLiked={post.liked_by_user || false}
          initialCount={post.likes_count}
          token={token}
        />
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
          </svg>
          <span>{post.comments_count}</span>
        </Link>
      </div>
    </article>
  )
}
