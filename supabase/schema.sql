-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Households Table
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  host_id uuid references auth.users not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

-- 2. Profiles Table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  household_id uuid references public.households(id) on delete set null,
  is_host boolean default false,
  created_at timestamptz default now()
);

-- 3. Personal Items Table (private to one member)
create table public.personal_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  quantity text,
  estimated_price numeric,
  category text,
  status text default 'active' check (status in ('active', 'purchased', 'removed')),
  created_at timestamptz default now()
);

-- 4. House List Items Table (shared, visible to everyone in household)
create table public.house_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  added_by uuid references auth.users on delete set null,
  name text not null,
  quantity text,
  estimated_price numeric,
  category text,
  status text default 'pending' check (status in ('pending', 'approved', 'removed', 'purchased')),
  month date default date_trunc('month', current_date)::date,
  created_at timestamptz default now()
);

-- 5. Expenses Table (referencing EITHER a house item OR a personal item)
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  user_id uuid references auth.users on delete set null,
  scope text not null check (scope in ('house', 'personal')),
  house_list_item_id uuid references public.house_list_items(id) on delete cascade,
  personal_item_id uuid references public.personal_items(id) on delete cascade,
  amount numeric not null,
  category text,
  spent_on date default current_date,
  created_at timestamptz default now(),
  constraint one_link_only check (
    (scope = 'house' and house_list_item_id is not null and personal_item_id is null) or
    (scope = 'personal' and personal_item_id is not null and house_list_item_id is null)
  )
);

-- 6. Notifications Table (only for Host regarding house-list additions)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  recipient_id uuid references auth.users on delete cascade,
  message text not null,
  related_item_id uuid references public.house_list_items(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 7. Monthly Templates Table (snapshot of house items for rollover)
create table public.monthly_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  month date not null,
  item_snapshot jsonb not null,
  created_at timestamptz default now()
);


-- =========================================================================
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- =========================================================================

-- Check if user is a member of the household
create or replace function public.is_household_member(v_household_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and household_id = v_household_id
  );
end;
$$ language plpgsql security definer;

-- Check if user is the host of the household
create or replace function public.is_household_host(v_household_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.households
    where id = v_household_id and host_id = auth.uid()
  );
end;
$$ language plpgsql security definer;


-- =========================================================================
-- DATABASE TRIGGERS
-- =========================================================================

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, is_host)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Member'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to enforce correct status on house list item addition
-- If Host inserts, defaults to 'approved'. If Member inserts, defaults to 'pending'.
create or replace function public.enforce_house_item_status()
returns trigger as $$
declare
  v_is_host boolean;
begin
  -- Set added_by if not provided
  if new.added_by is null then
    new.added_by := auth.uid();
  end if;

  -- Check if creator is the household host
  select (host_id = new.added_by) into v_is_host 
  from public.households 
  where id = new.household_id;
  
  if coalesce(v_is_host, false) then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger before_house_item_inserted
  before insert on public.house_list_items
  for each row execute procedure public.enforce_house_item_status();

-- Trigger to automatically generate notification for Host when a member requests a pending house item
create or replace function public.notify_host_of_house_item()
returns trigger as $$
declare
  v_host_id uuid;
  v_member_name text;
