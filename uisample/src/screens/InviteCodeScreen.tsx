import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Ticket } from 'lucide-react';

interface InviteCodeScreenProps {
  onVerify: (inviteCode: string) => void;
  onBack: () => void;
  onSwitchToPremium: () => void;
}

export const InviteCodeScreen = ({ onVerify, onBack, onSwitchToPremium }: InviteCodeScreenProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);

  const handleContinue = () => {
    if (inviteCode.length < 6) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }
    
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      onVerify(inviteCode);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-[#0A0A14] px-6 pt-12 pb-8"
    >
      {/* Header */}
      <div className="flex items-center mb-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center mb-12">
          {/* Ticket Icon with Glow */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glow effect */}
              <motion.div
                animate={{ 
                  scale: inviteCode.length >= 6 ? [1, 1.2, 1] : [1, 1.1, 1],
                  opacity: inviteCode.length >= 6 ? [0.7, 0.5, 0.7] : [0.5, 0.3, 0.5]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-xl"
              />
              {/* Extra glow when invite code is valid */}
              {inviteCode.length >= 6 && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.2, 0.4]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#3B82F6] rounded-full blur-2xl"
                />
              )}
              <div className={`relative bg-[#141422] p-5 rounded-full border transition-all duration-300 ${
                inviteCode.length >= 6 
                  ? 'border-[#2563EB] shadow-[0_0_24px_rgba(37,99,235,0.4)]' 
                  : 'border-[rgba(29,78,216,0.3)]'
              }`}>
                <Ticket 
                  size={32} 
                  className={`transition-all duration-300 ${
                    inviteCode.length >= 6
                      ? 'text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,1)]'
                      : 'text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[28px] font-bold text-white text-center mb-3"
          >
            Enter Invite Code
          </motion.h1>
          
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[16px] text-[#8B8CAD] text-center max-w-sm leading-[22px]"
          >
            Enter the invite code you received to create your Amigo account.
          </motion.p>
        </div>

        {/* Invite Code Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <motion.input
            type="text"
            placeholder="INVITE-CODE-123"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value.toUpperCase());
              setError(false);
            }}
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`w-full bg-[#141422] border-2 rounded-[14px] px-4 py-3 text-white text-[15px] placeholder:text-[#5E607E] focus:outline-none transition-all text-center tracking-wider font-semibold ${
              error 
                ? 'border-red-500/60 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' 
                : 'border-[rgba(29,78,216,0.4)] focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)]'
            }`}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-[13px] mt-2 text-center"
            >
              Please enter a valid invite code
            </motion.p>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto"
        >
          <button
            onClick={handleContinue}
            disabled={inviteCode.length < 3 || isVerifying}
            className="w-full bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:from-[#1D4ED8]/30 disabled:to-[#1E40AF]/30 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] py-4 text-[16px] transition-all shadow-[0_6px_32px_rgba(59,130,246,0.6),0_0_0_2px_rgba(96,165,250,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.8),0_0_0_3px_rgba(96,165,250,0.6)] active:scale-95"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Verifying...
              </span>
            ) : (
              'Continue'
            )}
          </button>

          {/* Switch to Premium Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToPremium}
              className="text-[14px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors font-medium group relative"
            >
              Don't have an invite?{' '}
              <span className="underline decoration-[#3B82F6]/40 group-hover:decoration-[#60A5FA]/60 transition-colors">
                Get Premium Access Pass
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
