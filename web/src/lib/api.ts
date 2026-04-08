const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type FetchOptions = RequestInit & { token?: string }

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || error.error || 'API request failed')
  }

  return res.json()
}

export const api = {
  // Auth
  signup: (data: { email: string; password: string; username: string; display_name: string }) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: (token: string) =>
    apiFetch<{ id: string; username: string; display_name: string; bio: string; avatar_url: string; role: string }>('/auth/me', { token }),

  // Posts
  createPost: (token: string, data: { content: string; post_type?: string; tags?: string[] }) =>
    apiFetch('/posts', { method: 'POST', body: JSON.stringify(data), token }),
  getPost: (id: string) =>
    apiFetch<any>(`/posts/${id}`),
  deletePost: (token: string, id: string) =>
    apiFetch(`/posts/${id}`, { method: 'DELETE', token }),
  likePost: (token: string, id: string) =>
    apiFetch<{ liked: boolean; likes_count: number }>(`/posts/${id}/like`, { method: 'POST', token }),
  getFeed: (token: string, cursor?: string) =>
    apiFetch<{ posts: any[]; next_cursor: string | null }>(`/posts/feed?${cursor ? `cursor=${cursor}` : ''}`, { token }),

  // Comments
  createComment: (token: string, postId: string, data: { content: string; parent_id?: string }) =>
    apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data), token }),
  deleteComment: (token: string, id: string) =>
    apiFetch(`/comments/${id}`, { method: 'DELETE', token }),

  // Profiles
  getProfile: (username: string) =>
    apiFetch<any>(`/profiles/${username}`),
  updateProfile: (token: string, data: { display_name?: string; bio?: string; avatar_url?: string }) =>
    apiFetch('/profiles/me', { method: 'PATCH', body: JSON.stringify(data), token }),
  follow: (token: string, id: string) =>
    apiFetch(`/profiles/${id}/follow`, { method: 'POST', token }),
  unfollow: (token: string, id: string) =>
    apiFetch(`/profiles/${id}/follow`, { method: 'DELETE', token }),
}
