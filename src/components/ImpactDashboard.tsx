import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, Globe, Award, Sparkles } from 'lucide-react';

const ImpactDashboard: React.FC = () => {
  const [earnings, setEarnings] = useState(12847);
  const [showConfetti, setShowConfetti] = useState(false);
  const [donated, setDonated] = useState(false);

  // Simulate dynamic earnings increase
  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDonate = () => {
    if (!donated) {
      setShowConfetti(true);
      setDonated(true);
      
      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  };

  const stats = [
    {
      title: 'Total Platform Earnings',
      value: `£${earnings.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-cyan-400 to-blue-500',
      description: 'Growing every minute',
    },
    {
      title: 'Active Users',
      value: '2,847',
      icon: Globe,
      gradient: 'from-purple-400 to-pink-500',
      description: 'Across 23 countries',
    },
    {
      title: 'Time Assets Traded',
      value: '1,293',
      icon: Award,
      gradient: 'from-green-400 to-emerald-500',
      description: 'This month',
    },
    {
      title: 'Memories Auctioned',
      value: '456',
      icon: Heart,
      gradient: 'from-orange-400 to-red-500',
      description: 'Precious moments shared',
    },
  ];

  // Confetti component
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              ['bg-cyan-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400'][Math.floor(Math.random() * 5)]
            }`}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Impact Dashboard
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          See the real-time impact of our global community turning time and memories into value, 
          while supporting education worldwide through UNESCO.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6 hover:transform hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {index === 0 && (
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Live
                  </div>
                )}
              </div>
              <div className="mb-2">
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <h3 className="text-white font-medium">{stat.title}</h3>
              </div>
              <p className="text-gray-400 text-sm">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* UNESCO Donation Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            Support Global Education
          </h3>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Every transaction on our platform contributes to a better world. By donating 10% of our 
            platform earnings to UNESCO, we're helping to provide quality education to children and 
            adults worldwide, breaking cycles of poverty and building stronger communities.
          </p>

          <div className="bg-black/30 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  £{Math.floor(earnings * 0.1).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Available to Donate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {donated ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-400">Donations Made</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  2,847
                </div>
                <div className="text-sm text-gray-400">Lives Impacted</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDonate}
            disabled={donated}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              donated
                ? 'bg-green-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {donated ? (
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 fill-current" />
                <span>Thank You! Donation Sent</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Donate 10% to UNESCO</span>
              </div>
            )}
          </button>

          {donated && (
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-300 text-sm">
                🎉 Amazing! Your donation of £{Math.floor(earnings * 0.1).toLocaleString()} will help 
                provide educational resources to underserved communities worldwide.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-black/20 backdrop-blur-md rounded-xl border border-cyan-500/20 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
          Recent Platform Activity
        </h3>
        
        <div className="space-y-4">
          {[
            { action: 'New voucher: React Development tutoring', time: '2 min ago', type: 'voucher' },
            { action: 'Memory auction: "First concert" sold for £89', time: '5 min ago', type: 'memory' },
            { action: 'Video verification completed successfully', time: '8 min ago', type: 'verification' },
            { action: 'New user joined from Barcelona, Spain', time: '12 min ago', type: 'user' },
            { action: 'Donation milestone: £1000 sent to UNESCO', time: '1 hour ago', type: 'donation' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'voucher' ? 'bg-cyan-400' :
                  activity.type === 'memory' ? 'bg-purple-400' :
                  activity.type === 'verification' ? 'bg-green-400' :
                  activity.type === 'donation' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`} />
                <span className="text-gray-300">{activity.action}</span>
              </div>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;