begin
  if new.status = 'pending' then
    -- Get household host ID
    select host_id into v_host_id 
    from public.households 
    where id = new.household_id;
    
    -- Get member's full name
    select coalesce(full_name, 'A household member') into v_member_name 
    from public.profiles 
    where id = new.added_by;
    
    if v_host_id is not null and v_host_id != new.added_by then
      insert into public.notifications (household_id, recipient_id, message, related_item_id, is_read)
      values (
        new.household_id,
        v_host_id,
        v_member_name || ' requested to add "' || new.name || '" to the house list.',
        new.id,
        false
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_house_item_added
  after insert on public.house_list_items
  for each row execute procedure public.notify_host_of_house_item();

-- Trigger to transition item status to 'purchased' when a matching expense is logged
create or replace function public.transition_item_status_on_expense()
returns trigger as $$
begin
  if new.scope = 'house' and new.house_list_item_id is not null then
    update public.house_list_items
    set status = 'purchased'
    where id = new.house_list_item_id;
  elsif new.scope = 'personal' and new.personal_item_id is not null then
    update public.personal_items
    set status = 'purchased'
    where id = new.personal_item_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_expense_created
  after insert on public.expenses
  for each row execute procedure public.transition_item_status_on_expense();


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.personal_items enable row level security;
alter table public.house_list_items enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.monthly_templates enable row level security;

-- 1. Households Policies
create policy "Allow read access to household members"
  on public.households for select
  using (public.is_household_member(id));

create policy "Allow read access for invite code check before joining"
  on public.households for select
  using (true); -- Anyone authenticated can check invite code details

create policy "Allow inserts for authenticated users"
  on public.households for insert
  with check (auth.role() = 'authenticated');

create policy "Allow updates for host only"
  on public.households for update
  using (host_id = auth.uid());

-- 2. Profiles Policies
create policy "Allow read access to profiles in same household or own profile"
  on public.profiles for select
  using (
    id = auth.uid() or 
    (household_id is not null and public.is_household_member(household_id))
  );

create policy "Allow profile insert during auth signup"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Allow profile update for self"
  on public.profiles for update
  using (id = auth.uid());

-- 3. Personal Items Policies
create policy "Users can only access their own personal items"
  on public.personal_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. House List Items Policies
create policy "Members can select all house list items"
  on public.house_list_items for select
  using (public.is_household_member(household_id));

create policy "Members can insert house list items"
  on public.house_list_items for insert
  with check (
    public.is_household_member(household_id) and 
    added_by = auth.uid()
  );

create policy "Hosts can update house list items"
  on public.house_list_items for update
  using (public.is_household_host(household_id));

create policy "Hosts can delete house list items"
  on public.house_list_items for delete
  using (public.is_household_host(household_id));

-- 5. Expenses Policies
-- House scope: read for all household members, insert for all household members
create policy "Select house expenses for household members"
  on public.expenses for select
  using (
    (scope = 'house' and public.is_household_member(household_id)) or
    (scope = 'personal' and user_id = auth.uid())
  );

create policy "Insert expenses for household members"
  on public.expenses for insert
  with check (
    (scope = 'house' and public.is_household_member(household_id) and user_id = auth.uid()) or
    (scope = 'personal' and user_id = auth.uid())
  );

create policy "Update/Delete own expenses"
  on public.expenses for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Delete own expenses"
  on public.expenses for delete
  using (user_id = auth.uid());

-- 6. Notifications Policies
create policy "Notifications only visible to recipient host"
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy "Notifications update only for recipient host"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- 7. Monthly Templates Policies
create policy "Templates visible to household members"
  on public.monthly_templates for select
  using (public.is_household_member(household_id));

create policy "Templates insertable/updateable by host"
  on public.monthly_templates for all
  using (public.is_household_host(household_id));


-- =========================================================================
-- MONTHLY ROLLOVER FUNCTION
-- =========================================================================

-- Performs monthly rollover for a household.
-- 1. Snapshots currently approved/purchased house items into monthly_templates
-- 2. Clones these items as new 'approved' items for the target next month
create or replace function public.perform_monthly_rollover(v_household_id uuid, v_current_month date, v_next_month date)
returns void as $$
declare
  v_item_snapshot jsonb;
begin
  -- Ensure only host can invoke this function
  if not public.is_household_host(v_household_id) then
    raise exception 'Only the household host can initiate a rollover.';
  end if;

  -- 1. Create a snapshot of approved/purchased house items for the current month
  select coalesce(
    json_agg(
      json_build_object(
        'name', name,
        'quantity', quantity,
        'category', category,
        'estimated_price', estimated_price
      )
    ),
    '[]'::jsonb
  )::jsonb into v_item_snapshot
  from public.house_list_items
  where household_id = v_household_id 
    and month = v_current_month 
    and status in ('approved', 'purchased');

  -- 2. Insert the snapshot into monthly_templates
  -- If template for this month already exists, overwrite it, otherwise insert new
  insert into public.monthly_templates (household_id, month, item_snapshot)
  values (v_household_id, v_current_month, v_item_snapshot)
  on conflict (id) do update set item_snapshot = excluded.item_snapshot;

  -- 3. Copy approved and purchased items to the next month as fresh 'approved' items
  -- (excluding items that have already been copied to avoid duplicates if run multiple times)
  insert into public.house_list_items (household_id, added_by, name, quantity, estimated_price, category, status, month)
  select 
    h.household_id, 
    h.added_by, 
    h.name, 
    h.quantity, 
    h.estimated_price, 
    h.category, 
    'approved'::text, 
    v_next_month
  from public.house_list_items h
  where h.household_id = v_household_id 
    and h.month = v_current_month 
    and h.status in ('approved', 'purchased')
    and not exists (
      select 1 
      from public.house_list_items n
      where n.household_id = v_household_id 
        and n.month = v_next_month 
        and n.name = h.name
    );
end;
$$ language plpgsql security definer;

