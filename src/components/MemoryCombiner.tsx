import React, { useState } from 'react';
import { Plus, Image, Video, MapPin, Users, Calendar, Sparkles, Eye, EyeOff, Combine, Mail, CreditCard, Clock, DollarSign } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  type: 'image' | 'video';
  location: string;
  date: string;
  people: string[];
  theme: string;
  previewUrl: string;
  isSelected: boolean;
  ownerId: string;
  ownerName: string;
}

interface Album {
  title: string;
  description: string;
  combineCriteria: 'location' | 'people' | 'date' | 'theme' | 'custom';
  accessType: 'public' | 'private' | 'shared';
  saleType: 'auction' | 'one-time-purchase' | 'subscription';
  reservePrice: number;
  oneTimePrice: number;
  subscriptionPrice: number;
  subscriptionInterval: 'monthly' | 'yearly';
  isAnonymous: boolean;
  collaboratorInvites: string[];
}

const MemoryCombiner: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([
    {
      id: '1',
      title: 'Sunset from balcony',
      type: 'image',
      location: 'London, UK',
      date: '2024-12-15',
      people: ['Me'],
      theme: 'Nature',
      previewUrl: 'https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user1',
      ownerName: 'You',
    },
    {
      id: '2',
      title: 'London Bridge walk',
      type: 'image',
      location: 'London, UK',
      date: '2024-12-16',
      people: ['Me', 'Sarah'],
      theme: 'Urban',
      previewUrl: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user2',
      ownerName: 'Sarah Chen',
    },
    {
      id: '3',
      title: 'Coffee with Sarah',
      type: 'video',
      location: 'London, UK',
      date: '2024-12-16',
      people: ['Me', 'Sarah'],
      theme: 'Social',
      previewUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user1',
      ownerName: 'You',
    },
    {
      id: '4',
      title: 'Mountain hike',
      type: 'image',
      location: 'Scotland, UK',
      date: '2024-12-10',
      people: ['Me', 'Alex'],
      theme: 'Nature',
      previewUrl: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user3',
      ownerName: 'Alex Kim',
    },
    {
      id: '5',
      title: 'Beach sunset',
      type: 'image',
      location: 'Brighton, UK',
      date: '2024-12-08',
      people: ['Me'],
      theme: 'Nature',
      previewUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user1',
      ownerName: 'You',
    },
    {
      id: '6',
      title: 'Sarah\'s birthday',
      type: 'video',
      location: 'Manchester, UK',
      date: '2024-12-05',
      people: ['Me', 'Sarah', 'Tom'],
      theme: 'Celebration',
      previewUrl: 'https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=400',
      isSelected: false,
      ownerId: 'user2',
      ownerName: 'Sarah Chen',
    },
  ]);

  const [album, setAlbum] = useState<Album>({
    title: '',
    description: '',
    combineCriteria: 'location',
    accessType: 'public',
    saleType: 'auction',
    reservePrice: 0,
    oneTimePrice: 0,
    subscriptionPrice: 0,
    subscriptionInterval: 'monthly',
    isAnonymous: true,
    collaboratorInvites: [],
  });

  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [suggestedCombinations, setSuggestedCombinations] = useState<{[key: string]: Memory[]}>({});

  const selectedMemories = memories.filter(memory => memory.isSelected);

  const toggleMemorySelection = (memoryId: string) => {
    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, isSelected: !memory.isSelected }
        : memory
    ));
  };

  const addCollaboratorInvite = () => {
    if (newInviteEmail && !album.collaboratorInvites.includes(newInviteEmail)) {
      setAlbum(prev => ({
        ...prev,
        collaboratorInvites: [...prev.collaboratorInvites, newInviteEmail]
      }));
      setNewInviteEmail('');
    }
  };

  const removeCollaboratorInvite = (email: string) => {
    setAlbum(prev => ({
      ...prev,
      collaboratorInvites: prev.collaboratorInvites.filter(invite => invite !== email)
    }));
  };

  const generateSuggestions = () => {
    const suggestions: {[key: string]: Memory[]} = {};
    
    // Group by location
    const locationGroups: {[key: string]: Memory[]} = {};
    memories.forEach(memory => {
      if (!locationGroups[memory.location]) {
        locationGroups[memory.location] = [];
      }
      locationGroups[memory.location].push(memory);
    });
    
    Object.entries(locationGroups).forEach(([location, mems]) => {
      if (mems.length > 1) {
        suggestions[`📍 ${location} Collection`] = mems;
      }
    });

    // Group by people
    const peopleGroups: {[key: string]: Memory[]} = {};
    memories.forEach(memory => {
      memory.people.forEach(person => {
        if (person !== 'Me') {
          if (!peopleGroups[person]) {
            peopleGroups[person] = [];
          }
          peopleGroups[person].push(memory);
        }
      });
    });

    Object.entries(peopleGroups).forEach(([person, mems]) => {
      if (mems.length > 1) {
        suggestions[`👥 Memories with ${person}`] = mems;
      }
    });

    // Group by theme
    const themeGroups: {[key: string]: Memory[]} = {};
    memories.forEach(memory => {
      if (!themeGroups[memory.theme]) {
        themeGroups[memory.theme] = [];
      }
      themeGroups[memory.theme].push(memory);
    });

    Object.entries(themeGroups).forEach(([theme, mems]) => {
      if (mems.length > 1) {
        suggestions[`🎨 ${theme} Collection`] = mems;
      }
    });

    setSuggestedCombinations(suggestions);
  };

  React.useEffect(() => {
    generateSuggestions();
  }, []);

  const applySuggestion = (suggestionMemories: Memory[]) => {
    setMemories(prev => prev.map(memory => ({
      ...memory,
      isSelected: suggestionMemories.some(sm => sm.id === memory.id)
    })));
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemories.length < 2) {
      alert('⚠️ Please select at least 2 memories to create an album.');
      return;
    }
    
    const albumTypeText = album.accessType === 'private' ? 'private' : 
                         album.accessType === 'shared' ? 'collaborative' : 'public';
    
    const saleTypeText = album.saleType === 'subscription' ? 'subscription-based' :
                        album.saleType === 'one-time-purchase' ? 'one-time purchase' : 'auction';
    
    alert(`🎨 ${albumTypeText} album "${album.title}" created successfully with ${selectedMemories.length} memories! It will be available as a ${saleTypeText} once approved.`);
    
    // Reset form
    setAlbum({
      title: '',
      description: '',
      combineCriteria: 'location',
      accessType: 'public',
      saleType: 'auction',
      reservePrice: 0,
      oneTimePrice: 0,
      subscriptionPrice: 0,
      subscriptionInterval: 'monthly',
      isAnonymous: true,
      collaboratorInvites: [],
    });
    
    setMemories(prev => prev.map(memory => ({ ...memory, isSelected: false })));
  };

  const getAccessTypeIcon = (accessType: string) => {
    switch (accessType) {
      case 'private': return <EyeOff className="w-4 h-4" />;
      case 'shared': return <Users className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getSaleTypeIcon = (saleType: string) => {
    switch (saleType) {
      case 'subscription': return <Clock className="w-4 h-4" />;
      case 'one-time-purchase': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Combine className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Combine Memories
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Create collaborative albums with friends or curate your own collections. 
          Choose from auction, one-time purchase, or subscription models.
        </p>
      </div>

      {/* Smart Suggestions */}
      {Object.keys(suggestedCombinations).length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            Smart Suggestions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(suggestedCombinations).map(([title, suggestionMemories]) => (
              <button
                key={title}
                onClick={() => applySuggestion(suggestionMemories)}
                className="p-3 bg-black/30 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-all duration-200 text-left"
              >
                <div className="text-sm font-medium text-white mb-1">{title}</div>
                <div className="text-xs text-gray-400">{suggestionMemories.length} memories</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Memory Selection */}
        <div className="lg:col-span-2">
          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              <span>Select Memories ({selectedMemories.length} selected)</span>
              <button
                onClick={() => setMemories(prev => prev.map(m => ({ ...m, isSelected: false })))}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Clear All
              </button>
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {memories.map(memory => (
                <div
                  key={memory.id}
                  onClick={() => toggleMemorySelection(memory.id)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                    memory.isSelected 
                      ? 'ring-2 ring-cyan-400 transform scale-105' 
                      : 'hover:transform hover:scale-105'
                  }`}
                >
                  <img
                    src={memory.previewUrl}
                    alt={memory.title}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 transition-all duration-200 ${
                    memory.isSelected 
                      ? 'bg-cyan-500/20' 
                      : 'bg-black/40 hover:bg-black/20'
                  }`}>
                    {/* Selection indicator */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        memory.isSelected 
                          ? 'bg-cyan-400 border-cyan-400' 
                          : 'border-white/50 bg-black/50'
                      }`}>
                        {memory.isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                    
                    {/* Type indicator */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        memory.type === 'video' 
                          ? 'bg-purple-500/80 text-white' 
                          : 'bg-cyan-500/80 text-white'
                      }`}>
                        {memory.type === 'video' ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                      </span>
                    </div>

                    {/* Owner indicator */}
                    <div className="absolute bottom-2 right-2">
                      <span className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                        {memory.ownerName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-white text-xs font-medium truncate">{memory.title}</div>
                    <div className="text-gray-300 text-xs truncate">{memory.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Album Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 sticky top-4">
            <h4 className="text-lg font-semibold text-white mb-4">Create Album</h4>
            
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              {/* Album Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album Title
                </label>
                <input
                  type="text"
                  value={album.title}
                  onChange={(e) => setAlbum({...album, title: e.target.value})}
                  placeholder="My London Adventures"
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                />
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Type
                </label>
                <select
                  value={album.accessType}
                  onChange={(e) => setAlbum({...album, accessType: e.target.value as any})}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="public">👁️ Public - Anyone can view</option>
                  <option value="private">🔒 Private - Only you</option>
                  <option value="shared">👥 Shared - Collaborative</option>
                </select>
              </div>

              {/* Collaborator Invites (only for shared albums) */}
              {album.accessType === 'shared' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invite Collaborators
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1 px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={addCollaboratorInvite}
                      className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg transition-colors duration-200"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                  {album.collaboratorInvites.length > 0 && (
                    <div className="space-y-1">
                      {album.collaboratorInvites.map((email, index) => (
                        <div key={index} className="flex items-center justify-between bg-black/30 px-2 py-1 rounded text-sm">
                          <span className="text-gray-300">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeCollaboratorInvite(email)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
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
                  value={album.saleType}
                  onChange={(e) => setAlbum({...album, saleType: e.target.value as any})}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="auction">🔨 Auction - Bidding system</option>
                  <option value="one-time-purchase">💳 One-time Purchase</option>
                  <option value="subscription">⏰ Subscription Access</option>
                </select>
              </div>

              {/* Pricing based on sale type */}
              {album.saleType === 'auction' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reserve Price (£)
                  </label>
                  <input
                    type="number"
                    value={album.reservePrice}
                    onChange={(e) => setAlbum({...album, reservePrice: Number(e.target.value)})}
                    placeholder="50"
                    min="1"
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              )}

              {album.saleType === 'one-time-purchase' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Price (£)
                  </label>
                  <input
                    type="number"
                    value={album.oneTimePrice}
                    onChange={(e) => setAlbum({...album, oneTimePrice: Number(e.target.value)})}
                    placeholder="25"
                    min="1"
                    className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  />
                </div>
              )}

              {album.saleType === 'subscription' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subscription Price (£)
                    </label>
                    <input
                      type="number"
                      value={album.subscriptionPrice}
                      onChange={(e) => setAlbum({...album, subscriptionPrice: Number(e.target.value)})}
                      placeholder="5"
                      min="1"
                      className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Billing Interval
                    </label>
                    <select
                      value={album.subscriptionInterval}
                      onChange={(e) => setAlbum({...album, subscriptionInterval: e.target.value as any})}
                      className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Combine Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Combination Theme
                </label>
                <select
                  value={album.combineCriteria}
                  onChange={(e) => setAlbum({...album, combineCriteria: e.target.value as any})}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="location">📍 Same Location</option>
                  <option value="people">👥 Same People</option>
                  <option value="date">📅 Date Range</option>
                  <option value="theme">🎨 Theme/Mood</option>
                  <option value="custom">✨ Custom Story</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Album Story
                </label>
                <textarea
                  value={album.description}
                  onChange={(e) => setAlbum({...album, description: e.target.value})}
                  placeholder="Tell the story behind this collection..."
                  rows={3}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                <div>
                  <h5 className="text-white font-medium text-sm">Anonymous</h5>
                  <p className="text-xs text-gray-400">Hide identity until sold</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlbum({...album, isAnonymous: !album.isAnonymous})}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                    album.isAnonymous ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      album.isAnonymous ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Selected Memories Preview */}
              {selectedMemories.length > 0 && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    Selected ({selectedMemories.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedMemories.map(memory => (
                      <div key={memory.id} className="relative">
                        <img
                          src={memory.previewUrl}
                          alt={memory.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {memory.ownerName === 'You' ? '•' : memory.ownerName.charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Button */}
              <button
                type="submit"
                disabled={selectedMemories.length < 2 || !album.title}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  selectedMemories.length >= 2 && album.title
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Create Album
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCombiner;