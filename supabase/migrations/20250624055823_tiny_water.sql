/*
  # Create uploaded_files table

  1. New Tables
    - `uploaded_files`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `size` (bigint, not null)
      - `type` (text, not null)
      - `url` (text, not null)
      - `file_path` (text, not null)
      - `owner_id` (uuid, references profiles, not null)
      - `category` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `uploaded_files` table
    - Add policies for CRUD operations
*/

-- Create uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL CHECK (size > 0),
  type text NOT NULL,
  url text NOT NULL,
  file_path text NOT NULL,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('image', 'video', 'audio', 'document', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_files_owner_id ON uploaded_files(owner_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_category ON uploaded_files(category);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at);

-- Enable RLS
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own files"
  ON uploaded_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can upload their own files"
  ON uploaded_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own files"
  ON uploaded_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own files"
  ON uploaded_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Trigger to update updated_at
CREATE TRIGGER update_uploaded_files_updated_at
  BEFORE UPDATE ON uploaded_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();