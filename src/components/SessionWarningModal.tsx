import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface SessionWarningModalProps {
  isOpen: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining?: number; // in seconds
}

const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  onExtend,
  onLogout,
  timeRemaining = 300 // 5 minutes default
}) => {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (isOpen) {
      setCountdown(timeRemaining);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout(); // Auto logout when countdown reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, timeRemaining, onLogout]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-amber-500/20 p-8 w-full max-w-md relative shadow-2xl shadow-amber-500/10">
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Session Expiring Soon</h3>
          <p className="text-slate-400">
            Your session will expire due to inactivity. Would you like to continue?
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-mono font-bold text-amber-400">
              {formatTime(countdown)}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Time remaining before automatic logout
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-400 to-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / timeRemaining) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Now</span>
          </button>
          <button
            onClick={onExtend}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Logged In</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-300 text-center">
            🔒 For your security, we automatically log out inactive users. 
            Your data and privacy are protected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;