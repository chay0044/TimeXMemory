import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  rating?: number;
  completions?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Voucher {
  id: string;
  seller_id: string;
  skill: string;
  description?: string;
  date_available: string;
  time_available: string;
  price: number;
  currency: string;
  location: string;
  expires_at?: string;
  is_urgent?: boolean;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

export interface Memory {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  location?: string;
  date_captured?: string;
  theme?: string;
  preview_url?: string;
  file_path?: string;
  is_anonymous?: boolean;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

export interface Album {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  combine_criteria?: 'location' | 'people' | 'date' | 'theme' | 'custom';
  access_type: 'public' | 'private' | 'shared';
  is_anonymous?: boolean;
  preview_url?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

export interface Listing {
  id: string;
  item_id: string;
  item_type: 'voucher' | 'memory' | 'album';
  seller_id: string;
  sale_type: 'auction' | 'one-time-purchase' | 'subscription';
  reserve_price?: number;
  one_time_price?: number;
  subscription_price?: number;
  subscription_interval?: 'monthly' | 'yearly';
  current_bid?: number;
  bid_count?: number;
  expires_at?: string;
  status?: 'active' | 'sold' | 'expired' | 'draft';
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  target_id: string;
  target_type: 'listing' | 'user' | 'service';
  listing_id?: string;
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  would_recommend?: boolean;
  service_date?: string;
  verified_purchase?: boolean;
  helpful_votes?: number;
  total_votes?: number;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  created_at?: string;
}

export interface Subscription {
  id: string;
  listing_id: string;
  subscriber_id: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at?: string;
  updated_at?: string;
}

export interface Collaborator {
  album_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  invited_by: string;
  created_at?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file_path: string;
  owner_id: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'other';
  created_at?: string;
  updated_at?: string;
}

// Helper functions for database operations
export const createVoucher = async (voucherData: Omit<Voucher, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('vouchers')
    .insert([voucherData])
    .select('*')
    .single();

  return { data, error };
};

export const getVouchers = async (filters?: {
  skill?: string;
  location?: string;
  maxPrice?: number;
  isUrgent?: boolean;
}) => {
  let query = supabase
    .from('vouchers')
    .select(`
      *,
      profiles:seller_id (
        id,
        username,
        rating,
        completions
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.skill) {
    query = query.ilike('skill', `%${filters.skill}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.isUrgent !== undefined) {
    query = query.eq('is_urgent', filters.isUrgent);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getReviews = async (filters?: {
  targetId?: string;
  targetType?: string;
  verifiedOnly?: boolean;
  minRating?: number;
}) => {
  let query = supabase
    .from('reviews')
    .select(`
      *,
      profiles:reviewer_id (
        id,
        username,
        avatar_url,
        rating,
        completions
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.targetId) {
    query = query.eq('target_id', filters.targetId);
  }

  if (filters?.targetType) {
    query = query.eq('target_type', filters.targetType);
  }

  if (filters?.verifiedOnly) {
    query = query.eq('verified_purchase', true);
  }

  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createReview = async (reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'verified_purchase'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select('*')
    .single();

  return { data, error };
};

export const checkReviewEligibility = async (userId: string, listingId: string) => {
  // Check if user has purchased, subscribed, or collaborated
  const { data: bids } = await supabase
    .from('bids')
    .select('id')
    .eq('listing_id', listingId)
    .eq('bidder_id', userId)
    .limit(1);

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('listing_id', listingId)
    .eq('subscriber_id', userId)
    .in('status', ['active', 'cancelled'])
    .limit(1);

  // Check for collaboration (for albums)
  const { data: collaborations } = await supabase
    .from('collaborators')
    .select('album_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (collaborations && collaborations.length > 0) {
    const albumIds = collaborations.map(c => c.album_id);
    const { data: albumListings } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .eq('item_type', 'album')
      .in('item_id', albumIds)
      .limit(1);

    if (albumListings && albumListings.length > 0) {
      return { eligible: true, reason: 'collaboration' };
    }
  }

  if (bids && bids.length > 0) {
    return { eligible: true, reason: 'purchase' };
  }

  if (subscriptions && subscriptions.length > 0) {
    return { eligible: true, reason: 'subscription' };
  }

  return { eligible: false, reason: 'no_interaction' };
};

export const getMemories = async (filters?: {
  ownerId?: string;
  type?: string;
  theme?: string;
  location?: string;
}) => {
  let query = supabase
    .from('memories')
    .select(`
      *,
      profiles:owner_id (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.theme) {
    query = query.ilike('theme', `%${filters.theme}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createMemory = async (memoryData: Omit<Memory, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('memories')
    .insert([memoryData])
    .select('*')
    .single();

  return { data, error };
};

export const getListings = async (filters?: {
  itemType?: string;
  saleType?: string;
  status?: string;
  sellerId?: string;
}) => {
  let query = supabase
    .from('listings')
    .select(`
      *,
      profiles:seller_id (
        id,
        username,
        avatar_url,
        rating,
        completions
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.itemType) {
    query = query.eq('item_type', filters.itemType);
  }

  if (filters?.saleType) {
    query = query.eq('sale_type', filters.saleType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.sellerId) {
    query = query.eq('seller_id', filters.sellerId);
  }

  const { data, error } = await query;
  return { data, error };
};

// File upload functions
export const uploadFile = async (file: File, userId: string, category: string): Promise<{ data: UploadedFile | null; error: any }> => {
  try {
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${category}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('memories')
      .getPublicUrl(filePath);

    // Save file metadata to database
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      file_path: filePath,
      owner_id: userId,
      category: getFileCategory(file.type),
    };

    const { data, error } = await supabase
      .from('uploaded_files')
      .insert([fileData])
      .select('*')
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserFiles = async (userId: string, category?: string) => {
  let query = supabase
    .from('uploaded_files')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
};

export const deleteFile = async (fileId: string, userId: string) => {
  // First get the file to get the file path
  const { data: file, error: fetchError } = await supabase
    .from('uploaded_files')
    .select('file_path')
    .eq('id', fileId)
    .eq('owner_id', userId)
    .single();

  if (fetchError || !file) {
    return { error: fetchError || new Error('File not found') };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('memories')
    .remove([file.file_path]);

  if (storageError) {
    return { error: storageError };
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('uploaded_files')
    .delete()
    .eq('id', fileId)
    .eq('owner_id', userId);

  return { error: dbError };
};

const getFileCategory = (type: string): 'image' | 'video' | 'audio' | 'document' | 'other' => {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf') || type.includes('doc') || type.includes('text')) return 'document';
  return 'other';
};