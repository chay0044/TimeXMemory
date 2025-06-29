import React, { useState, useRef } from 'react';
import { User, Camera, Save, Mail, MapPin, Calendar, Star, Shield, Upload, X, Check, AlertCircle, Phone, Globe, Briefcase, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProfileForm {
  username: string;
  email: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  profession: string;
  skills: string[];
  languages: string[];
  dateOfBirth: string;
  isVerified: boolean;
  verificationDocuments: File[];
}

const ProfileEditor: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [verificationStep, setVerificationStep] = useState<'none' | 'documents' | 'pending' | 'verified'>('none');
  
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    username: profile?.username || '',
    email: profile?.email || '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    profession: '',
    skills: [],
    languages: [],
    dateOfBirth: '',
    isVerified: false,
    verificationDocuments: [],
  });

  const skillSuggestions = [
    'Programming', 'Design', 'Writing', 'Photography', 'Marketing', 'Consulting',
    'Teaching', 'Translation', 'Video Editing', 'Music', 'Cooking', 'Fitness',
    'Handyman', 'Gardening', 'Pet Care', 'Cleaning', 'Delivery', 'Administrative'
  ];

  const languageSuggestions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese',
    'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Dutch', 'Swedish'
  ];

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProfileForm(prev => ({
      ...prev,
      verificationDocuments: [...prev.verificationDocuments, ...files]
    }));
  };

  const removeDocument = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      verificationDocuments: prev.verificationDocuments.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !profileForm.skills.includes(currentSkill.trim())) {
      setProfileForm(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    if (currentLanguage.trim() && !profileForm.languages.includes(currentLanguage.trim())) {
      setProfileForm(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage.trim()]
      }));
      setCurrentLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.filter(language => language !== languageToRemove)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, you would upload the avatar and documents to storage first
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile in database
      const updates = {
        username: profileForm.username,
        // Add other fields as they're added to the database schema
      };
      
      await updateProfile(updates);
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const startVerification = () => {
    setVerificationStep('documents');
  };

  const submitVerification = () => {
    if (profileForm.verificationDocuments.length === 0) {
      alert('Please upload at least one verification document.');
      return;
    }
    
    setVerificationStep('pending');
    // In a real app, this would submit documents for review
    alert('🔍 Verification documents submitted! We\'ll review them within 24-48 hours.');
  };

  const getVerificationBadge = () => {
    switch (verificationStep) {
      case 'verified':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            <Shield className="w-4 h-4 mr-2" />
            Verified User
          </div>
        );
      case 'pending':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <AlertCircle className="w-4 h-4 mr-2" />
            Verification Pending
          </div>
        );
      default:
        return (
          <button
            onClick={startVerification}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200"
          >
            <Shield className="w-4 h-4 mr-2" />
            Get Verified
          </button>
        );
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Profile Management
        </h2>
        <p className="text-gray-400">Build trust with a complete and verified profile</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview || profile.avatar_url ? (
                  <img
                    src={avatarPreview || profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            
            {/* Verification Badge */}
            <div className="text-center">
              {getVerificationBadge()}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{profile.username}</h3>
                <p className="text-gray-400">{profile.email}</p>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 font-medium">{profile.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-400 ml-2">({profile.completions || 0} completed)</span>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">12</div>
                <div className="text-sm text-gray-400">Active Listings</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">£2,847</div>
                <div className="text-sm text-gray-400">Total Earned</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Profile Form */}
      {isEditing && (
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <h4 className="text-xl font-bold text-white mb-6">Edit Profile Details</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Username
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  placeholder="+44 7XXX XXXXXX"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                  placeholder="London, UK"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Profession
                </label>
                <input
                  type="text"
                  value={profileForm.profession}
                  onChange={(e) => setProfileForm({...profileForm, profession: e.target.value})}
                  placeholder="Software Developer, Designer, etc."
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  placeholder="Tell others about yourself, your experience, and what makes you unique..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Award className="w-4 h-4 inline mr-1" />
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill..."
                    list="skills"
                    className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                  <datalist id="skills">
                    {skillSuggestions.map(skill => (
                      <option key={skill} value={skill} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
                {profileForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileForm.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-cyan-400 hover:text-cyan-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Languages
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    placeholder="Add a language..."
                    list="languages"
                    className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                  <datalist id="languages">
                    {languageSuggestions.map(language => (
                      <option key={language} value={language} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors duration-200"
                  >
                    Add
                  </button>
                </div>
                {profileForm.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileForm.languages.map((language, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                        {language}
                        <button
                          type="button"
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

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Used for age verification. Not shown publicly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Section */}
      {verificationStep !== 'none' && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-8">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Identity Verification
          </h4>

          {verificationStep === 'documents' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 rounded-lg p-4">
                <h5 className="font-medium text-blue-300 mb-2">Required Documents</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Government-issued photo ID (passport, driver's license, etc.)</li>
                  <li>• Proof of address (utility bill, bank statement, etc.)</li>
                  <li>• Optional: Professional certifications or qualifications</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Documents
                </label>
                <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2">Upload your verification documents</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Supports: PDF, JPG, PNG (Max 10MB each)
                  </p>
                  <input
                    ref={docInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors duration-200"
                  >
                    Choose Files
                  </button>
                </div>

                {profileForm.verificationDocuments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h6 className="text-sm font-medium text-gray-300">Uploaded Documents:</h6>
                    {profileForm.verificationDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-black/30 px-3 py-2 rounded">
                        <span className="text-sm text-gray-300">{file.name}</span>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setVerificationStep('none')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitVerification}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors duration-200"
                >
                  Submit for Review
                </button>
              </div>
            </div>
          )}

          {verificationStep === 'pending' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <h5 className="text-lg font-medium text-white mb-2">Verification Under Review</h5>
              <p className="text-gray-400 mb-4">
                We're reviewing your documents. This typically takes 24-48 hours.
                You'll receive an email once the review is complete.
              </p>
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <p className="text-sm text-yellow-300">
                  💡 While waiting, you can still use the platform, but verified users get priority visibility and higher trust ratings.
                </p>
              </div>
            </div>
          )}

          {verificationStep === 'verified' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h5 className="text-lg font-medium text-white mb-2">Verification Complete!</h5>
              <p className="text-gray-400 mb-4">
                Congratulations! Your identity has been verified. You now have a verified badge
                and will receive priority visibility in search results.
              </p>
              <div className="bg-green-500/10 rounded-lg p-4">
                <p className="text-sm text-green-300">
                  ✅ Verified users earn 23% more on average and receive 40% more bookings.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;