/*
  # Create album_memories junction table

  1. New Tables
    - `album_memories`
      - `album_id` (uuid, references albums, not null)
      - `memory_id` (uuid, references memories, not null)
      - `created_at` (timestamptz, default now())
      - Primary key: (album_id, memory_id)

  2. Security
    - Enable RLS on `album_memories` table
    - Add policies for managing album-memory associations
*/

-- Create album_memories junction table
CREATE TABLE IF NOT EXISTS album_memories (
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (album_id, memory_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_album_memories_album_id ON album_memories(album_id);
CREATE INDEX IF NOT EXISTS idx_album_memories_memory_id ON album_memories(memory_id);

-- Enable RLS
ALTER TABLE album_memories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view album memories for their albums"
  ON album_memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_memories.album_id 
      AND albums.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can view album memories for public albums"
  ON album_memories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_memories.album_id 
      AND albums.access_type = 'public'
    )
  );

CREATE POLICY "Users can add memories to their albums"
  ON album_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_memories.album_id 
      AND albums.creator_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM memories 
      WHERE memories.id = album_memories.memory_id 
      AND memories.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove memories from their albums"
  ON album_memories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = album_memories.album_id 
      AND albums.creator_id = auth.uid()
    )
  );