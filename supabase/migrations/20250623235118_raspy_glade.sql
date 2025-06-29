/*
  # Create collaborators table

  1. New Tables
    - `collaborators`
      - `album_id` (uuid, references albums, not null)
      - `user_id` (uuid, references profiles, not null)
      - `status` (text, not null, check: pending/accepted/rejected)
      - `invited_by` (uuid, references profiles, not null)
      - `created_at` (timestamptz, default now())
      - Primary key: (album_id, user_id)

  2. Security
    - Enable RLS on `collaborators` table
    - Add policies for collaboration management
*/

-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (album_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaborators_album_id ON collaborators(album_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_status ON collaborators(status);
CREATE INDEX IF NOT EXISTS idx_collaborators_invited_by ON collaborators(invited_by);

-- Enable RLS
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view collaborations for their albums"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = collaborators.album_id 
      AND albums.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own collaboration invitations"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Album creators can invite collaborators"
  ON collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = invited_by
    AND
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = collaborators.album_id 
      AND albums.creator_id = auth.uid()
      AND albums.access_type = 'shared'
    )
  );

CREATE POLICY "Users can respond to their collaboration invitations"
  ON collaborators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Album creators can remove collaborators"
  ON collaborators
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = collaborators.album_id 
      AND albums.creator_id = auth.uid()
    )
  );

-- Add policy for collaborators to view shared albums
CREATE POLICY "Collaborators can view shared albums"
  ON albums
  FOR SELECT
  TO authenticated
  USING (
    access_type = 'shared'
    AND
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.album_id = albums.id 
      AND collaborators.user_id = auth.uid()
      AND collaborators.status = 'accepted'
    )
  );

-- Add policy for collaborators to view album memories
CREATE POLICY "Collaborators can view shared album memories"
  ON album_memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      JOIN collaborators ON collaborators.album_id = albums.id
      WHERE albums.id = album_memories.album_id 
      AND albums.access_type = 'shared'
      AND collaborators.user_id = auth.uid()
      AND collaborators.status = 'accepted'
    )
  );