import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Ticket, BadgeCheck } from 'lucide-react';

interface AccessRequiredScreenProps {
  onSelectInviteCode: () => void;
  onSelectPremiumPass: () => void;
  onBack: () => void;
}

export const AccessRequiredScreen = ({ 
  onSelectInviteCode, 
  onSelectPremiumPass, 
  onBack 
}: AccessRequiredScreenProps) => {
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
          {/* Animated Lock/Key Icon */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
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
              <div className="relative bg-[#141422] p-5 rounded-full border border-[rgba(29,78,216,0.3)] shadow-[0_0_20px_rgba(29,78,216,0.3)]">
                <BadgeCheck size={32} className="text-[#3B82F6] drop-shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
              </div>
            </motion.div>
          </motion.div>

          <h1 className="text-[28px] font-bold text-white text-center mb-3">
            Access Required
          </h1>
          <p className="text-[16px] text-[#8B8CAD] text-center max-w-sm leading-[22px]">
            Create your Amigo account using an invite code or Premium Access Pass.
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4">
          {/* Invite Code Option */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectInviteCode}
            className="group w-full bg-[#141422] rounded-[20px] p-6 border border-[rgba(29,78,216,0.3)] hover:border-[#2563EB] min-h-[140px] flex flex-col justify-center text-left transition-all hover:shadow-[0_8px_32px_rgba(29,78,216,0.3)] relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 to-[#1D4ED8]/0 group-hover:from-[#2563EB]/5 group-hover:to-[#1D4ED8]/10 transition-all duration-300" />
            
            <div className="flex flex-row items-center mb-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#1D4ED8]/20 group-hover:bg-[#2563EB]/30 border border-[rgba(29,78,216,0.3)] group-hover:border-[#2563EB]/50 flex items-center justify-center mr-4 shrink-0 transition-all duration-300 shadow-[0_0_20px_rgba(29,78,216,0.2)] group-hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                <Ticket size={28} className="text-[#3B82F6] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300" />
              </div>
              <span className="text-[20px] font-semibold text-white flex-1 leading-tight">
                Enter Invite Code
              </span>
            </div>
            <p className="text-[14px] text-[#8B8CAD] leading-[20px] relative z-10">
              Have an invite code from a friend? Use it to create your account.
            </p>
          </motion.button>

          {/* Premium Access Pass Option */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectPremiumPass}
            className="group w-full bg-[#141422] rounded-[20px] p-6 border border-[rgba(29,78,216,0.3)] hover:border-[#2563EB] min-h-[140px] flex flex-col justify-center text-left transition-all hover:shadow-[0_8px_32px_rgba(29,78,216,0.3)] relative overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 to-[#1D4ED8]/0 group-hover:from-[#2563EB]/5 group-hover:to-[#1D4ED8]/10 transition-all duration-300" />
            
            <div className="flex flex-row items-center mb-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#1D4ED8]/20 group-hover:bg-[#2563EB]/30 border border-[rgba(29,78,216,0.3)] group-hover:border-[#2563EB]/50 flex items-center justify-center mr-4 shrink-0 transition-all duration-300 shadow-[0_0_20px_rgba(29,78,216,0.2)] group-hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                <BadgeCheck size={28} className="text-[#3B82F6] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300" />
              </div>
              <span className="text-[20px] font-semibold text-white flex-1 leading-tight">
                Get Premium Access Pass
              </span>
            </div>
            <p className="text-[14px] text-[#8B8CAD] leading-[20px] relative z-10">
              Get instant access to create your Amigo account.
            </p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};