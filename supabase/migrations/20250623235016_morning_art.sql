/*
  # Create vouchers table

  1. New Tables
    - `vouchers`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references profiles, not null)
      - `skill` (text, not null)
      - `description` (text)
      - `date_available` (date, not null)
      - `time_available` (time, not null)
      - `price` (numeric, not null)
      - `currency` (text, not null, default 'GBP')
      - `location` (text, not null)
      - `expires_at` (timestamptz)
      - `is_urgent` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `vouchers` table
    - Add policies for CRUD operations
*/

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill text NOT NULL,
  description text,
  date_available date NOT NULL,
  time_available time NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  currency text NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'USD', 'EUR')),
  location text NOT NULL,
  expires_at timestamptz,
  is_urgent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vouchers_seller_id ON vouchers(seller_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_skill ON vouchers(skill);
CREATE INDEX IF NOT EXISTS idx_vouchers_date_available ON vouchers(date_available);
CREATE INDEX IF NOT EXISTS idx_vouchers_price ON vouchers(price);
CREATE INDEX IF NOT EXISTS idx_vouchers_location ON vouchers(location);
CREATE INDEX IF NOT EXISTS idx_vouchers_expires_at ON vouchers(expires_at);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active vouchers"
  ON vouchers
  FOR SELECT
  TO authenticated
  USING (expires_at IS NULL OR expires_at > now());

CREATE POLICY "Users can create their own vouchers"
  ON vouchers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own vouchers"
  ON vouchers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own vouchers"
  ON vouchers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Trigger to update updated_at
CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();