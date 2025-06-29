import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Video, Smile, MoreVertical, Phone, VideoIcon, Star, Shield, Clock, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import TrustBadges from './TrustBadges';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }[];
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar_url?: string;
    isVerified: boolean;
    rating: number;
    completions: number;
    lastSeen: Date;
    isOnline: boolean;
  }[];
  lastMessage: Message;
  unreadCount: number;
  listingTitle?: string;
  listingPrice?: number;
}

const MessagingSystem: React.FC = () => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          {
            id: 'user1',
            username: 'Sarah Chen',
            avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
            isVerified: true,
            rating: 4.8,
            completions: 47,
            lastSeen: new Date(Date.now() - 5 * 60 * 1000),
            isOnline: true,
          }
        ],
        lastMessage: {
          id: 'msg1',
          senderId: 'user1',
          receiverId: user?.id || '',
          content: 'Hi! I\'m interested in your React tutoring service. When are you available?',
          type: 'text',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          status: 'delivered'
        },
        unreadCount: 2,
        listingTitle: 'React Development Tutoring',
        listingPrice: 45
      },
      {
        id: '2',
        participants: [
          {
            id: 'user2',
            username: 'Alex Kim',
            avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
            isVerified: false,
            rating: 4.2,
            completions: 12,
            lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isOnline: false,
          }
        ],
        lastMessage: {
          id: 'msg2',
          senderId: user?.id || '',
          receiverId: 'user2',
          content: 'Thanks for the quick response! I\'ll be there at 2 PM.',
          type: 'text',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'read'
        },
        unreadCount: 0,
        listingTitle: 'Grocery Shopping Service',
        listingPrice: 15
      },
      {
        id: '3',
        participants: [
          {
            id: 'user3',
            username: 'Maria Rodriguez',
            avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
            isVerified: true,
            rating: 4.9,
            completions: 89,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000),
            isOnline: false,
          }
        ],
        lastMessage: {
          id: 'msg3',
          senderId: 'user3',
          receiverId: user?.id || '',
          content: 'Perfect! I\'ve uploaded the photos to our shared album.',
          type: 'text',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          status: 'read'
        },
        unreadCount: 0,
        listingTitle: 'Photography Session',
        listingPrice: 120
      }
    ];

    setConversations(mockConversations);
    
    // Mock messages for first conversation
    if (mockConversations.length > 0) {
      const mockMessages: Message[] = [
        {
          id: 'msg1',
          senderId: 'user1',
          receiverId: user?.id || '',
          content: 'Hi! I saw your React tutoring listing and I\'m really interested.',
          type: 'text',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'read'
        },
        {
          id: 'msg2',
          senderId: user?.id || '',
          receiverId: 'user1',
          content: 'Great! I\'d be happy to help. What specific areas of React would you like to focus on?',
          type: 'text',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          status: 'read'
        },
        {
          id: 'msg3',
          senderId: 'user1',
          receiverId: user?.id || '',
          content: 'I\'m struggling with hooks and state management. Also, I need help with testing.',
          type: 'text',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          status: 'read'
        },
        {
          id: 'msg4',
          senderId: user?.id || '',
          receiverId: 'user1',
          content: 'Perfect! Those are exactly my specialties. I can cover useState, useEffect, custom hooks, and Jest testing.',
          type: 'text',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'read'
        },
        {
          id: 'msg5',
          senderId: 'user1',
          receiverId: user?.id || '',
          content: 'That sounds perfect! When are you available? I\'m flexible with timing.',
          type: 'text',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          status: 'delivered'
        }
      ];
      setMessages(mockMessages);
    }
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read when user opens it
  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Mark all messages in this conversation as read
    setMessages(prev => prev.map(msg => 
      msg.senderId !== user?.id ? { ...msg, status: 'read' } : msg
    ));
    
    // Update conversation unread count
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      receiverId: activeConversation,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: message }
        : conv
    ));

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    // Simulate message being read after 3 seconds
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      receiverId: activeConversation,
      content: `Shared a file: ${file.name}`,
      type: 'file',
      timestamp: new Date(),
      status: 'sent',
      attachments: [{
        type: 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }]
    };

    setMessages(prev => [...prev, message]);
    
    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: message }
        : conv
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-cyan-400" />;
    }
  };

  const activeConversationData = conversations.find(c => c.id === activeConversation);
  const otherParticipant = activeConversationData?.participants[0];

  // Calculate total unread messages across all conversations
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400">You need to be signed in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-500/20 overflow-hidden h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Messages</h3>
              {totalUnreadCount > 0 && (
                <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {totalUnreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {totalUnreadCount > 0 ? `${totalUnreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conversation => {
              const participant = conversation.participants[0];
              const isActive = activeConversation === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className={`p-4 border-b border-gray-800 cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 border-l-4 border-l-cyan-500' 
                      : 'hover:bg-white/5'
                  } ${conversation.unreadCount > 0 ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                        {participant.avatar_url ? (
                          <img
                            src={participant.avatar_url}
                            alt={participant.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {participant.username.charAt(0)}
                          </span>
                        )}
                      </div>
                      {participant.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium truncate ${
                            conversation.unreadCount > 0 ? 'text-white font-semibold' : 'text-white'
                          }`}>
                            {participant.username}
                          </h4>
                          {participant.isVerified && (
                            <Shield className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-200 font-medium' : 'text-gray-400'
                        }`}>
                          {conversation.lastMessage.senderId === user.id && (
                            <span className="mr-1">
                              {getMessageStatus(conversation.lastMessage.status)}
                            </span>
                          )}
                          {conversation.lastMessage.content}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2 flex-shrink-0">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      {conversation.listingTitle && (
                        <div className="mt-2 p-2 bg-black/30 rounded text-xs">
                          <div className="text-cyan-300 font-medium">{conversation.listingTitle}</div>
                          <div className="text-gray-400">£{conversation.listingPrice}/hr</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      {otherParticipant.avatar_url ? (
                        <img
                          src={otherParticipant.avatar_url}
                          alt={otherParticipant.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {otherParticipant.username.charAt(0)}
                        </span>
                      )}
                    </div>
                    {otherParticipant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{otherParticipant.username}</h3>
                      <TrustBadges 
                        profile={{
                          isVerified: otherParticipant.isVerified,
                          rating: otherParticipant.rating,
                          completions: otherParticipant.completions,
                          responseTime: 'fast'
                        }}
                        size="small"
                        showLabels={false}
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      {otherParticipant.isOnline ? 'Online' : `Last seen ${formatTime(otherParticipant.lastSeen)}`}
                      {isTyping && otherParticipant.isOnline && ' • typing...'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <VideoIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => {
                  const isOwn = message.senderId === user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                              : 'bg-gray-700 text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="bg-black/20 rounded p-2">
                                  <div className="flex items-center space-x-2">
                                    <Paperclip className="w-4 h-4" />
                                    <span className="text-xs">{attachment.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && getMessageStatus(message.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;