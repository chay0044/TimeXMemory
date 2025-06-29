import React, { useState } from 'react';
import { Clock, Star, Camera, LogIn } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import Marketplace from './components/Marketplace';
import MemoryHub from './components/MemoryHub';
import MemoryCombiner from './components/MemoryCombiner';
import ImpactDashboard from './components/ImpactDashboard';
import ProfileEditor from './components/ProfileEditor';
import ProfileSettings from './components/ProfileSettings';
import CommunityHub from './components/CommunityHub';
import SessionWarningModal from './components/SessionWarningModal';

function App() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { user, loading, showSessionWarning, extendSession, signOut } = useAuth();

  const handleSessionLogout = async () => {
    await signOut();
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Welcome to TimeX
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Transform your time and memories into valuable assets. Join our community of creators, 
            learners, and memory collectors who are building the future of personal value exchange.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-emerald-500/20 p-6 hover:border-emerald-400/40 transition-all duration-300">
              <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Sell Your Time</h3>
              <p className="text-slate-400 text-sm">Create vouchers for your skills and expertise</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-teal-500/20 p-6 hover:border-teal-400/40 transition-all duration-300">
              <Camera className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Trade Memories</h3>
              <p className="text-slate-400 text-sm">Auction your precious moments and experiences</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-blue-500/20 p-6 hover:border-blue-400/40 transition-all duration-300">
              <Star className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Make Impact</h3>
              <p className="text-slate-400 text-sm">Support global education through UNESCO</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:via-teal-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'memories':
        return <MemoryHub />;
      case 'combine-memories':
        return <MemoryCombiner />;
      case 'community':
        return <CommunityHub />;
      case 'impact':
        return <ImpactDashboard />;
      case 'profile':
        return <ProfileEditor />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <Marketplace />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-emerald-500/25">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-300">Loading TimeX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-slate-800/80 backdrop-blur-md border-b border-emerald-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                    TimeX
                  </h1>
                  <p className="text-sm text-slate-400">Time & Memory Exchange</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Simple Navigation */}
                {user && (
                  <nav className="hidden md:flex space-x-1">
                    {[
                      { id: 'marketplace', label: 'Marketplace' },
                      { id: 'memories', label: 'Memories' },
                      { id: 'combine-memories', label: 'Combine' },
                      { id: 'community', label: 'Community' },
                      { id: 'impact', label: 'Impact' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                )}

                {/* Auth Section - ALWAYS show sign in button when not authenticated */}
                {user ? (
                  <UserMenu activeTab={activeTab} setActiveTab={setActiveTab} />
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:via-teal-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-slate-800/80 backdrop-blur-md border-t border-emerald-500/20 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm mb-4 md:mb-0">
                <p>© 2025 TimeX. Transforming time into value.</p>
              </div>
              <div className="text-slate-400 text-sm">
                <p>
                  🛡️ GDPR Compliant • Privacy-first design • 
                  <button className="text-emerald-400 hover:text-emerald-300 ml-1 underline transition-colors duration-200">
                    Privacy Policy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Modal - ALWAYS available */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Session Warning Modal - only show when user is authenticated */}
      {user && (
        <SessionWarningModal
          isOpen={showSessionWarning}
          onExtend={extendSession}
          onLogout={handleSessionLogout}
          timeRemaining={300} // 5 minutes
        />
      )}

      {/* Emergency Sign In Button - appears when session expires */}
      {!user && !loading && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:via-teal-400 hover:to-blue-500 text-white font-semibold rounded-full shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
            title="Sign in to access your account"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;