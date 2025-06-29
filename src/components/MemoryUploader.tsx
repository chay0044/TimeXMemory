import React, { useState } from 'react';
import { Upload, Image, Video, Combine, Users, Eye, EyeOff, DollarSign, Clock, CreditCard, MapPin, Calendar, Tag, Shield, FileText, Plus, X } from 'lucide-react';

interface UploadForm {
  type: 'single' | 'album' | 'post';
  title: string;
  description: string;
  category: string;
  ageRating: 'all' | '13+' | '16+' | '18+';
  tags: string[];
  location: string;
  dateCapture: string;
  saleType: 'auction' | 'one-time-purchase' | 'subscription';
  reservePrice: number;
  oneTimePrice: number;
  subscriptionPrice: number;
  subscriptionInterval: 'monthly' | 'yearly';
  isAnonymous: boolean;
  accessType: 'public' | 'private' | 'shared';
  collaboratorEmails: string[];
}

const MemoryUploader: React.FC = () => {
  const [currentTag, setCurrentTag] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    type: 'single',
    title: '',
    description: '',
    category: '',
    ageRating: 'all',
    tags: [],
    location: '',
    dateCapture: '',
    saleType: 'auction',
    reservePrice: 0,
    oneTimePrice: 0,
    subscriptionPrice: 0,
    subscriptionInterval: 'monthly',
    isAnonymous: true,
    accessType: 'public',
    collaboratorEmails: [],
  });

  const categories = [
    'Art & Photography', 'Travel & Adventure', 'Family & Friends', 'Food & Cooking',
    'Sports & Fitness', 'Music & Entertainment', 'Nature & Wildlife', 'Education & Learning',
    'Technology & Gaming', 'Fashion & Style', 'Home & Garden', 'Pets & Animals',
    'Business & Career', 'Health & Wellness', 'Celebrations & Events', 'Other'
  ];

  const ageRatings = [
    { value: 'all', label: 'All Ages', icon: '👶', description: 'Suitable for everyone' },
    { value: '13+', label: '13+', icon: '🧒', description: 'May contain mild content' },
    { value: '16+', label: '16+', icon: '👦', description: 'May contain mature themes' },
    { value: '18+', label: '18+', icon: '🔞', description: 'Adult content only' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const typeText = uploadForm.type === 'single' ? 'memory' : 
                    uploadForm.type === 'album' ? 'album' : 'post';
    
    const saleTypeText = uploadForm.saleType === 'subscription' ? 'subscription-based' :
                        uploadForm.saleType === 'one-time-purchase' ? 'one-time purchase' : 'auction';
    
    alert(`🎨 ${typeText} "${uploadForm.title}" created successfully! It will be available as a ${saleTypeText} once approved.`);
    
    // Reset form
    setUploadForm({
      type: 'single',
      title: '',
      description: '',
      category: '',
      ageRating: 'all',
      tags: [],
      location: '',
      dateCapture: '',
      saleType: 'auction',
      reservePrice: 0,
      oneTimePrice: 0,
      subscriptionPrice: 0,
      subscriptionInterval: 'monthly',
      isAnonymous: true,
      accessType: 'public',
      collaboratorEmails: [],
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !uploadForm.tags.includes(currentTag.trim().toLowerCase())) {
      setUploadForm({
        ...uploadForm,
        tags: [...uploadForm.tags, currentTag.trim().toLowerCase()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadForm({
      ...uploadForm,
      tags: uploadForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addCollaborator = () => {
    if (currentEmail.trim() && !uploadForm.collaboratorEmails.includes(currentEmail.trim())) {
      setUploadForm({
        ...uploadForm,
        collaboratorEmails: [...uploadForm.collaboratorEmails, currentEmail.trim()]
      });
      setCurrentEmail('');
    }
  };

  const removeCollaborator = (emailToRemove: string) => {
    setUploadForm({
      ...uploadForm,
      collaboratorEmails: uploadForm.collaboratorEmails.filter(email => email !== emailToRemove)
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'album': return <Combine className="w-5 h-5" />;
      case 'post': return <FileText className="w-5 h-5" />;
      default: return <Image className="w-5 h-5" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'single': return 'Upload a single image or video memory';
      case 'album': return 'Create a collection of memories with collaboration features';
      case 'post': return 'Share a story with multiple media attachments and discussion';
      default: return '';
    }
  };

  const isFormValid = uploadForm.title && uploadForm.category && uploadForm.ageRating;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Create & Upload</h3>
          <p className="text-gray-400">Share your memories, create albums, or start discussions with flexible content types</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              What would you like to create?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'single', label: 'Single Memory', icon: 'single' },
                { value: 'album', label: 'Album Collection', icon: 'album' },
                { value: 'post', label: 'Discussion Post', icon: 'post' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUploadForm({...uploadForm, type: type.value as any})}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    uploadForm.type === type.value
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-600 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                      uploadForm.type === type.value
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {getTypeIcon(type.icon)}
                    </div>
                    <h4 className="font-medium text-white mb-1">{type.label}</h4>
                    <p className="text-xs text-gray-400">{getTypeDescription(type.value)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {uploadForm.type === 'post' ? 'Attachments (Optional)' : 'Upload Files'}
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-500 transition-colors duration-200">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2">
                    {uploadForm.type === 'album' ? 'Upload multiple files for your album' :
                     uploadForm.type === 'post' ? 'Add images or videos to your post' :
                     'Upload your memory file'}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Supports: JPG, PNG, GIF, MP4, MOV (Max 100MB each)
                  </p>
                  <input type="file" multiple={uploadForm.type !== 'single'} accept="image/*,video/*" className="hidden" />
                  <button type="button" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
                    Choose Files
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder={
                    uploadForm.type === 'album' ? 'My Amazing Adventure Album' :
                    uploadForm.type === 'post' ? 'Share your thoughts...' :
                    'Give your memory a meaningful title...'
                  }
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder={
                    uploadForm.type === 'album' ? 'Tell the story behind this collection...' :
                    uploadForm.type === 'post' ? 'Start a discussion, share your thoughts...' :
                    'Tell the story behind this memory...'
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {uploadForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadForm.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-400 hover:text-purple-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={uploadForm.location}
                    onChange={(e) => setUploadForm({...uploadForm, location: e.target.value})}
                    placeholder="Where was this captured?"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date Captured
                  </label>
                  <input
                    type="date"
                    value={uploadForm.dateCapture}
                    onChange={(e) => setUploadForm({...uploadForm, dateCapture: e.target.value})}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Settings & Pricing */}
            <div className="space-y-6">
              {/* Age Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Age Rating *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ageRatings.map((rating) => (
                    <button
                      key={rating.value}
                      type="button"
                      onClick={() => setUploadForm({...uploadForm, ageRating: rating.value as any})}
                      className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                        uploadForm.ageRating === rating.value
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-600 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="text-lg mr-2">{rating.icon}</span>
                        <span className="font-medium text-white">{rating.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{rating.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Type (for albums) */}
              {uploadForm.type === 'album' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Access Type
                  </label>
                  <select
                    value={uploadForm.accessType}
                    onChange={(e) => setUploadForm({...uploadForm, accessType: e.target.value as any})}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  >
                    <option value="public">👁️ Public - Anyone can view</option>
                    <option value="private">🔒 Private - Only you</option>
                    <option value="shared">👥 Shared - Collaborative</option>
                  </select>
                </div>
              )}

              {/* Collaborators (for shared albums) */}
              {uploadForm.type === 'album' && uploadForm.accessType === 'shared' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invite Collaborators
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setCurrentEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={addCollaborator}
                      className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {uploadForm.collaboratorEmails.length > 0 && (
                    <div className="space-y-1">
                      {uploadForm.collaboratorEmails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-black/30 px-3 py-2 rounded text-sm">
                          <span className="text-gray-300">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeCollaborator(email)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sale Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sale Model
                </label>
                <select
                  value={uploadForm.saleType}
                  onChange={(e) => setUploadForm({...uploadForm, saleType: e.target.value as any})}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="auction">🔨 Auction - Bidding system</option>
                  <option value="one-time-purchase">💳 One-time Purchase</option>
                  <option value="subscription">⏰ Subscription Access</option>
                </select>
              </div>

              {/* Pricing based on sale type */}
              {uploadForm.saleType === 'auction' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Reserve Price (£)
                  </label>
                  <input
                    type="number"
                    value={uploadForm.reservePrice}
                    onChange={(e) => setUploadForm({...uploadForm, reservePrice: Number(e.target.value)})}
                    placeholder="10"
                    min="1"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              )}

              {uploadForm.saleType === 'one-time-purchase' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Purchase Price (£)
                  </label>
                  <input
                    type="number"
                    value={uploadForm.oneTimePrice}
                    onChange={(e) => setUploadForm({...uploadForm, oneTimePrice: Number(e.target.value)})}
                    placeholder="25"
                    min="1"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              )}

              {uploadForm.saleType === 'subscription' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Subscription Price (£)
                    </label>
                    <input
                      type="number"
                      value={uploadForm.subscriptionPrice}
                      onChange={(e) => setUploadForm({...uploadForm, subscriptionPrice: Number(e.target.value)})}
                      placeholder="5"
                      min="1"
                      className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Billing Interval
                    </label>
                    <select
                      value={uploadForm.subscriptionInterval}
                      onChange={(e) => setUploadForm({...uploadForm, subscriptionInterval: e.target.value as any})}
                      className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                <div>
                  <h5 className="text-white font-medium text-sm flex items-center">
                    {uploadForm.isAnonymous ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    Anonymous Mode
                  </h5>
                  <p className="text-xs text-gray-400">Hide your identity until sold</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadForm({...uploadForm, isAnonymous: !uploadForm.isAnonymous})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    uploadForm.isAnonymous ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      uploadForm.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isFormValid
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {uploadForm.type === 'album' ? 'Create Album' : 
               uploadForm.type === 'post' ? 'Publish Post' : 
               'Upload Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemoryUploader;