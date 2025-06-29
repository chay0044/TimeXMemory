/*
  # Create storage buckets for file uploads

  1. Storage Buckets
    - `memories` - For storing memory files (images/videos)
    - `avatars` - For storing user avatar images

  2. Storage Policies
    - Users can upload to their own folders
    - Public read access for approved content
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('memories', 'memories', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for memories bucket
CREATE POLICY "Users can upload their own memories"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own memories"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own memories"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own memories"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'memories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );