/*
  # Create listings table

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `item_id` (uuid, not null)
      - `item_type` (text, not null, check: voucher/memory/album)
      - `seller_id` (uuid, references profiles, not null)
      - `sale_type` (text, not null, check: auction/one-time-purchase/subscription)
      - `reserve_price` (numeric)
      - `one_time_price` (numeric)
      - `subscription_price` (numeric)
      - `subscription_interval` (text, check: monthly/yearly)
      - `current_bid` (numeric, default 0)
      - `bid_count` (integer, default 0)
      - `expires_at` (timestamptz)
      - `status` (text, default 'active')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `listings` table
    - Add policies for CRUD operations
*/

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('voucher', 'memory', 'album')),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sale_type text NOT NULL CHECK (sale_type IN ('auction', 'one-time-purchase', 'subscription')),
  reserve_price numeric CHECK (reserve_price >= 0),
  one_time_price numeric CHECK (one_time_price >= 0),
  subscription_price numeric CHECK (subscription_price >= 0),
  subscription_interval text CHECK (subscription_interval IN ('monthly', 'yearly')),
  current_bid numeric DEFAULT 0 CHECK (current_bid >= 0),
  bid_count integer DEFAULT 0 CHECK (bid_count >= 0),
  expires_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_item_id ON listings(item_id);
CREATE INDEX IF NOT EXISTS idx_listings_item_type ON listings(item_type);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_sale_type ON listings(sale_type);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_expires_at ON listings(expires_at);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Trigger to update updated_at
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();