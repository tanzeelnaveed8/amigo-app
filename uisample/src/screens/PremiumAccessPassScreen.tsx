import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react';

interface PremiumAccessPassScreenProps {
  onPurchase: () => void;
  onBack: () => void;
  onSwitchToInvite: () => void;
}

export const PremiumAccessPassScreen = ({ onPurchase, onBack, onSwitchToInvite }: PremiumAccessPassScreenProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [region] = useState<'IN' | 'INTL'>('IN'); // Can be dynamic based on user location

  const handleContinue = () => {
    setIsProcessing(true);
    // Simulate payment flow
    setTimeout(() => {
      onPurchase();
    }, 1500);
  };

  const price = region === 'IN' ? '₹50' : '$12';
  const features = [
    'Instant account creation',
    'No waiting for invites',
    'One-time payment'
  ];

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
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="w-full max-w-md bg-[#141422] rounded-[28px] p-8 border border-[#2563EB]/40 shadow-[0_10px_40px_rgba(29,78,216,0.35)] relative overflow-hidden"
        >
          {/* Top glow effect */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#1D4ED8] opacity-30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            {/* Crown Icon with Glow */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.3, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-xl"
                />
                {/* Extra glow layer */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.25, 1],
                    opacity: [0.4, 0.2, 0.4]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#3B82F6] rounded-full blur-2xl"
                />
                <div className="relative bg-[#141422] p-5 rounded-full border border-[rgba(29,78,216,0.4)] shadow-[0_0_24px_rgba(29,78,216,0.4)]">
                  <Crown size={32} className="text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
                </div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[28px] font-bold text-white text-center mb-3"
            >
              Premium Access Pass
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[16px] text-[#8B8CAD] text-center mb-6"
            >
              One-time access to create your Amigo account.
            </motion.p>

            {/* Price Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="relative inline-block"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.3, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#3B82F6] blur-2xl"
                />
                <div className="relative text-[48px] font-bold text-[#3B82F6] drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                  {price}
                </div>
              </motion.div>
              <p className="text-[14px] text-[#8B8CAD] mt-1">One-time payment</p>
            </motion.div>

            {/* Features List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0">
                    <CheckCircle 
                      size={18} 
                      className="text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                    />
                  </div>
                  <span className="text-[15px] text-[#8B8CAD]">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Continue Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={handleContinue}
              disabled={isProcessing}
              whileHover={{ 
                scale: 1.02,
                rotate: [0, -1, 1, -1, 0],
                transition: { 
                  rotate: { 
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:from-[#1D4ED8]/30 disabled:to-[#1E40AF]/30 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] py-4 text-[16px] transition-all shadow-[0_6px_32px_rgba(59,130,246,0.6),0_0_0_2px_rgba(96,165,250,0.4)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.8),0_0_0_3px_rgba(96,165,250,0.6)] relative overflow-hidden"
            >
              {/* Shine effect */}
              {!isProcessing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  animate={{ x: [-200, 200] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              )}
              
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                'Continue to Payment'
              )}
            </motion.button>

            {/* Switch to Invite Link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-6 text-center"
            >
              <button
                onClick={onSwitchToInvite}
                className="text-[14px] text-[#3B82F6] hover:text-[#60A5FA] transition-colors font-medium group relative"
              >
                Have an invite code?{' '}
                <span className="underline decoration-[#3B82F6]/40 group-hover:decoration-[#60A5FA]/60 transition-colors">
                  Enter here
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
