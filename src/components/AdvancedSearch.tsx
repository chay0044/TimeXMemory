import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Shield, Clock, DollarSign, Calendar, User, SlidersHorizontal, X, ArrowLeft } from 'lucide-react';
import TrustBadges from './TrustBadges';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  priceRange: { min: string; max: string };
  rating: string;
  verifiedOnly: boolean;
  responseTime: string;
  availability: string;
  sortBy: string;
  experienceLevel: string;
  languages: string[];
}

interface SearchResult {
  id: string;
  type: 'voucher' | 'memory' | 'album';
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  seller: {
    id: string;
    username: string;
    avatar_url?: string;
    rating: number;
    completions: number;
    isVerified: boolean;
    responseTime: string;
    memberSince: string;
    languages: string[];
  };
  category: string;
  tags: string[];
  availability: string;
  urgency: boolean;
  previewUrl?: string;
}

interface AdvancedSearchProps {
  onBack?: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onBack }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    priceRange: { min: '', max: '' },
    rating: '',
    verifiedOnly: false,
    responseTime: '',
    availability: '',
    sortBy: 'relevance',
    experienceLevel: '',
    languages: [],
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('');

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'voucher',
      title: 'React Development Tutoring',
      description: 'Expert React developer offering personalized tutoring sessions. Covers hooks, state management, testing, and best practices.',
      price: 45,
      currency: 'GBP',
      location: 'London, UK',
      seller: {
        id: 'seller1',
        username: 'Sarah Chen',
        avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4.9,
        completions: 127,
        isVerified: true,
        responseTime: 'fast',
        memberSince: '2023-01-15',
        languages: ['English', 'Mandarin']
      },
      category: 'Programming',
      tags: ['react', 'javascript', 'tutoring', 'web-development'],
      availability: 'available',
      urgency: false,
      previewUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      type: 'voucher',
      title: 'Professional Photography Session',
      description: 'Capture your special moments with a professional photographer. Portrait, event, and commercial photography available.',
      price: 120,
      currency: 'GBP',
      location: 'Manchester, UK',
      seller: {
        id: 'seller2',
        username: 'Alex Kim',
        avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4.7,
        completions: 89,
        isVerified: true,
        responseTime: 'fast',
        memberSince: '2022-08-20',
        languages: ['English', 'Korean']
      },
      category: 'Photography',
      tags: ['photography', 'portraits', 'events', 'professional'],
      availability: 'available',
      urgency: false,
      previewUrl: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      type: 'voucher',
      title: 'Urgent: Queue for iPhone Launch',
      description: 'Need someone to queue for the new iPhone launch at Apple Store. Will provide payment for device + service fee.',
      price: 25,
      currency: 'GBP',
      location: 'London, UK',
      seller: {
        id: 'seller3',
        username: 'TechEnthusiast',
        rating: 4.2,
        completions: 23,
        isVerified: false,
        responseTime: 'medium',
        memberSince: '2024-06-10',
        languages: ['English']
      },
      category: 'Queueing',
      tags: ['queueing', 'apple', 'iphone', 'urgent'],
      availability: 'urgent',
      urgency: true,
      previewUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      type: 'memory',
      title: 'Sunset from London Bridge',
      description: 'Beautiful sunset captured from London Bridge during golden hour. Perfect for wall art or digital collections.',
      price: 35,
      currency: 'GBP',
      location: 'London, UK',
      seller: {
        id: 'seller4',
        username: 'UrbanExplorer',
        avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4.6,
        completions: 45,
        isVerified: true,
        responseTime: 'fast',
        memberSince: '2023-03-12',
        languages: ['English', 'Spanish']
      },
      category: 'Photography',
      tags: ['sunset', 'london', 'bridge', 'cityscape'],
      availability: 'available',
      urgency: false,
      previewUrl: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const categories = [
    'Programming', 'Design', 'Photography', 'Writing', 'Tutoring', 'Music',
    'Cooking', 'Fitness', 'Handyman', 'Gardening', 'Pet Care', 'Cleaning',
    'Delivery', 'Queueing', 'Administrative', 'Translation', 'Consulting'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const filteredResults = useMemo(() => {
    let results = mockResults.filter(result => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesTitle = result.title.toLowerCase().includes(query);
        const matchesDescription = result.description.toLowerCase().includes(query);
        const matchesTags = result.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesSeller = result.seller.username.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesTags && !matchesSeller) {
          return false;
        }
      }

      // Category filter
      if (filters.category && result.category !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location && !result.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min && result.price < Number(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && result.price > Number(filters.priceRange.max)) {
        return false;
      }

      // Rating filter
      if (filters.rating && result.seller.rating < Number(filters.rating)) {
        return false;
      }

      // Verified only filter
      if (filters.verifiedOnly && !result.seller.isVerified) {
        return false;
      }

      // Response time filter
      if (filters.responseTime && result.seller.responseTime !== filters.responseTime) {
        return false;
      }

      // Availability filter
      if (filters.availability && result.availability !== filters.availability) {
        return false;
      }

      // Experience level filter
      if (filters.experienceLevel) {
        const completions = result.seller.completions;
        switch (filters.experienceLevel) {
          case 'beginner':
            if (completions >= 10) return false;
            break;
          case 'experienced':
            if (completions < 10 || completions >= 50) return false;
            break;
          case 'expert':
            if (completions < 50) return false;
            break;
        }
      }

      // Languages filter
      if (filters.languages.length > 0) {
        const hasMatchingLanguage = filters.languages.some(lang => 
          result.seller.languages.includes(lang)
        );
        if (!hasMatchingLanguage) return false;
      }

      return true;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.seller.rating - a.seller.rating);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.seller.memberSince).getTime() - new Date(a.seller.memberSince).getTime());
        break;
      case 'experience':
        results.sort((a, b) => b.seller.completions - a.seller.completions);
        break;
      default: // relevance
        // Sort by verified status, then rating, then completions
        results.sort((a, b) => {
          if (a.seller.isVerified !== b.seller.isVerified) {
            return b.seller.isVerified ? 1 : -1;
          }
          if (a.seller.rating !== b.seller.rating) {
            return b.seller.rating - a.seller.rating;
          }
          return b.seller.completions - a.seller.completions;
        });
    }

    return results;
  }, [filters, mockResults]);

  const addLanguage = () => {
    if (currentLanguage && !filters.languages.includes(currentLanguage)) {
      setFilters(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage]
      }));
      setCurrentLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== language)
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      priceRange: { min: '', max: '' },
      rating: '',
      verifiedOnly: false,
      responseTime: '',
      availability: '',
      sortBy: 'relevance',
      experienceLevel: '',
      languages: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return value !== '';
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.values(value).some(v => v !== '');
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Advanced Search
          </h2>
          <p className="text-gray-400">Find exactly what you're looking for with powerful filters</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for services, skills, memories, or people..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-black/30 text-gray-300 border-gray-600 hover:border-cyan-500/50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1">
                  {Object.values(filters).filter(v => 
                    (typeof v === 'string' && v !== '') ||
                    (typeof v === 'boolean' && v) ||
                    (Array.isArray(v) && v.length > 0) ||
                    (typeof v === 'object' && Object.values(v).some(val => val !== ''))
                  ).length}
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, region, or 'Remote'"
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Price Range (£)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, min: e.target.value }
                    }))}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, max: e.target.value }
                    }))}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Response Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Response Time
                </label>
                <select
                  value={filters.responseTime}
                  onChange={(e) => setFilters(prev => ({ ...prev, responseTime: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">Any Response Time</option>
                  <option value="fast">Fast (within 1 hour)</option>
                  <option value="medium">Medium (within 4 hours)</option>
                  <option value="slow">Slow (within 24 hours)</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available Now</option>
                  <option value="urgent">Urgent Requests</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Experience Level
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">Any Experience</option>
                  <option value="beginner">Beginner (0-9 completions)</option>
                  <option value="experienced">Experienced (10-49 completions)</option>
                  <option value="expert">Expert (50+ completions)</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Members</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>

            {/* Languages */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Languages</label>
              <div className="flex gap-2 mb-2">
                <select
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="">Select a language</option>
                  {languages.filter(lang => !filters.languages.includes(lang)).map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
                <button
                  onClick={addLanguage}
                  disabled={!currentLanguage}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              {filters.languages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.languages.map((language, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                      {language}
                      <button
                        onClick={() => removeLanguage(language)}
                        className="ml-2 text-purple-400 hover:text-purple-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Only Toggle */}
            <div className="mt-4 flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <div>
                  <h5 className="text-white font-medium text-sm">Verified Users Only</h5>
                  <p className="text-xs text-gray-400">Show only identity-verified providers</p>
                </div>
              </div>
              <button
                onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  filters.verifiedOnly ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    filters.verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Search Results ({filteredResults.length})
          </h3>
          <div className="text-sm text-gray-400">
            {filters.query && `Results for "${filters.query}"`}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map(result => (
              <div
                key={result.id}
                className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 overflow-hidden transition-all duration-200 hover:transform hover:scale-105"
              >
                {/* Preview Image */}
                {result.previewUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={result.previewUrl}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        result.type === 'voucher' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        result.type === 'memory' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                      </span>
                    </div>

                    {/* Urgency Badge */}
                    {result.urgency && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          🔥 Urgent
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Title & Price */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white flex-1 mr-2">{result.title}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-cyan-400">
                        £{result.price}
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.type === 'voucher' ? '/hr' : 'one-time'}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{result.description}</p>

                  {/* Seller Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      {result.seller.avatar_url ? (
                        <img
                          src={result.seller.avatar_url}
                          alt={result.seller.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {result.seller.username.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{result.seller.username}</div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {result.seller.rating.toFixed(1)} ({result.seller.completions})
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mb-4">
                    <TrustBadges 
                      profile={{
                        isVerified: result.seller.isVerified,
                        rating: result.seller.rating,
                        completions: result.seller.completions,
                        responseTime: result.seller.responseTime,
                        memberSince: result.seller.memberSince
                      }}
                      size="small"
                    />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {result.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                        +{result.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {result.location}
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
                    {result.type === 'voucher' ? 'Book Service' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;