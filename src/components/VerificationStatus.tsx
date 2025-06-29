import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, Upload, FileText, Camera, User, MapPin, Award } from 'lucide-react';

interface VerificationStatusProps {
  userId: string;
  currentStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  onStatusChange?: (newStatus: string) => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  userId, 
  currentStatus, 
  onStatusChange 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const verificationSteps = [
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Government-issued photo ID',
      icon: User,
      required: true,
      status: currentStatus === 'verified' ? 'completed' : currentStatus === 'pending' ? 'pending' : 'pending'
    },
    {
      id: 'address',
      title: 'Address Verification',
      description: 'Proof of residence',
      icon: MapPin,
      required: true,
      status: currentStatus === 'verified' ? 'completed' : 'pending'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'SMS verification code',
      icon: CheckCircle,
      required: true,
      status: currentStatus === 'verified' ? 'completed' : 'pending'
    },
    {
      id: 'qualifications',
      title: 'Professional Qualifications',
      description: 'Certificates, degrees, licenses',
      icon: Award,
      required: false,
      status: 'optional'
    }
  ];

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'verified':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'pending':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'rejected':
        return 'from-red-500/20 to-pink-500/20 border-red-500/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'verified':
        return {
          title: 'Verified Account',
          description: 'Your identity has been verified. You have full access to all platform features.',
          action: null
        };
      case 'pending':
        return {
          title: 'Verification Pending',
          description: 'We\'re reviewing your documents. This typically takes 24-48 hours.',
          action: 'Track Progress'
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          description: 'Some documents need to be resubmitted. Please check your email for details.',
          action: 'Resubmit Documents'
        };
      default:
        return {
          title: 'Unverified Account',
          description: 'Complete verification to build trust and unlock premium features.',
          action: 'Start Verification'
        };
    }
  };

  const statusInfo = getStatusText();

  const handleStartVerification = () => {
    // In a real app, this would navigate to verification flow
    alert('🔍 Starting verification process...');
    onStatusChange?.('pending');
  };

  const getStepIcon = (step: typeof verificationSteps[0]) => {
    const Icon = step.icon;
    const baseClasses = "w-5 h-5";
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-400`} />;
      case 'pending':
        return <Clock className={`${baseClasses} text-yellow-400`} />;
      default:
        return <Icon className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getStepStatus = (step: typeof verificationSteps[0]) => {
    switch (step.status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return step.required ? 'Required' : 'Optional';
      default:
        return step.required ? 'Required' : 'Optional';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} rounded-xl border p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-white">{statusInfo.title}</h3>
            <p className="text-sm text-gray-300">{statusInfo.description}</p>
          </div>
        </div>
        
        {statusInfo.action && (
          <button
            onClick={currentStatus === 'unverified' ? handleStartVerification : () => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            {statusInfo.action}
          </button>
        )}
      </div>

      {/* Verification Benefits */}
      {currentStatus === 'unverified' && (
        <div className="bg-black/20 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-white mb-2">Verification Benefits:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 🛡️ Verified badge increases trust by 85%</li>
            <li>• 📈 Priority placement in search results</li>
            <li>• 💰 Access to higher-value opportunities</li>
            <li>• 🔒 Enhanced account security</li>
            <li>• ⚡ Faster dispute resolution</li>
          </ul>
        </div>
      )}

      {/* Verification Progress */}
      {(currentStatus === 'pending' || showDetails) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Verification Steps</h4>
            <span className="text-xs text-gray-400">
              {verificationSteps.filter(s => s.status === 'completed').length} of {verificationSteps.filter(s => s.required).length} required steps completed
            </span>
          </div>
          
          <div className="space-y-2">
            {verificationSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step)}
                  <div>
                    <div className="text-sm font-medium text-white">{step.title}</div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {getStepStatus(step)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Status Details */}
      {currentStatus === 'rejected' && (
        <div className="bg-red-500/10 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-red-300 mb-2">Issues Found:</h4>
          <ul className="text-sm text-red-200 space-y-1">
            <li>• Document image quality too low</li>
            <li>• Address document is older than 3 months</li>
          </ul>
          <button
            onClick={() => alert('📧 Check your email for detailed instructions on resubmitting documents.')}
            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            View Details & Resubmit
          </button>
        </div>
      )}

      {/* Verification Timeline */}
      {currentStatus === 'pending' && (
        <div className="bg-yellow-500/10 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-yellow-300 mb-2">What happens next?</h4>
          <div className="space-y-2 text-sm text-yellow-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Documents submitted ✓</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Under review (24-48 hours)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Email notification sent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Verification complete</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;