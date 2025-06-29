import React from 'react';
import { Shield, Star, Award, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

interface TrustBadgesProps {
  profile: {
    isVerified?: boolean;
    rating?: number;
    completions?: number;
    responseTime?: string;
    memberSince?: string;
    specializations?: string[];
  };
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ 
  profile, 
  size = 'medium', 
  showLabels = true 
}) => {
  const badges = [];

  // Verification Badge
  if (profile.isVerified) {
    badges.push({
      id: 'verified',
      icon: Shield,
      label: 'Verified Identity',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      description: 'Identity verified through official documents'
    });
  }

  // Rating Badge
  if (profile.rating && profile.rating >= 4.5) {
    badges.push({
      id: 'top-rated',
      icon: Star,
      label: 'Top Rated',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      description: `${profile.rating.toFixed(1)} star average rating`
    });
  }

  // Experience Badge
  if (profile.completions && profile.completions >= 50) {
    badges.push({
      id: 'experienced',
      icon: Award,
      label: 'Experienced',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      description: `${profile.completions}+ completed services`
    });
  } else if (profile.completions && profile.completions >= 10) {
    badges.push({
      id: 'reliable',
      icon: CheckCircle,
      label: 'Reliable',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      description: `${profile.completions} completed services`
    });
  }

  // Response Time Badge
  if (profile.responseTime === 'fast') {
    badges.push({
      id: 'fast-response',
      icon: Clock,
      label: 'Quick Response',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      description: 'Typically responds within 1 hour'
    });
  }

  // Popular Badge (based on high completion rate)
  if (profile.completions && profile.completions >= 25 && profile.rating && profile.rating >= 4.0) {
    badges.push({
      id: 'popular',
      icon: TrendingUp,
      label: 'Popular',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      description: 'High demand service provider'
    });
  }

  // Long-term Member Badge
  if (profile.memberSince) {
    const memberDate = new Date(profile.memberSince);
    const monthsAgo = Math.floor((Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsAgo >= 12) {
      badges.push({
        id: 'veteran',
        icon: Users,
        label: 'Veteran Member',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/30',
        description: `Member for ${Math.floor(monthsAgo / 12)} year${Math.floor(monthsAgo / 12) > 1 ? 's' : ''}`
      });
    }
  }

  const sizeClasses = {
    small: {
      container: 'gap-1',
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    medium: {
      container: 'gap-2',
      badge: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4'
    },
    large: {
      container: 'gap-3',
      badge: 'px-4 py-2 text-base',
      icon: 'w-5 h-5'
    }
  };

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap ${sizeClasses[size].container}`}>
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.id}
            className={`inline-flex items-center ${sizeClasses[size].badge} ${badge.bgColor} ${badge.color} border ${badge.borderColor} rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-help`}
            title={badge.description}
          >
            <Icon className={`${sizeClasses[size].icon} mr-1`} />
            {showLabels && <span>{badge.label}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;