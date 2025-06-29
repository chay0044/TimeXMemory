/*
  # Create memories table

  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles, not null)
      - `title` (text, not null)
      - `description` (text)
      - `type` (text, not null, check: image/video)
      - `location` (text)
      - `date_captured` (date)
      - `theme` (text)
      - `preview_url` (text)
      - `file_path` (text)
      - `is_anonymous` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `memories` table
    - Add policies for CRUD operations
*/

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  location text,
  date_captured date,
  theme text,
  preview_url text,
  file_path text,
  is_anonymous boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_owner_id ON memories(owner_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_location ON memories(location);
CREATE INDEX IF NOT EXISTS idx_memories_date_captured ON memories(date_captured);
CREATE INDEX IF NOT EXISTS idx_memories_theme ON memories(theme);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own memories"
  ON memories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own memories"
  ON memories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own memories"
  ON memories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own memories"
  ON memories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Trigger to update updated_at
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();