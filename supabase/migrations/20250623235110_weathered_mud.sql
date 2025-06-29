/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings, not null)
      - `subscriber_id` (uuid, references profiles, not null)
      - `start_date` (timestamptz, default now())
      - `end_date` (timestamptz)
      - `status` (text, not null, check: active/cancelled/expired)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for subscription management
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, subscriber_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_listing_id ON subscriptions(listing_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscriber_id ON subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view subscriptions to their listings"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = subscriptions.listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

CREATE POLICY "Users can create subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = subscriber_id
    AND
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = subscriptions.listing_id 
      AND listings.status = 'active'
      AND listings.sale_type = 'subscription'
      AND listings.seller_id != auth.uid()
    )
  );

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = subscriber_id);

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();