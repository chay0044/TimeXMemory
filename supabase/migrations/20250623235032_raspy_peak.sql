/*
  # Create albums table

  1. New Tables
    - `albums`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles, not null)
      - `title` (text, not null)
      - `description` (text)
      - `combine_criteria` (text)
      - `access_type` (text, not null, check: public/private/shared)
      - `is_anonymous` (boolean, default true)
      - `preview_url` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `albums` table
    - Add policies for CRUD operations based on access type
*/

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  combine_criteria text CHECK (combine_criteria IN ('location', 'people', 'date', 'theme', 'custom')),
  access_type text NOT NULL CHECK (access_type IN ('public', 'private', 'shared')),
  is_anonymous boolean DEFAULT true,
  preview_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_albums_creator_id ON albums(creator_id);
CREATE INDEX IF NOT EXISTS idx_albums_access_type ON albums(access_type);
CREATE INDEX IF NOT EXISTS idx_albums_combine_criteria ON albums(combine_criteria);

-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view public albums"
  ON albums
  FOR SELECT
  TO authenticated
  USING (access_type = 'public');

CREATE POLICY "Users can view their own albums"
  ON albums
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can create their own albums"
  ON albums
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own albums"
  ON albums
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own albums"
  ON albums
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Trigger to update updated_at
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();