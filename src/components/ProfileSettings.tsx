import React, { useState } from 'react';
import { Settings, Bell, Shield, Eye, Lock, Trash2, Download, AlertTriangle } from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    bidAlerts: true,
    messageAlerts: true,
    weeklyDigest: true,
    
    // Privacy Settings
    profileVisibility: 'public', // public, private, verified-only
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showLastSeen: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '24h', // 1h, 8h, 24h, never
    
    // Account Settings
    autoAcceptBookings: false,
    requireVerifiedBuyers: false,
    blockUnverifiedUsers: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    alert('📦 Your data export has been requested. You\'ll receive a download link via email within 24 hours.');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('❌ Please type "DELETE" to confirm account deletion.');
      return;
    }
    
    // In a real app, this would trigger account deletion
    alert('🗑️ Account deletion initiated. You have 30 days to cancel this action.');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
  };

  const ToggleSwitch: React.FC<{ 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-cyan-500' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Account Settings
        </h2>
        <p className="text-gray-400">Manage your privacy, security, and notification preferences</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-cyan-400" />
          Notification Preferences
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <ToggleSwitch
                  checked={settings.emailNotifications}
                  onChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Push Notifications</h4>
                  <p className="text-sm text-gray-400">Browser and mobile alerts</p>
                </div>
                <ToggleSwitch
                  checked={settings.pushNotifications}
                  onChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Marketing Emails</h4>
                  <p className="text-sm text-gray-400">Tips, features, and promotions</p>
                </div>
                <ToggleSwitch
                  checked={settings.marketingEmails}
                  onChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Bid Alerts</h4>
                  <p className="text-sm text-gray-400">New bids on your listings</p>
                </div>
                <ToggleSwitch
                  checked={settings.bidAlerts}
                  onChange={(checked) => handleSettingChange('bidAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Message Alerts</h4>
                  <p className="text-sm text-gray-400">New messages from users</p>
                </div>
                <ToggleSwitch
                  checked={settings.messageAlerts}
                  onChange={(checked) => handleSettingChange('messageAlerts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Weekly Digest</h4>
                  <p className="text-sm text-gray-400">Summary of your activity</p>
                </div>
                <ToggleSwitch
                  checked={settings.weeklyDigest}
                  onChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-400" />
          Privacy Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
            >
              <option value="public">Public - Anyone can view</option>
              <option value="verified-only">Verified Users Only</option>
              <option value="private">Private - Hidden from search</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Show Email Address</h4>
                  <p className="text-sm text-gray-400">Visible to other users</p>
                </div>
                <ToggleSwitch
                  checked={settings.showEmail}
                  onChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Show Phone Number</h4>
                  <p className="text-sm text-gray-400">Visible to verified users</p>
                </div>
                <ToggleSwitch
                  checked={settings.showPhone}
                  onChange={(checked) => handleSettingChange('showPhone', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Show Location</h4>
                  <p className="text-sm text-gray-400">City/region visibility</p>
                </div>
                <ToggleSwitch
                  checked={settings.showLocation}
                  onChange={(checked) => handleSettingChange('showLocation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Show Last Seen</h4>
                  <p className="text-sm text-gray-400">When you were last active</p>
                </div>
                <ToggleSwitch
                  checked={settings.showLastSeen}
                  onChange={(checked) => handleSettingChange('showLastSeen', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Security Settings
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-400">Extra security for your account</p>
                </div>
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Login Alerts</h4>
                  <p className="text-sm text-gray-400">Notify on new device login</p>
                </div>
                <ToggleSwitch
                  checked={settings.loginAlerts}
                  onChange={(checked) => handleSettingChange('loginAlerts', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Timeout
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                >
                  <option value="1h">1 Hour</option>
                  <option value="8h">8 Hours</option>
                  <option value="24h">24 Hours</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Preferences */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-orange-400" />
          Account Preferences
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Auto-Accept Bookings</h4>
                  <p className="text-sm text-gray-400">Automatically accept verified users</p>
                </div>
                <ToggleSwitch
                  checked={settings.autoAcceptBookings}
                  onChange={(checked) => handleSettingChange('autoAcceptBookings', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Require Verified Buyers</h4>
                  <p className="text-sm text-gray-400">Only verified users can book</p>
                </div>
                <ToggleSwitch
                  checked={settings.requireVerifiedBuyers}
                  onChange={(checked) => handleSettingChange('requireVerifiedBuyers', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Block Unverified Users</h4>
                  <p className="text-sm text-gray-400">Hide profile from unverified users</p>
                </div>
                <ToggleSwitch
                  checked={settings.blockUnverifiedUsers}
                  onChange={(checked) => handleSettingChange('blockUnverifiedUsers', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Account Management */}
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-red-500/20 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-red-400" />
          Data & Account Management
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export My Data</span>
              </button>
              <p className="text-xs text-gray-400">
                Download all your data in a portable format
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
              <p className="text-xs text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-red-500/20 p-8 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
              <p className="text-gray-400">
                This action cannot be undone. All your data, listings, and messages will be permanently deleted.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;