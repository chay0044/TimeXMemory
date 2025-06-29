/*
  # Insert mock data for reviews system

  1. Mock Data
    - Create test users and profiles
    - Create memories and albums
    - Create listings for auction/subscription
    - Create bids and subscriptions to establish purchase relationships
    - Create reviews only from users who have purchased/subscribed

  2. Relationships
    - Only users who have bid, subscribed, or collaborated can write reviews
    - Reviews are linked to listings and target items
*/

-- Create mock data without touching auth.users (let the trigger handle profile creation)
-- Instead, we'll create vouchers and other data that can be reviewed

-- Insert mock vouchers first
INSERT INTO vouchers (id, seller_id, skill, description, date_available, time_available, price, currency, location, is_urgent, created_at) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as seller
    'React Development Tutoring',
    'Expert React developer offering personalized tutoring sessions. Covers hooks, state management, testing, and best practices.',
    '2024-12-20',
    '14:00:00',
    45.00,
    'GBP',
    'London, UK',
    false,
    '2024-12-15 10:00:00+00'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as seller
    'Photography Session',
    'Professional photography session for portraits, events, and commercial work.',
    '2024-12-22',
    '10:00:00',
    120.00,
    'GBP',
    'Manchester, UK',
    false,
    '2024-12-16 09:00:00+00'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as seller
    'Grocery Shopping Service',
    'I will do your grocery shopping and deliver to your door. Perfect for busy professionals.',
    '2024-12-21',
    '09:00:00',
    15.00,
    'GBP',
    'Birmingham, UK',
    true,
    '2024-12-17 08:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert mock memories
INSERT INTO memories (id, owner_id, title, description, type, location, date_captured, theme, preview_url, created_at) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as owner
    'Sunset from London Bridge',
    'Beautiful sunset captured from London Bridge during golden hour',
    'image',
    'London, UK',
    '2024-12-15',
    'Nature',
    'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
    '2024-12-15 18:30:00+00'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as owner
    'First Snow Experience',
    'My dog experiencing snow for the first time - pure joy captured',
    'video',
    'Manchester, UK',
    '2024-12-10',
    'Pets',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    '2024-12-10 15:20:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert mock albums
INSERT INTO albums (id, creator_id, title, description, access_type, created_at) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as creator
    'London Adventures',
    'A collaborative collection of London moments from multiple friends',
    'public',
    '2024-12-05 12:00:00+00'
  ),
  (
    '880e8400-e29b-41d4-a716-446655440004',
    (SELECT id FROM profiles LIMIT 1), -- Use existing user as creator
    'Culinary Journey',
    'Weekend cooking adventures and recipe discoveries',
    'public',
    '2024-12-12 10:30:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert mock listings for the items
INSERT INTO listings (id, item_id, item_type, seller_id, sale_type, reserve_price, one_time_price, subscription_price, subscription_interval, current_bid, bid_count, status, created_at) VALUES
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001', -- Sunset memory
    'memory',
    (SELECT id FROM profiles LIMIT 1),
    'auction',
    25.00,
    NULL,
    NULL,
    NULL,
    42.00,
    7,
    'active',
    '2024-12-15 19:00:00+00'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440002', -- Dog video
    'memory',
    (SELECT id FROM profiles LIMIT 1),
    'one-time-purchase',
    NULL,
    15.00,
    NULL,
    NULL,
    15.00,
    0,
    'active',
    '2024-12-10 16:00:00+00'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440003', -- London Adventures album
    'album',
    (SELECT id FROM profiles LIMIT 1),
    'auction',
    75.00,
    NULL,
    NULL,
    NULL,
    125.00,
    8,
    'active',
    '2024-12-05 12:30:00+00'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440004',
    '880e8400-e29b-41d4-a716-446655440004', -- Culinary Journey album
    'album',
    (SELECT id FROM profiles LIMIT 1),
    'subscription',
    NULL,
    NULL,
    8.00,
    'monthly',
    8.00,
    15,
    'active',
    '2024-12-12 11:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert bids to establish purchase relationships (using existing user as bidder)
INSERT INTO bids (id, listing_id, bidder_id, amount, created_at) VALUES
  (
    'bb0e8400-e29b-41d4-a716-446655440001',
    '990e8400-e29b-41d4-a716-446655440001', -- Sunset memory listing
    (SELECT id FROM profiles LIMIT 1), -- Current user as bidder
    35.00,
    '2024-12-16 10:00:00+00'
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440002',
    '990e8400-e29b-41d4-a716-446655440003', -- London Adventures album
    (SELECT id FROM profiles LIMIT 1), -- Current user as bidder
    100.00,
    '2024-12-06 14:30:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert subscriptions to establish subscription relationships (using existing user as subscriber)
INSERT INTO subscriptions (id, listing_id, subscriber_id, status, created_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '990e8400-e29b-41d4-a716-446655440004', -- Culinary Journey album
    (SELECT id FROM profiles LIMIT 1), -- Current user as subscriber
    'active',
    '2024-12-12 09:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Now insert reviews (only from users who have purchased/subscribed/collaborated)
-- Using the current user who has established purchase relationships above
INSERT INTO reviews (id, reviewer_id, target_id, target_type, listing_id, rating, title, content, pros, cons, would_recommend, service_date, verified_purchase, created_at) VALUES
  (
    'cc0e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM profiles LIMIT 1), -- Current user (has bid on sunset memory)
    '990e8400-e29b-41d4-a716-446655440001', -- Sunset memory listing
    'listing',
    '990e8400-e29b-41d4-a716-446655440001',
    5,
    'Absolutely stunning sunset capture!',
    'This sunset photo from London Bridge is breathtaking. The golden hour lighting is perfect and the composition is professional quality. Perfect for my living room wall art collection.',
    ARRAY['Professional quality', 'Perfect lighting', 'Great composition', 'High resolution'],
    ARRAY['Wish there were more angles'],
    true,
    '2024-12-16',
    true,
    '2024-12-17 10:30:00+00'
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440002',
    (SELECT id FROM profiles LIMIT 1), -- Current user (subscribed to culinary album)
    '990e8400-e29b-41d4-a716-446655440004', -- Culinary Journey album
    'listing',
    '990e8400-e29b-41d4-a716-446655440004',
    5,
    'Amazing culinary content - worth every penny!',
    'The culinary journey album is incredible! The recipes are detailed, photos are mouth-watering, and I have learned so many new techniques. The monthly updates keep it fresh and exciting.',
    ARRAY['Detailed recipes', 'Beautiful photography', 'Regular updates', 'Great value'],
    ARRAY[]::text[],
    true,
    '2024-12-12',
    true,
    '2024-12-20 09:45:00+00'
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440003',
    (SELECT id FROM profiles LIMIT 1), -- Current user (bid on London Adventures album)
    '990e8400-e29b-41d4-a716-446655440003', -- London Adventures album
    'listing',
    '990e8400-e29b-41d4-a716-446655440003',
    4,
    'Great collaborative album concept',
    'Love the idea of collaborative albums! The London Adventures collection captures the city beautifully from multiple perspectives. Great way to share memories with friends.',
    ARRAY['Collaborative concept', 'Multiple perspectives', 'Great memories', 'Easy sharing'],
    ARRAY['Could use more organization', 'Some photos are low quality'],
    true,
    '2024-12-06',
    true,
    '2024-12-07 16:20:00+00'
  )
ON CONFLICT (id) DO NOTHING;