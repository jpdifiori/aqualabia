-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Public user data linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- POOLS (User's pools)
create table if not exists public.pools (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  shape text check (shape in ('rectangular', 'oval', 'round', 'kidney', 'custom')),
  length numeric, -- meters
  width numeric, -- meters
  depth numeric, -- meters
  volume numeric not null, -- liters (calculated)
  material text check (material in ('vinyl', 'concrete', 'fiberglass', 'tile', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEASUREMENTS (Water quality logs)
create table if not exists public.measurements (
  id uuid default uuid_generate_v4() primary key,
  pool_id uuid references public.pools(id) on delete cascade not null,
  measured_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Chemical Values
  ph numeric(3, 1),
  free_chlorine numeric(3, 1), -- ppm
  total_alkalinity integer, -- ppm
  calcium_hardness integer, -- ppm
  cyanuric_acid integer, -- ppm
  
  -- Visual Diagnosis
  water_clarity text, -- 'clear', 'cloudy', 'algae', etc.
  
  -- Images (URLs from Storage)
  water_image_url text,
  strip_image_url text,
  
  -- AI Results
  ai_analysis_json jsonb, -- Full raw response from Gemini
  recommendation_text text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHEMICALS (Product database for recommendations)
create table if not exists public.chemicals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null, -- 'chlorine_liquid', 'chlorine_tablet', 'ph_plus', 'ph_minus', etc.
  description text,
  dosage_instruction text, -- Text description or template
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.pools enable row level security;
alter table public.measurements enable row level security;
alter table public.chemicals enable row level security;

-- POLICIES (Using DO blocks to avoid "already exists" errors)

do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Users can view own profile') then
        create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
        create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own pools') then
        create policy "Users can CRUD own pools" on pools for all using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Users can CRUD own measurements') then
        create policy "Users can CRUD own measurements" on measurements for all using (
          exists (select 1 from pools where pools.id = measurements.pool_id and pools.user_id = auth.uid())
        );
    end if;

    if not exists (select 1 from pg_policies where policyname = 'Chemicals are viewable by everyone') then
        create policy "Chemicals are viewable by everyone" on chemicals for select using (true);
    end if;
end
$$;

-- AUTH TRIGGER FOR PROFILES
-- This ensures a profile record exists as soon as a user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
