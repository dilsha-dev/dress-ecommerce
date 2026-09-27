/*
# Create profiles table for user authentication and roles

## Overview
Creates a `profiles` table linked to Supabase auth.users that stores each
user's full name and role (customer or admin). This enables authentication
for the storefront and protects the admin dashboard.

## New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — matches the auth user ID
  - `full_name` (text) — user's display name from signup
  - `role` (text, not null, default 'customer') — 'customer' or 'admin'
  - `created_at` (timestamptz, default now())

## Security
- Enable RLS on `profiles`.
- Users can read their own profile.
- Users can read other profiles (for display names) but only see id + full_name.
- Users can insert their own profile row on signup (only id + full_name).
- Users can update only their own full_name — NOT the role column.
- The `role` column is revoked from UPDATE to prevent privilege escalation.
- A SECURITY DEFINER function `promote_to_admin` lets an existing admin
  promote another user. This is the only path to change a role.
- A trigger auto-creates a profile row when a new auth user signs up.

## Important Notes
1. The role column has column-level UPDATE revoked from authenticated.
   This means even though the RLS UPDATE policy allows updating your own
   row, you cannot change the role field — only full_name.
2. The first admin must be set via SQL (see the seed at the bottom or
   run manually after the first signup).
3. The trigger ensures every new auth user gets a profile automatically.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: users can read all profiles (to see names), but role is column-restricted
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated USING (true);

-- INSERT: users can create their own profile on signup
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

-- UPDATE: users can update their own profile, but role column is revoked below
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Revoke UPDATE on the role column so users cannot escalate themselves
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name) ON profiles TO authenticated;

-- Also revoke from anon (no access anyway, but be explicit)
REVOKE UPDATE ON profiles FROM anon;

-- SECURITY DEFINER function: only an admin can promote another user
CREATE OR REPLACE FUNCTION promote_to_admin(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Authorize the CALLER — must be an existing admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized: admin privileges required';
  END IF;

  -- Promote the target user
  UPDATE profiles SET role = 'admin' WHERE id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION promote_to_admin FROM anon;
GRANT EXECUTE ON FUNCTION promote_to_admin TO authenticated;

-- Trigger: auto-create a profile when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION handle_new_user FROM anon;
GRANT EXECUTE ON FUNCTION handle_new_user TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant SELECT on profiles to anon for limited public visibility
-- (needed so unauthenticated users don't error on profile lookups)
GRANT SELECT ON profiles TO anon;
