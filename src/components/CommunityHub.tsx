import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Upload, Users, TrendingUp, Star, Clock, Search } from 'lucide-react';
import MessagingSystem from './MessagingSystem';
import ReviewSystem from './ReviewSystem';
import FileUploadSystem from './FileUploadSystem';

const CommunityHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState('messages');

  const sections = [
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      description: 'Connect with other users',
      component: MessagingSystem
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: ThumbsUp,
      description: 'Share your experiences',
      component: ReviewSystem
    },
    {
      id: 'files',
      label: 'File Manager',
      icon: Upload,
      description: 'Manage your uploads',
      component: FileUploadSystem
    }
  ];

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || MessagingSystem;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Community Hub
        </h2>
        <p className="text-gray-400">Connect, share, and collaborate with the TimeX community</p>
      </div>

      {/* Section Navigation */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  activeSection === section.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-600 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-white">{section.label}</h3>
                </div>
                <p className="text-sm text-gray-400">{section.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default CommunityHub;