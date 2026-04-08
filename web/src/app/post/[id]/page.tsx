import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
import { PostCard } from '@/components/post-card'
import { CommentSection } from '@/components/comment-section'
import Link from 'next/link'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null

  let post
  try {
    post = await api.getPost(id)
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-white mb-2">Post not found</h1>
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">Back to feed</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to feed</Link>
      <PostCard post={post} token={session?.access_token} />
      <div className="mt-4 rounded-xl border border-gray-800 bg-[#111827] p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Comments ({post.comments?.length || 0})</h2>
        <CommentSection
          postId={id}
          initialComments={post.comments || []}
          token={session?.access_token}
        />
      </div>
    </div>
  )
}
