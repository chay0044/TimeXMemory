import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, EyeOff, Gavel, Image, Video, Clock, DollarSign, Combine, Users, CreditCard, MapPin, Calendar, Tag, Shield, SlidersHorizontal } from 'lucide-react';
import MemoryUploader from './MemoryUploader';

interface Memory {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'album' | 'post';
  category: string;
  ageRating: 'all' | '13+' | '16+' | '18+';
  accessType?: 'public' | 'private' | 'shared';
  saleType?: 'auction' | 'one-time-purchase' | 'subscription';
  reservePrice?: number;
  oneTimePrice?: number;
  subscriptionPrice?: number;
  subscriptionInterval?: 'monthly' | 'yearly';
  currentBid: number;
  bidCount: number;
  timeLeft: string;
  sellerName: string;
  isAnonymous: boolean;
  previewUrl: string;
  collaborators?: string[];
  location?: string;
  dateCreated: string;
  tags: string[];
  views: number;
  likes: number;
}

const MemoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAgeRating, setSelectedAgeRating] = useState('');
  const [selectedSaleType, setSelectedSaleType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Art & Photography', 'Travel & Adventure', 'Family & Friends', 'Food & Cooking',
    'Sports & Fitness', 'Music & Entertainment', 'Nature & Wildlife', 'Education & Learning',
    'Technology & Gaming', 'Fashion & Style', 'Home & Garden', 'Pets & Animals',
    'Business & Career', 'Health & Wellness', 'Celebrations & Events', 'Other'
  ];

  const ageRatings = [
    { value: 'all', label: 'All Ages', icon: '👶' },
    { value: '13+', label: '13+', icon: '🧒' },
    { value: '16+', label: '16+', icon: '👦' },
    { value: '18+', label: '18+', icon: '🔞' }
  ];

  // Mock data with enhanced properties
  const memories: Memory[] = [
    {
      id: '1',
      title: 'Sunset from my balcony',
      description: 'Incredible sunset I captured from my London apartment',
      type: 'image',
      category: 'Art & Photography',
      ageRating: 'all',
      saleType: 'auction',
      reservePrice: 25,
      currentBid: 42,
      bidCount: 7,
      timeLeft: '2h 34m',
      sellerName: 'Alex Kim',
      isAnonymous: false,
      previewUrl: 'https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'London, UK',
      dateCreated: '2024-12-15',
      tags: ['sunset', 'cityscape', 'photography', 'london'],
      views: 234,
      likes: 18,
    },
    {
      id: '2',
      title: 'My dog\'s first snow experience',
      description: 'The pure joy on his face was absolutely magical to witness',
      type: 'video',
      category: 'Pets & Animals',
      ageRating: 'all',
      saleType: 'one-time-purchase',
      oneTimePrice: 15,
      currentBid: 15,
      bidCount: 0,
      timeLeft: 'Buy Now',
      sellerName: 'Anonymous',
      isAnonymous: true,
      previewUrl: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Manchester, UK',
      dateCreated: '2024-12-10',
      tags: ['dog', 'snow', 'winter', 'pets', 'joy'],
      views: 156,
      likes: 23,
    },
    {
      id: '3',
      title: 'College graduation moment',
      description: 'The exact moment I realized I made it through university',
      type: 'image',
      category: 'Education & Learning',
      ageRating: '13+',
      saleType: 'subscription',
      subscriptionPrice: 5,
      subscriptionInterval: 'monthly',
      currentBid: 5,
      bidCount: 12,
      timeLeft: 'Subscribe',
      sellerName: 'Anonymous',
      isAnonymous: true,
      previewUrl: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Cambridge, UK',
      dateCreated: '2024-12-08',
      tags: ['graduation', 'education', 'achievement', 'university'],
      views: 89,
      likes: 12,
    },
    {
      id: '4',
      title: 'London Adventures Album',
      description: 'A collaborative collection of London moments from multiple friends',
      type: 'album',
      category: 'Travel & Adventure',
      ageRating: 'all',
      accessType: 'shared',
      saleType: 'auction',
      reservePrice: 75,
      currentBid: 125,
      bidCount: 8,
      timeLeft: '6h 22m',
      sellerName: 'Sarah Chen',
      isAnonymous: false,
      previewUrl: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800',
      collaborators: ['Sarah Chen', 'Alex Kim', 'Tom Wilson'],
      location: 'London, UK',
      dateCreated: '2024-12-05',
      tags: ['london', 'travel', 'friends', 'collaboration'],
      views: 445,
      likes: 67,
    },
    {
      id: '5',
      title: 'Weekend cooking adventures',
      description: 'Sharing my culinary experiments and recipe discoveries',
      type: 'post',
      category: 'Food & Cooking',
      ageRating: 'all',
      saleType: 'subscription',
      subscriptionPrice: 8,
      subscriptionInterval: 'monthly',
      currentBid: 8,
      bidCount: 15,
      timeLeft: 'Subscribe',
      sellerName: 'Chef Maria',
      isAnonymous: false,
      previewUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Birmingham, UK',
      dateCreated: '2024-12-12',
      tags: ['cooking', 'recipes', 'food', 'weekend'],
      views: 312,
      likes: 45,
    },
    {
      id: '6',
      title: 'Late night gaming sessions',
      description: 'Epic gaming moments and strategies (mature content)',
      type: 'video',
      category: 'Technology & Gaming',
      ageRating: '18+',
      saleType: 'one-time-purchase',
      oneTimePrice: 20,
      currentBid: 20,
      bidCount: 0,
      timeLeft: 'Buy Now',
      sellerName: 'GameMaster',
      isAnonymous: false,
      previewUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      location: 'Remote',
      dateCreated: '2024-12-14',
      tags: ['gaming', 'strategy', 'entertainment', 'mature'],
      views: 178,
      likes: 29,
    },
  ];

  const filteredAndSortedMemories = useMemo(() => {
    let filtered = memories.filter(memory => {
      const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          memory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          memory.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || memory.category === selectedCategory;
      const matchesType = !selectedType || memory.type === selectedType;
      const matchesAgeRating = !selectedAgeRating || memory.ageRating === selectedAgeRating;
      const matchesSaleType = !selectedSaleType || memory.saleType === selectedSaleType;
      
      const price = memory.saleType === 'subscription' ? memory.subscriptionPrice :
                   memory.saleType === 'one-time-purchase' ? memory.oneTimePrice :
                   memory.currentBid;
      
      const matchesPriceMin = !priceRange.min || (price && price >= Number(priceRange.min));
      const matchesPriceMax = !priceRange.max || (price && price <= Number(priceRange.max));
      
      return matchesSearch && matchesCategory && matchesType && matchesAgeRating && 
             matchesSaleType && matchesPriceMin && matchesPriceMax;
    });

    // Sort by selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'oldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case 'price-low':
          const priceA = a.saleType === 'subscription' ? a.subscriptionPrice :
                        a.saleType === 'one-time-purchase' ? a.oneTimePrice : a.currentBid;
          const priceB = b.saleType === 'subscription' ? b.subscriptionPrice :
                        b.saleType === 'one-time-purchase' ? b.oneTimePrice : b.currentBid;
          return (priceA || 0) - (priceB || 0);
        case 'price-high':
          const priceA2 = a.saleType === 'subscription' ? a.subscriptionPrice :
                         a.saleType === 'one-time-purchase' ? a.oneTimePrice : a.currentBid;
          const priceB2 = b.saleType === 'subscription' ? b.subscriptionPrice :
                         b.saleType === 'one-time-purchase' ? b.oneTimePrice : b.currentBid;
          return (priceB2 || 0) - (priceA2 || 0);
        case 'popular':
          return (b.views + b.likes) - (a.views + a.likes);
        case 'ending-soon':
          if (a.saleType === 'auction' && b.saleType === 'auction') {
            return a.timeLeft.localeCompare(b.timeLeft);
          }
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [memories, searchTerm, selectedCategory, selectedType, selectedAgeRating, selectedSaleType, priceRange, sortBy]);

  const handlePurchase = (memory: Memory) => {
    if (memory.saleType === 'auction') {
      const bidAmount = prompt(`Place your bid (current: £${memory.currentBid})`);
      if (bidAmount && Number(bidAmount) > memory.currentBid) {
        alert(`🎉 Bid placed successfully! You're now the highest bidder at £${bidAmount}.`);
      } else if (bidAmount) {
        alert('⚠️ Your bid must be higher than the current bid.');
      }
    } else if (memory.saleType === 'one-time-purchase') {
      const price = memory.oneTimePrice || memory.currentBid;
      alert(`💳 Purchase confirmed! You now own "${memory.title}" for £${price}.`);
    } else if (memory.saleType === 'subscription') {
      const price = memory.subscriptionPrice || memory.currentBid;
      const interval = memory.subscriptionInterval || 'monthly';
      alert(`⏰ Subscription activated! You'll be charged £${price} ${interval} for access to "${memory.title}".`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-3 h-3" />;
      case 'album': return <Combine className="w-3 h-3" />;
      case 'post': return <Users className="w-3 h-3" />;
      default: return <Image className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'album': return 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30';
      case 'post': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  const getSaleTypeIcon = (saleType?: string) => {
    switch (saleType) {
      case 'subscription': return <Clock className="w-3 h-3" />;
      case 'one-time-purchase': return <CreditCard className="w-3 h-3" />;
      default: return <Gavel className="w-3 h-3" />;
    }
  };

  const getSaleTypeColor = (saleType?: string) => {
    switch (saleType) {
      case 'subscription': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'one-time-purchase': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    }
  };

  const getButtonText = (memory: Memory) => {
    switch (memory.saleType) {
      case 'subscription': return 'Subscribe';
      case 'one-time-purchase': return 'Buy Now';
      default: return 'Place Bid';
    }
  };

  const getPriceDisplay = (memory: Memory) => {
    switch (memory.saleType) {
      case 'subscription':
        return `£${memory.subscriptionPrice || memory.currentBid}/${memory.subscriptionInterval || 'month'}`;
      case 'one-time-purchase':
        return `£${memory.oneTimePrice || memory.currentBid}`;
      default:
        return `£${memory.currentBid}`;
    }
  };

  const getAgeRatingBadge = (ageRating: string) => {
    const rating = ageRatings.find(r => r.value === ageRating);
    return rating ? `${rating.icon} ${rating.label}` : ageRating;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedAgeRating('');
    setSelectedSaleType('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Memory Hub
        </h2>
        <p className="text-gray-400">Discover, share, and trade precious moments with flexible content types and pricing</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-black/20 backdrop-blur-md rounded-lg border border-cyan-500/20 p-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'browse'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Browse Memories
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Create & Upload
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search memories, tags, creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
                    showFilters 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-black/30 text-gray-300 border-gray-600 hover:border-cyan-500/50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
                {(selectedCategory || selectedType || selectedAgeRating || selectedSaleType || priceRange.min || priceRange.max) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-4 border-t border-gray-700">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  >
                    <option value="">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="album">Albums</option>
                    <option value="post">Posts</option>
                  </select>
                </div>

                {/* Age Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Age Rating</label>
                  <select
                    value={selectedAgeRating}
                    onChange={(e) => setSelectedAgeRating(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  >
                    <option value="">All Ages</option>
                    {ageRatings.map(rating => (
                      <option key={rating.value} value={rating.value}>
                        {rating.icon} {rating.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sale Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sale Type</label>
                  <select
                    value={selectedSaleType}
                    onChange={(e) => setSelectedSaleType(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  >
                    <option value="">All Types</option>
                    <option value="auction">Auction</option>
                    <option value="one-time-purchase">Buy Now</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Price £</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Price £</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing {filteredAndSortedMemories.length} of {memories.length} memories
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending-soon">Ending Soon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedMemories.map(memory => (
              <div
                key={memory.id}
                className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 overflow-hidden transition-all duration-200 hover:transform hover:scale-105"
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={memory.previewUrl}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Type and Sale Type badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(memory.type)}`}>
                      {getTypeIcon(memory.type)}
                      <span className="ml-1 capitalize">{memory.type}</span>
                    </span>
                    
                    {memory.saleType && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSaleTypeColor(memory.saleType)}`}>
                        {getSaleTypeIcon(memory.saleType)}
                        <span className="ml-1">
                          {memory.saleType === 'one-time-purchase' ? 'Buy' : 
                           memory.saleType === 'subscription' ? 'Sub' : 'Auction'}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Age Rating */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/20">
                      <Shield className="w-3 h-3 mr-1" />
                      {getAgeRatingBadge(memory.ageRating)}
                    </span>
                  </div>

                  {/* Time/Status indicator */}
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/20">
                      <Clock className="w-3 h-3 mr-1" />
                      {memory.timeLeft}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                      👁️ {memory.views}
                    </span>
                    <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                      ❤️ {memory.likes}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Title & Seller */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1">{memory.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        {memory.isAnonymous ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            <span>Anonymous</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            <span>{memory.sellerName}</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{memory.category}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{memory.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {memory.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                    {memory.tags.length > 3 && (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                        +{memory.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Location & Date */}
                  {(memory.location || memory.dateCreated) && (
                    <div className="space-y-1 mb-4 text-xs text-gray-400">
                      {memory.location && (
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {memory.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(memory.dateCreated).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Collaborators for albums */}
                  {memory.collaborators && memory.collaborators.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-1">Collaborators:</div>
                      <div className="flex flex-wrap gap-1">
                        {memory.collaborators.slice(0, 3).map((collaborator, index) => (
                          <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {collaborator}
                          </span>
                        ))}
                        {memory.collaborators.length > 3 && (
                          <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded">
                            +{memory.collaborators.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing Info */}
                  <div className="space-y-2 mb-4">
                    {memory.saleType === 'auction' && memory.reservePrice && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Reserve:</span>
                        <span className="text-sm text-gray-300">£{memory.reservePrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        {memory.saleType === 'auction' ? 'Current Bid:' : 'Price:'}
                      </span>
                      <span className="text-lg font-bold text-cyan-400">
                        {getPriceDisplay(memory)}
                      </span>
                    </div>
                    {memory.saleType === 'auction' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Bids:</span>
                        <span className="text-sm text-gray-300">{memory.bidCount} bids</span>
                      </div>
                    )}
                    {memory.saleType === 'subscription' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Subscribers:</span>
                        <span className="text-sm text-gray-300">{memory.bidCount} active</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePurchase(memory)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                  >
                    {getSaleTypeIcon(memory.saleType)}
                    <span>{getButtonText(memory)}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedMemories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No memories found</h3>
              <p className="text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      ) : (
        /* Upload/Create Section */
        <MemoryUploader />
      )}
    </div>
  );
};

export default MemoryHub;