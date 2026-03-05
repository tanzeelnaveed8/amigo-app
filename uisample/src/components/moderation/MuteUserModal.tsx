import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, VolumeX, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { GhostButton } from '../ui/ghost-button';

interface MuteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duration: 'hour' | 'day' | 'permanent') => void;
  userName: string;
}

export const MuteUserModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userName 
}: MuteUserModalProps) => {
  const [duration, setDuration] = useState<'hour' | 'day' | 'permanent'>('hour');

  const handleConfirm = () => {
    onConfirm(duration);
    setDuration('hour'); // Reset
    onClose();
  };

  const handleClose = () => {
    setDuration('hour');
    onClose();
  };

  const durations = [
    { value: 'hour', label: '1 Hour', description: 'User can send messages after 1 hour' },
    { value: 'day', label: '24 Hours', description: 'User can send messages after 24 hours' },
    { value: 'permanent', label: 'Permanent', description: 'User cannot send messages until unmuted' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="bg-[#0A0A14] rounded-[24px] w-full max-w-[400px] shadow-[0_20px_60px_rgba(251,191,36,0.4)] border border-[rgba(251,191,36,0.3)] relative overflow-hidden pointer-events-auto"
            >
              {/* Animated Glow effect */}
              <motion.div 
                animate={{ 
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.15, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FBBF24] blur-3xl rounded-full pointer-events-none" 
              />

              <div className="relative px-6 py-6">
                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full hover:bg-white/5 z-10"
                  aria-label="Close"
                >
                  <X size={20} />
                </motion.button>

                {/* Icon */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.25, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-[#FBBF24] rounded-full blur-xl"
                    />
                    <motion.div 
                      animate={{ 
                        rotate: [0, -5, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3,
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                      className="relative bg-[#141422] p-3 rounded-full border border-[rgba(251,191,36,0.3)] shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      <VolumeX size={24} className="text-[#FBBF24] drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[22px] font-bold text-white text-center mb-2"
                >
                  Mute Member
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-[14px] text-[#8B8CAD] text-center mb-6"
                >
                  Mute <span className="text-[#FBBF24] font-semibold">{userName}</span> from sending messages
                </motion.p>

                {/* Duration selection */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 mb-6"
                >
                  <RadioGroup value={duration} onValueChange={(value) => setDuration(value as any)}>
                    {durations.map((dur, index) => (
                      <motion.label
                        key={dur.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          duration === dur.value
                            ? 'bg-[#FBBF24]/10 border-[#FBBF24]/50 shadow-[0_0_16px_rgba(251,191,36,0.2)]'
                            : 'bg-[#141422] border-[rgba(255,255,255,0.05)] hover:border-[rgba(251,191,36,0.3)]'
                        }`}
                      >
                        <RadioGroupItem
                          value={dur.value}
                          id={dur.value}
                          className={`mt-0.5 ${
                            duration === dur.value
                              ? 'border-[#FBBF24] bg-[#FBBF24]'
                              : 'border-[#5E607E] bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-[15px] font-medium text-white mb-0.5">
                            {dur.label}
                          </div>
                          <div className="text-[12px] text-[#8B8CAD]">
                            {dur.description}
                          </div>
                        </div>
                      </motion.label>
                    ))}
                  </RadioGroup>
                </motion.div>

                {/* Info box */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-[#FBBF24]/10 border border-[rgba(251,191,36,0.2)] rounded-xl p-3 mb-6 flex items-start gap-2"
                >
                  <AlertCircle size={16} className="text-[#FBBF24] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[#C5C6E3] leading-relaxed">
                    Muted members stay in the crowd but cannot send messages
                  </p>
                </motion.div>

                {/* Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex gap-3"
                >
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <GhostButton
                      variant="ghost"
                      size="lg"
                      fullWidth
                      onClick={handleClose}
                    >
                      Cancel
                    </GhostButton>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <GhostButton
                      size="lg"
                      fullWidth
                      onClick={handleConfirm}
                      className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] shadow-[0_0_24px_rgba(251,191,36,0.4)] hover:shadow-[0_0_32px_rgba(251,191,36,0.6)] text-black font-semibold transition-all"
                    >
                      Mute Member
                    </GhostButton>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};