import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MoreVertical, Shield, Award, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getReviews, createReview, checkReviewEligibility, getListings, Review } from '../lib/supabase';
import TrustBadges from './TrustBadges';

interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  wouldRecommend: boolean;
  currentPro: string;
  currentCon: string;
  selectedListing: string;
}

const ReviewSystem: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'write'>('browse');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterVerified, setFilterVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibleListings, setEligibleListings] = useState<any[]>([]);
  
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    content: '',
    pros: [],
    cons: [],
    wouldRecommend: true,
    currentPro: '',
    currentCon: '',
    selectedListing: '',
  });

  useEffect(() => {
    fetchReviews();
    if (user && activeTab === 'write') {
      fetchEligibleListings();
    }
  }, [user, activeTab, selectedRating, sortBy, filterVerified]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getReviews({
        verifiedOnly: filterVerified,
        minRating: selectedRating || undefined,
      });

      if (fetchError) throw fetchError;

      let sortedReviews = data || [];
      
      // Sort reviews
      sortedReviews.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          case 'rating-high':
            return b.rating - a.rating;
          case 'rating-low':
            return a.rating - b.rating;
          case 'helpful':
            return (b.helpful_votes || 0) / Math.max(b.total_votes || 1, 1) - (a.helpful_votes || 0) / Math.max(a.total_votes || 1, 1);
          default: // newest
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        }
      });

      setReviews(sortedReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleListings = async () => {
    if (!user) return;

    try {
      // Get all listings and check eligibility for each
      const { data: allListings, error } = await getListings({ status: 'active' });
      
      if (error) throw error;

      const eligible = [];
      for (const listing of allListings || []) {
        const { eligible: isEligible } = await checkReviewEligibility(user.id, listing.id);
        if (isEligible) {
          eligible.push(listing);
        }
      }

      setEligibleListings(eligible);
    } catch (err: any) {
      console.error('Error fetching eligible listings:', err);
    }
  };

  const addPro = () => {
    if (reviewForm.currentPro.trim() && !reviewForm.pros.includes(reviewForm.currentPro.trim())) {
      setReviewForm(prev => ({
        ...prev,
        pros: [...prev.pros, prev.currentPro.trim()],
        currentPro: ''
      }));
    }
  };

  const addCon = () => {
    if (reviewForm.currentCon.trim() && !reviewForm.cons.includes(reviewForm.currentCon.trim())) {
      setReviewForm(prev => ({
        ...prev,
        cons: [...prev.cons, prev.currentCon.trim()],
        currentCon: ''
      }));
    }
  };

  const removePro = (pro: string) => {
    setReviewForm(prev => ({
      ...prev,
      pros: prev.pros.filter(p => p !== pro)
    }));
  };

  const removeCon = (con: string) => {
    setReviewForm(prev => ({
      ...prev,
      cons: prev.cons.filter(c => c !== con)
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to write reviews');
      return;
    }

    if (reviewForm.rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      setError('Please fill in the title and review content');
      return;
    }

    if (!reviewForm.selectedListing) {
      setError('Please select a service to review');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        reviewer_id: user.id,
        target_id: reviewForm.selectedListing,
        target_type: 'listing' as const,
        listing_id: reviewForm.selectedListing,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim(),
        pros: reviewForm.pros,
        cons: reviewForm.cons,
        would_recommend: reviewForm.wouldRecommend,
        service_date: new Date().toISOString().split('T')[0],
      };

      const { data, error: createError } = await createReview(reviewData);

      if (createError) throw createError;

      // Reset form
      setReviewForm({
        rating: 0,
        title: '',
        content: '',
        pros: [],
        cons: [],
        wouldRecommend: true,
        currentPro: '',
        currentCon: '',
        selectedListing: '',
      });
      
      setActiveTab('browse');
      fetchReviews(); // Refresh reviews list
      
      alert('✅ Review submitted successfully!');
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <ThumbsUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">You need to be signed in to view and write reviews.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Reviews & Ratings
        </h2>
        <p className="text-gray-400">Share your experiences and help others make informed decisions</p>
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
            Browse Reviews
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`px-6 py-3 rounded-md transition-all duration-200 ${
              activeTab === 'write'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Write Review
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-8">
          {/* Rating Overview */}
          {reviews.length > 0 && (
            <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-cyan-400 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <p className="text-gray-400">Based on {reviews.length} reviews</p>
                  <div className="mt-4 text-sm text-gray-400">
                    {Math.round((reviews.filter(r => r.verified_purchase).length / reviews.length) * 100)}% verified purchases
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm text-gray-300">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Filter by rating:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedRating(null)}
                    className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                      selectedRating === null
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
                        selectedRating === rating
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-300">Verified only</span>
                  <Shield className="w-4 h-4 text-green-400" />
                </label>
              </div>

              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating-high">Highest Rated</option>
                  <option value="rating-low">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading reviews...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Reviews List */}
          {!loading && !error && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <ThumbsUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No reviews yet</h3>
                  <p className="text-gray-400">Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                          {review.profiles?.avatar_url ? (
                            <img
                              src={review.profiles.avatar_url}
                              alt={review.profiles.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {review.profiles?.username?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-white">{review.profiles?.username || 'Anonymous'}</h4>
                            {review.profiles && (
                              <TrustBadges 
                                profile={{
                                  isVerified: true,
                                  rating: review.profiles.rating,
                                  completions: review.profiles.completions
                                }}
                                size="small"
                                showLabels={false}
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>{formatDate(review.created_at || '')}</span>
                            {review.verified_purchase && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1 text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Verified Purchase</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <button className="p-1 text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <h5 className="font-medium text-white mb-2">{review.title}</h5>
                      <p className="text-gray-300 leading-relaxed">{review.content}</p>
                    </div>

                    {/* Pros and Cons */}
                    {((review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {review.pros && review.pros.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Pros
                            </h6>
                            <ul className="space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="text-sm text-gray-300 flex items-start">
                                  <span className="text-green-400 mr-2">+</span>
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons && review.cons.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              Cons
                            </h6>
                            <ul className="space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="text-sm text-gray-300 flex items-start">
                                  <span className="text-red-400 mr-2">-</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendation */}
                    {review.would_recommend && (
                      <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center text-green-300 text-sm">
                          <Award className="w-4 h-4 mr-2" />
                          Would recommend this service
                        </div>
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors duration-200">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">Helpful ({review.helpful_votes || 0})</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors duration-200">
                          <Flag className="w-4 h-4" />
                          <span className="text-sm">Report</span>
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {review.helpful_votes || 0} of {review.total_votes || 0} found this helpful
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        /* Write Review Form */
        <div className="max-w-3xl mx-auto">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Write a Review</h3>
            
            {eligibleListings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">No Eligible Services</h4>
                <p className="text-gray-400 mb-4">
                  You can only write reviews for services you've purchased, subscribed to, or collaborated on.
                </p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
                >
                  Browse Reviews
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Service to Review *
                  </label>
                  <select
                    value={reviewForm.selectedListing}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, selectedListing: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    required
                  >
                    <option value="">Choose a service you've used...</option>
                    {eligibleListings.map(listing => (
                      <option key={listing.id} value={listing.id}>
                        {listing.item_type === 'voucher' ? '🎫' : listing.item_type === 'memory' ? '📸' : '📚'} 
                        {' '}{listing.profiles?.username || 'Anonymous'} - {listing.item_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center space-x-2">
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm(prev => ({ ...prev, rating }))
                    )}
                    <span className="text-gray-400 ml-4">
                      {reviewForm.rating > 0 && (
                        <>
                          {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''} - 
                          {reviewForm.rating === 5 ? ' Excellent' :
                           reviewForm.rating === 4 ? ' Good' :
                           reviewForm.rating === 3 ? ' Average' :
                           reviewForm.rating === 2 ? ' Poor' : ' Terrible'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience..."
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Review *
                  </label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your experience in detail. What went well? What could be improved?"
                    rows={5}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
                    required
                  />
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What went well?
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={reviewForm.currentPro}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, currentPro: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                        placeholder="Add a positive point..."
                        className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addPro}
                        className="px-3 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                    {reviewForm.pros.length > 0 && (
                      <div className="space-y-1">
                        {reviewForm.pros.map((pro, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-500/10 px-3 py-2 rounded border border-green-500/20">
                            <span className="text-green-300 text-sm">{pro}</span>
                            <button
                              type="button"
                              onClick={() => removePro(pro)}
                              className="text-green-400 hover:text-green-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      What could be improved?
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={reviewForm.currentCon}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, currentCon: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                        placeholder="Add an improvement point..."
                        className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addCon}
                        className="px-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors duration-200"
                      >
                        Add
                      </button>
                    </div>
                    {reviewForm.cons.length > 0 && (
                      <div className="space-y-1">
                        {reviewForm.cons.map((con, index) => (
                          <div key={index} className="flex items-center justify-between bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                            <span className="text-red-300 text-sm">{con}</span>
                            <button
                              type="button"
                              onClick={() => removeCon(con)}
                              className="text-red-400 hover:text-red-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <div>
                    <h5 className="text-white font-medium text-sm">Would you recommend this service?</h5>
                    <p className="text-xs text-gray-400">Help others make informed decisions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewForm(prev => ({ ...prev, wouldRecommend: !prev.wouldRecommend }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      reviewForm.wouldRecommend ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        reviewForm.wouldRecommend ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('browse')}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;