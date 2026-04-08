export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  role: string
  created_at: string
  followers_count?: number
  following_count?: number
}

export interface Post {
  id: string
  author_id: string
  content: string
  post_type: string
  tags: string[]
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  author?: Profile
  comments?: Comment[]
  liked_by_user?: boolean
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  parent_id: string | null
  created_at: string
  author?: Profile
}
