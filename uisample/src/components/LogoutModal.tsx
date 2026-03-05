import React from 'react';
import { LogOut, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDarkMode: boolean;
  themeColor: string;
}

export const LogoutModal = ({ isOpen, onClose, onConfirm, isDarkMode, themeColor }: LogoutModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`w-full max-w-sm rounded-[24px] p-6 ${
                isDarkMode ? 'bg-[#141422]' : 'bg-white'
              }`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <motion.div 
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20,
                  delay: 0.1 
                }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  <LogOut size={40} className="text-[#EF4444]" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2 
                className={`text-[22px] font-bold text-center mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Log Out?
              </motion.h2>

              {/* Description */}
              <motion.p 
                className={`text-[15px] text-center mb-6 ${
                  isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Are you sure you want to log out of your account?
              </motion.p>

              {/* Info Box */}
              <motion.div 
                className={`rounded-[14px] p-4 mb-6 ${
                  isDarkMode ? 'bg-[#1A1A2E] border border-white/5' : 'bg-gray-50 border border-gray-200/60'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} style={{ color: themeColor }} className="flex-shrink-0 mt-0.5" />
                  <p className={`text-[13px] ${
                    isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'
                  }`}>
                    You'll need to log in again to access your account and messages.
                  </p>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <motion.button
                  onClick={onConfirm}
                  className="w-full py-4 rounded-[16px] bg-[#EF4444] text-white font-bold text-[16px] shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Yes, Log Out
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className={`w-full py-4 rounded-[16px] font-bold text-[16px] ${
                    isDarkMode 
                      ? 'bg-[#1A1A2E] text-white hover:bg-[#1F1F33]' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
