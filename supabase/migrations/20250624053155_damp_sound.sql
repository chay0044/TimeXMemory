/*
  # Create reviews table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `reviewer_id` (uuid, references profiles, not null)
      - `target_id` (uuid, not null) - can reference listings, users, etc.
      - `target_type` (text, not null) - 'listing', 'user', 'service'
      - `listing_id` (uuid, references listings) - for purchase verification
      - `rating` (integer, 1-5, not null)
      - `title` (text, not null)
      - `content` (text, not null)
      - `pros` (text array)
      - `cons` (text array)
      - `would_recommend` (boolean, default true)
      - `service_date` (date)
      - `verified_purchase` (boolean, default false)
      - `helpful_votes` (integer, default 0)
      - `total_votes` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `reviews` table
    - Add policies for review management
    - Ensure only verified purchasers can write reviews
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('listing', 'user', 'service')),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  pros text[] DEFAULT '{}',
  cons text[] DEFAULT '{}',
  would_recommend boolean DEFAULT true,
  service_date date,
  verified_purchase boolean DEFAULT false,
  helpful_votes integer DEFAULT 0 CHECK (helpful_votes >= 0),
  total_votes integer DEFAULT 0 CHECK (total_votes >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_type ON reviews(target_type);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchase ON reviews(verified_purchase);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for purchased items"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND (
      -- User has purchased/bid on the listing
      EXISTS (
        SELECT 1 FROM bids 
        WHERE bids.listing_id = reviews.listing_id 
        AND bids.bidder_id = auth.uid()
      )
      OR
      -- User has subscribed to the listing
      EXISTS (
        SELECT 1 FROM subscriptions 
        WHERE subscriptions.listing_id = reviews.listing_id 
        AND subscriptions.subscriber_id = auth.uid()
        AND subscriptions.status = 'active'
      )
      OR
      -- User is a collaborator on the album/memory
      EXISTS (
        SELECT 1 FROM collaborators 
        JOIN albums ON albums.id = collaborators.album_id
        JOIN listings ON listings.item_id = albums.id AND listings.item_type = 'album'
        WHERE listings.id = reviews.listing_id
        AND collaborators.user_id = auth.uid()
        AND collaborators.status = 'accepted'
      )
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- Function to automatically set verified_purchase flag
CREATE OR REPLACE FUNCTION set_verified_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has actually purchased/interacted with the item
  NEW.verified_purchase := (
    EXISTS (
      SELECT 1 FROM bids 
      WHERE bids.listing_id = NEW.listing_id 
      AND bids.bidder_id = NEW.reviewer_id
    )
    OR
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.listing_id = NEW.listing_id 
      AND subscriptions.subscriber_id = NEW.reviewer_id
      AND subscriptions.status IN ('active', 'cancelled')
    )
    OR
    EXISTS (
      SELECT 1 FROM collaborators 
      JOIN albums ON albums.id = collaborators.album_id
      JOIN listings ON listings.item_id = albums.id AND listings.item_type = 'album'
      WHERE listings.id = NEW.listing_id
      AND collaborators.user_id = NEW.reviewer_id
      AND collaborators.status = 'accepted'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to set verified purchase status
CREATE TRIGGER set_verified_purchase_trigger
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_verified_purchase();

-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();