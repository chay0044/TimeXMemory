import React, { useState } from 'react';
import { User, LogOut, Settings, Star, Clock, ChevronDown, MessageCircle, ThumbsUp, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleMenuClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">{profile.username}</div>
          <div className="text-xs text-slate-400 flex items-center">
            <Star className="w-3 h-3 mr-1 text-amber-400" />
            {profile.rating?.toFixed(1) || '0.0'} ({profile.completions || 0})
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop with maximum z-index */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu with absolute maximum z-index to ensure it's above everything */}
          <div 
            className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl border border-emerald-500/20 shadow-2xl z-[99999] shadow-emerald-500/10"
            style={{ zIndex: 99999 }}
          >
            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{profile.username}</div>
                  <div className="text-sm text-slate-400">{profile.email}</div>
                  <div className="text-xs text-slate-400 flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1 text-amber-400" />
                    {profile.rating?.toFixed(1) || '0.0'} rating • {profile.completions || 0} completed
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button 
                onClick={() => handleMenuClick('profile')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                  activeTab === 'profile' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              
              <button 
                onClick={() => handleMenuClick('settings')}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 ${
                  activeTab === 'settings' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <div className="border-t border-slate-700 my-2"></div>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;