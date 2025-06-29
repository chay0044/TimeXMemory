/*
  # Create bids table

  1. New Tables
    - `bids`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings, not null)
      - `bidder_id` (uuid, references profiles, not null)
      - `amount` (numeric, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `bids` table
    - Add policies for bid management
*/

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_listing_id ON bids(listing_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view bids on their listings"
  ON bids
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = bids.listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own bids"
  ON bids
  FOR SELECT
  TO authenticated
  USING (auth.uid() = bidder_id);

CREATE POLICY "Users can place bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = bidder_id
    AND
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = bids.listing_id 
      AND listings.status = 'active'
      AND listings.sale_type = 'auction'
      AND (listings.expires_at IS NULL OR listings.expires_at > now())
      AND listings.seller_id != auth.uid()
    )
  );

-- Function to update listing when new bid is placed
CREATE OR REPLACE FUNCTION update_listing_on_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings 
  SET 
    current_bid = NEW.amount,
    bid_count = bid_count + 1,
    updated_at = now()
  WHERE id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update listing when bid is placed
CREATE TRIGGER update_listing_on_new_bid
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_on_bid();