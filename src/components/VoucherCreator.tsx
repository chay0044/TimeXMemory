import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, MapPin, Clock, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createVoucher, Voucher } from '../lib/supabase';

interface VoucherForm {
  skill: string;
  date_available: string;
  time_available: string;
  price: number;
  currency: string;
  location: string;
  description: string;
  expires_at: string;
  is_urgent: boolean;
}

interface VoucherCreatorProps {
  onBack?: () => void;
}

const VoucherCreator: React.FC<VoucherCreatorProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [voucher, setVoucher] = useState<VoucherForm>({
    skill: '',
    date_available: '',
    time_available: '',
    price: 0,
    currency: 'GBP',
    location: '',
    description: '',
    expires_at: '',
    is_urgent: false,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const serviceSuggestions = [
    // Professional Skills
    'Programming', 'Design', 'Writing', 'Tutoring', 'Photography',
    'Music Lessons', 'Cooking', 'Language Exchange', 'Fitness Training',
    'Consulting', 'Data Analysis', 'Marketing', 'Translation', 'Video Editing',
    'Web Development', 'Graphic Design', 'Business Consulting',
    
    // Time-Consuming Tasks
    'Queueing', 'Grocery Shopping', 'Package Delivery', 'Administrative Tasks',
    'Document Processing', 'Research Tasks', 'Data Entry', 'Online Shopping',
    'Appointment Booking', 'Phone Calls', 'Email Management', 'Form Filling',
    'Waiting Services', 'Pickup & Delivery', 'Errands', 'Virtual Assistant',
    
    // Household & Personal Services
    'Handyman', 'Pet Sitting', 'Gardening', 'Cleaning', 'House Sitting',
    'Car Washing', 'Laundry Service', 'Meal Prep', 'Organization',
    'Moving Help', 'Furniture Assembly', 'Tech Support', 'Shopping Assistant'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a voucher');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare voucher data for database
      const voucherData: Omit<Voucher, 'id' | 'created_at' | 'updated_at'> = {
        seller_id: user.id,
        skill: voucher.skill.trim(),
        description: voucher.description.trim() || null,
        date_available: voucher.date_available,
        time_available: voucher.time_available,
        price: voucher.price,
        currency: voucher.currency,
        location: voucher.location.trim(),
        expires_at: voucher.expires_at ? new Date(voucher.expires_at).toISOString() : null,
        is_urgent: voucher.is_urgent,
      };

      const { data, error: createError } = await createVoucher(voucherData);

      if (createError) {
        throw createError;
      }

      // Reset form on success
      setVoucher({
        skill: '',
        date_available: '',
        time_available: '',
        price: 0,
        currency: 'GBP',
        location: '',
        description: '',
        expires_at: '',
        is_urgent: false,
      });
      
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err: any) {
      console.error('Error creating voucher:', err);
      setError(err.message || 'Failed to create voucher. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = voucher.skill && voucher.date_available && voucher.time_available && voucher.price > 0 && voucher.location;

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate minimum expires_at date (must be after date_available)
  const minExpiresDate = voucher.date_available || today;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">You need to be signed in to create vouchers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Create Time Voucher
            </h2>
            <p className="text-gray-400">Turn your time and services into valuable assets</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-300 text-center">
              🎉 Voucher created successfully! It's now live on the marketplace.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What service are you offering? *
            </label>
            <div className="relative">
              <input
                type="text"
                value={voucher.skill}
                onChange={(e) => setVoucher({...voucher, skill: e.target.value})}
                placeholder="e.g., Programming, Queueing, Grocery Shopping, Tutoring..."
                className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                list="services"
                required
              />
              <datalist id="services">
                {serviceSuggestions.map(service => (
                  <option key={service} value={service} />
                ))}
              </datalist>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Offer professional skills, time-consuming tasks, or personal services
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Available *
              </label>
              <input
                type="date"
                value={voucher.date_available}
                onChange={(e) => setVoucher({...voucher, date_available: e.target.value})}
                min={today}
                className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time Slot *
              </label>
              <input
                type="time"
                value={voucher.time_available}
                onChange={(e) => setVoucher({...voucher, time_available: e.target.value})}
                className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Price per Hour *
            </label>
            <div className="flex">
              <select
                value={voucher.currency}
                onChange={(e) => setVoucher({...voucher, currency: e.target.value})}
                className="px-4 py-3 bg-black/30 border border-gray-600 rounded-l-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
              >
                <option value="GBP">£ GBP</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
              <input
                type="number"
                value={voucher.price || ''}
                onChange={(e) => setVoucher({...voucher, price: Number(e.target.value)})}
                placeholder="25"
                min="1"
                step="0.01"
                className="flex-1 px-4 py-3 bg-black/30 border border-l-0 border-gray-600 rounded-r-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Set competitive rates - simple tasks like queueing might be £10-15/hr, while specialized skills can be £50+/hr
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={voucher.location}
              onChange={(e) => setVoucher({...voucher, location: e.target.value})}
              placeholder="London, UK or Remote"
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Specify city for in-person tasks or "Remote" for online services
            </p>
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={voucher.expires_at}
              onChange={(e) => setVoucher({...voucher, expires_at: e.target.value})}
              min={`${minExpiresDate}T00:00`}
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty for no expiration. If set, voucher will automatically expire at this time.
            </p>
          </div>

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
              <div>
                <h5 className="text-white font-medium text-sm">Mark as Urgent</h5>
                <p className="text-xs text-gray-400">Urgent vouchers get priority visibility and higher rates</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVoucher({...voucher, is_urgent: !voucher.is_urgent})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                voucher.is_urgent ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  voucher.is_urgent ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={voucher.description}
              onChange={(e) => setVoucher({...voucher, description: e.target.value})}
              placeholder="Describe what you'll do, any requirements, or special conditions..."
              rows={3}
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              For tasks like queueing, mention what you'll queue for and any special instructions
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isCreating}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isFormValid && !isCreating
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg hover:shadow-cyan-500/25'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Voucher...</span>
              </div>
            ) : (
              'List on Marketplace'
            )}
          </button>

          {/* Preview */}
          {isFormValid && (
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
              <h4 className="text-sm font-medium text-cyan-300 mb-2 flex items-center">
                Preview:
                {voucher.is_urgent && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    🔥 Urgent
                  </span>
                )}
              </h4>
              <div className="text-sm text-gray-300">
                <p><strong>{voucher.skill}</strong> • {voucher.currency === 'GBP' ? '£' : voucher.currency === 'USD' ? '$' : '€'}{voucher.price}/hr</p>
                <p>{voucher.date_available} at {voucher.time_available} • {voucher.location}</p>
                {voucher.expires_at && (
                  <p className="text-orange-300">Expires: {new Date(voucher.expires_at).toLocaleString()}</p>
                )}
                {voucher.description && <p className="mt-1 text-gray-400">{voucher.description}</p>}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VoucherCreator;