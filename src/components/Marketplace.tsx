import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Star, Video, Calendar, Loader2, AlertTriangle, Plus, SlidersHorizontal } from 'lucide-react';
import { getVouchers, Voucher } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import VoucherCreator from './VoucherCreator';
import AdvancedSearch from './AdvancedSearch';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'browse' | 'create' | 'search'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vouchers from Supabase
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await getVouchers({
        skill: serviceFilter || undefined,
        location: locationFilter || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isUrgent: showUrgentOnly || undefined,
      });

      if (fetchError) {
        throw fetchError;
      }

      setVouchers(data || []);
    } catch (err: any) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to load vouchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVouchers();
    }, 300); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [serviceFilter, locationFilter, maxPrice, showUrgentOnly]);

  const filteredAndSortedVouchers = useMemo(() => {
    let filtered = vouchers.filter(voucher => {
      const matchesSearch = voucher.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (voucher.profiles?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (voucher.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          const ratingA = a.profiles?.rating || 0;
          const ratingB = b.profiles?.rating || 0;
          return ratingB - ratingA;
        case 'urgent':
          if (a.is_urgent && !b.is_urgent) return -1;
          if (!a.is_urgent && b.is_urgent) return 1;
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [vouchers, searchTerm, sortBy]);

  const handleBookVoucher = (voucher: Voucher) => {
    const sellerName = voucher.profiles?.username || 'the seller';
    alert(`🎬 Creating Whereby room for "${voucher.skill}" with ${sellerName}.\n\nVideo verification will begin once both parties join and consent to recording.`);
  };

  const renderRating = (rating: number | undefined, completions: number | undefined) => {
    const stars = Math.round(rating || 0);
    const isLowRated = (rating || 0) <= 2;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={`w-4 h-4 ${i <= stars ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {(rating || 0).toFixed(1)} ({completions || 0} completed)
        </span>
        {isLowRated && (rating || 0) > 0 && (
          <span className="text-sm text-orange-400">☕ Need coffee to act?</span>
        )}
      </div>
    );
  };

  const getTimeUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setServiceFilter('');
    setMaxPrice('');
    setLocationFilter('');
    setShowUrgentOnly(false);
    setSortBy('newest');
  };

  if (activeView === 'create') {
    return <VoucherCreator onBack={() => setActiveView('browse')} />;
  }

  if (activeView === 'search') {
    return <AdvancedSearch onBack={() => setActiveView('browse')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Service Marketplace
        </h2>
        <p className="text-gray-400">Find and book valuable time assets - from professional skills to everyday tasks</p>
      </div>

      {/* Action Buttons */}
      {user && (
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Create Voucher</span>
          </button>
          <button
            onClick={() => setActiveView('search')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Advanced Search</span>
          </button>
        </div>
      )}

      {/* Quick Filters */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services, skills, or people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Service Filter */}
          <div>
            <input
              type="text"
              placeholder="Service type..."
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>

          {/* Location Filter */}
          <div>
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>

          {/* Max Price */}
          <div>
            <input
              type="number"
              placeholder="Max price £"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="urgent">Urgent First</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowUrgentOnly(!showUrgentOnly)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
              showUrgentOnly 
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                : 'bg-black/30 text-gray-300 border-gray-600 hover:border-orange-500/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Urgent Only</span>
          </button>

          {(searchTerm || serviceFilter || maxPrice || locationFilter || showUrgentOnly) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200"
            >
              Clear Filters
            </button>
          )}

          <div className="text-sm text-gray-400 ml-auto">
            {loading ? 'Loading...' : `${filteredAndSortedVouchers.length} services found`}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading services...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Services</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchVouchers}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Voucher Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedVouchers.map(voucher => {
            const timeLeft = getTimeUntilExpiry(voucher.expires_at);
            const isExpired = timeLeft === 'Expired';
            
            return (
              <div
                key={voucher.id}
                className={`bg-black/20 backdrop-blur-md rounded-xl border p-6 transition-all duration-200 hover:transform hover:scale-105 ${
                  voucher.is_urgent 
                    ? 'border-orange-500/50 shadow-lg shadow-orange-500/20' 
                    : isExpired
                    ? 'border-red-500/50 opacity-60'
                    : 'border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                {/* Urgent Badge */}
                {voucher.is_urgent && !isExpired && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 mb-3">
                    🔥 Urgent
                    {timeLeft && ` • Expires in ${timeLeft}`}
                  </div>
                )}

                {/* Expired Badge */}
                {isExpired && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
                    ⏰ Expired
                  </div>
                )}

                {/* Service & Price */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-white">{voucher.skill}</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      {voucher.currency === 'GBP' ? '£' : voucher.currency === 'USD' ? '$' : '€'}{voucher.price}
                    </div>
                    <div className="text-sm text-gray-400">per hour</div>
                  </div>
                </div>

                {/* Description */}
                {voucher.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{voucher.description}</p>
                )}

                {/* Date, Time, Location */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(voucher.date_available).toLocaleDateString()} at {voucher.time_available}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {voucher.location}
                  </div>
                  {timeLeft && !isExpired && (
                    <div className="flex items-center text-sm text-orange-400">
                      <Clock className="w-4 h-4 mr-2" />
                      Expires in {timeLeft}
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-white mb-1">
                    {voucher.profiles?.username || 'Anonymous Seller'}
                  </div>
                  {voucher.profiles && renderRating(voucher.profiles.rating, voucher.profiles.completions)}
                </div>

                {/* Book Button */}
                <button
                  onClick={() => handleBookVoucher(voucher)}
                  disabled={isExpired}
                  className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 rounded-lg transition-all duration-200 ${
                    isExpired
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white shadow-lg hover:shadow-cyan-500/25'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isExpired ? 'Expired' : 'Book & Verify'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredAndSortedVouchers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No services found</h3>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;