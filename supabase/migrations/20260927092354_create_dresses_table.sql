/*
# Create dresses table for e-commerce platform

## Overview
Creates the `dresses` table to store dress product listings for the e-commerce platform.
This is a single-tenant app (no sign-in required) so all CRUD is open to anon + authenticated.

## New Tables
- `dresses`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null) — dress name/title
  - `description` (text) — detailed product description
  - `price` (numeric(10,2), not null) — price in USD
  - `category` (text, not null) — e.g. Evening, Casual, Summer, Wedding, Cocktail
  - `sizes` (text[], not null) — available sizes as array e.g. ['S','M','L','XL']
  - `colors` (text[], not null) — available colors as array e.g. ['Red','Black']
  - `stock` (integer, not null, default 0) — total stock quantity
  - `image_url` (text) — primary product image URL
  - `gallery` (text[]) — additional image URLs
  - `is_deleted` (boolean, default false) — soft delete flag
  - `created_at` (timestamptz, default now())

## Security
- Enable RLS on `dresses`.
- Allow anon + authenticated full CRUD (single-tenant, public catalog).

## Notes
1. Soft delete is supported via the `is_deleted` flag.
2. Sizes and colors are stored as text arrays for flexible filtering.
*/

CREATE TABLE IF NOT EXISTS dresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text NOT NULL,
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  gallery text[] DEFAULT '{}',
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dresses" ON dresses;
CREATE POLICY "anon_select_dresses"
ON dresses FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dresses" ON dresses;
CREATE POLICY "anon_insert_dresses"
ON dresses FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dresses" ON dresses;
CREATE POLICY "anon_update_dresses"
ON dresses FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dresses" ON dresses;
CREATE POLICY "anon_delete_dresses"
ON dresses FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_dresses_category ON dresses(category);
CREATE INDEX IF NOT EXISTS idx_dresses_is_deleted ON dresses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_dresses_name ON dresses(name);
