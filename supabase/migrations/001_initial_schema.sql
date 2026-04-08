-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  role text default 'member' check (role in ('member', 'researcher', 'engineer', 'educator', 'organization')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  post_type text default 'text' check (post_type in ('text', 'article', 'question', 'project_update')),
  tags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

-- Likes (user can like a post once)
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Follows
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- Indexes for performance
create index idx_posts_author on public.posts(author_id);
create index idx_posts_created on public.posts(created_at desc);
create index idx_comments_post on public.comments(post_id);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Service role can insert profiles" on public.profiles for insert with check (true);

-- Posts: anyone can read, auth users can create, only author can delete
create policy "Posts are viewable by everyone" on public.posts for select using (true);
create policy "Auth users can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Authors can delete own posts" on public.posts for delete using (auth.uid() = author_id);
create policy "Authors can update own posts" on public.posts for update using (auth.uid() = author_id);

-- Comments: anyone can read, auth users can create, only author can delete
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Auth users can create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete own comments" on public.comments for delete using (auth.uid() = author_id);

-- Likes: anyone can read, auth users can toggle own
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Auth users can like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on public.likes for delete using (auth.uid() = user_id);

-- Follows: anyone can read, auth users can manage own
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Auth users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_post_updated
  before update on public.posts
  for each row execute function public.handle_updated_at();
