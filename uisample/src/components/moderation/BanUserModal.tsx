import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { GhostButton } from '../ui/ghost-button';

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export const BanUserModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userName 
}: BanUserModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              className="bg-[#0A0A14] rounded-[24px] w-full max-w-[400px] shadow-[0_20px_60px_rgba(255,99,99,0.5)] border border-[rgba(255,99,99,0.4)] relative overflow-hidden pointer-events-auto"
            >
              {/* Animated Glow effect */}
              <motion.div 
                animate={{ 
                  opacity: [0.2, 0.35, 0.2],
                  scale: [1, 1.15, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF6363] blur-3xl rounded-full pointer-events-none" 
              />

              <div className="relative px-6 py-6">
                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
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
                        opacity: [0.6, 0.35, 0.6]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-[#FF6363] rounded-full blur-xl"
                    />
                    <motion.div 
                      animate={{ 
                        rotate: [0, -8, 8, -8, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3,
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                      className="relative bg-[#141422] p-3 rounded-full border border-[rgba(255,99,99,0.4)] shadow-[0_0_20px_rgba(255,99,99,0.4)]"
                    >
                      <Ban size={24} className="text-[#FF6363] drop-shadow-[0_0_10px_rgba(255,99,99,0.9)]" />
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
                  Block User
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-[14px] text-[#C5C6E3] text-center mb-6"
                >
                  Hide all messages from <span className="text-[#FF6363] font-semibold">{userName}</span>?
                </motion.p>

                {/* Warning */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#FF6363]/10 border border-[rgba(255,99,99,0.3)] rounded-xl p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <AlertTriangle size={18} className="text-[#FF6363] mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                        className="text-[13px] text-[#C5C6E3] leading-relaxed"
                      >
                        • Their messages will be hidden from your view only
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-[13px] text-[#C5C6E3] leading-relaxed"
                      >
                        • Other users can still see their messages
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                        className="text-[13px] text-[#C5C6E3] leading-relaxed"
                      >
                        • They won't know you blocked them
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
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
                      onClick={onClose}
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
                      className="bg-gradient-to-r from-[#FF6363] to-[#FF4F4F] hover:from-[#FF4F4F] hover:to-[#FF3B3B] shadow-[0_0_24px_rgba(255,99,99,0.5)] hover:shadow-[0_0_32px_rgba(255,99,99,0.7)] transition-all"
                    >
                      Block User
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