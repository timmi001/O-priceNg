-- ============================================================
-- O'Price Ng — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  username      text        unique not null,
  name          text        not null,
  avatar_url    text,
  cover_image   text,
  bio           text,
  location      text        default 'Nigeria',
  is_verified   boolean     default false,
  rating        numeric(3,2) default 0,
  total_sales   integer     default 0,
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are public read" on public.profiles
  for select using (true);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. CATEGORIES ────────────────────────────────────────────
create table if not exists public.categories (
  id    serial primary key,
  name  text   not null,
  slug  text   unique not null
);

alter table public.categories enable row level security;

create policy "Categories are public read" on public.categories
  for select using (true);

insert into public.categories (name, slug) values
  ('Electronics',      'electronics'),
  ('Vehicles',         'vehicles'),
  ('Fashion',          'fashion'),
  ('Property',         'property'),
  ('Jobs',             'jobs'),
  ('Deals',            'deals'),
  ('Phones',           'phones'),
  ('Computers',        'computers'),
  ('Appliances',       'appliances'),
  ('Home & Kitchen',   'home-kitchen'),
  ('Food & Agriculture','food-agriculture')
on conflict (slug) do nothing;

-- ── 3. LISTINGS ──────────────────────────────────────────────
create table if not exists public.listings (
  id              bigserial   primary key,
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  title           text        not null,
  description     text,
  price           numeric     not null,
  original_price  numeric,
  condition       text        default 'New',
  category        text        not null,
  subcategory     text,
  location        text        not null,
  images          text[]      default '{}',
  shipping_info   text,
  is_featured     boolean     default false,
  is_auction      boolean     default false,
  auction_ends_at timestamptz,
  is_negotiable   boolean     default false,
  view_count      integer     default 0,
  watch_count     integer     default 0,
  offer_count     integer     default 0,
  created_at      timestamptz default now()
);

alter table public.listings enable row level security;

create policy "Listings are public read" on public.listings
  for select using (true);

create policy "Authenticated users can insert listings" on public.listings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own listings" on public.listings
  for update using (auth.uid() = user_id);

create policy "Users can delete own listings" on public.listings
  for delete using (auth.uid() = user_id);

-- ── 4. FAVORITES ─────────────────────────────────────────────
create table if not exists public.favorites (
  id          bigserial   primary key,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  listing_id  bigint      not null references public.listings(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Users can read own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- ── 5. TRENDING SEARCHES (static seed) ───────────────────────
create table if not exists public.trending_searches (
  id    serial primary key,
  term  text   not null,
  count integer default 0
);

alter table public.trending_searches enable row level security;
create policy "Trending searches are public read" on public.trending_searches
  for select using (true);

insert into public.trending_searches (term, count) values
  ('iPhone 14',         1240),
  ('Toyota Corolla',    980),
  ('Lagos apartment',   870),
  ('Ankara dress',      760),
  ('Generator',         650),
  ('MacBook Pro',       540),
  ('Air conditioner',   490),
  ('Samsung Galaxy',    430)
on conflict do nothing;

-- ── 6. SAMPLE SEED DATA (optional — remove if you have real data) ──
-- Insert a demo user profile first (replace UUID with a real auth user id)
-- Then insert sample listings tied to that user.

-- Example (run after signing up a real user and getting their UUID from auth.users):
-- insert into public.profiles (id, username, name, location, is_verified, rating, total_sales)
-- values ('YOUR-USER-UUID', 'demo_seller', 'Demo Seller', 'Lagos, Nigeria', true, 4.8, 47);
--
-- insert into public.listings (user_id, title, description, price, condition, category, location, images, is_featured)
-- values
--   ('YOUR-USER-UUID', 'iPhone 14 Pro 256GB', 'Brand new sealed box...', 850000, 'New', 'Phones', 'Lagos, Nigeria',
--    ARRAY['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800'], true),
--   ('YOUR-USER-UUID', 'Toyota Corolla 2020', 'Clean registered car...', 15000000, 'Used', 'Vehicles', 'Abuja, Nigeria',
--    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'], false);
