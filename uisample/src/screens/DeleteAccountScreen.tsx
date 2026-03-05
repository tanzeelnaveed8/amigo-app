import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteAccountScreenProps {
  onBack: () => void;
  onDeleteAccount: () => void;
  isDarkMode: boolean;
  themeColor: string;
}

export const DeleteAccountScreen = ({ onBack, onDeleteAccount, isDarkMode, themeColor }: DeleteAccountScreenProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleProceed = () => {
    setStep(2);
  };

  const handleDelete = () => {
    if (confirmText.toLowerCase() === 'delete') {
      setShowConfirmation(true);
    }
  };

  const handleFinalDelete = () => {
    onDeleteAccount();
  };

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'} transition-colors duration-300`}>
      {/* Header */}
      <motion.div 
        className={`px-5 pt-4 pb-4 ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'} border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200/60'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mt-2">
          <motion.button 
            onClick={onBack}
            className={`p-2 -ml-2 rounded-xl transition-all duration-200 ${
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go back"
          >
            <ArrowLeft size={24} className={`${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'}`} />
          </motion.button>
          <motion.h1 
            className={`text-[20px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Delete Account
          </motion.h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Warning Icon */}
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/15 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <AlertTriangle size={48} className="text-[#EF4444]" />
              </motion.div>

              <motion.h2 
                className={`text-[24px] font-bold text-center mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Are you sure?
              </motion.h2>

              <motion.p 
                className={`text-[15px] text-center mb-8 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Account deletion is a significant action. Your account will enter a deactivated state for 180 days before being permanently removed from our systems.
              </motion.p>

              {/* Warning List */}
              <motion.div 
                className={`rounded-[16px] p-5 mb-8 ${isDarkMode ? 'bg-[#141422]' : 'bg-white'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <h3 className={`text-[13px] font-bold uppercase tracking-wider mb-4 ${
                  isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                }`}>
                  What will happen:
                </h3>
                <div className="space-y-3">
                  {[
                    'You will be logged out of all active sessions',
                    'Your profile will be deactivated for 180 days',
                    'Logging in will automatically reactivate your account',
                    'After 180 days, all data is permanently erased',
                    'Your profile and content will be invisible to others',
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-2 flex-shrink-0" />
                      <p className={`text-[14px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'}`}>
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
              >
                <motion.button
                  onClick={handleProceed}
                  className="w-full py-4 rounded-[14px] bg-[#EF4444] text-white font-bold text-[16px] shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  Proceed with Deactivation
                </motion.button>
                <motion.button
                  onClick={onBack}
                  className={`w-full py-4 rounded-[14px] font-bold text-[16px] ${
                    isDarkMode ? 'bg-[#141422] text-white' : 'bg-white text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Shield Icon */}
              <motion.div 
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/15 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <ShieldAlert size={48} className="text-[#EF4444]" />
              </motion.div>

              <motion.h2 
                className={`text-[24px] font-bold text-center mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Final Confirmation
              </motion.h2>

              <motion.p 
                className={`text-[15px] text-center mb-8 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Type <span className="font-bold text-[#EF4444]">DELETE</span> to confirm
              </motion.p>

              {/* Input Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className={`rounded-[14px] mb-8 overflow-hidden ${
                  isDarkMode ? 'bg-[#141422] border border-white/5' : 'bg-white border border-gray-200/60'
                }`}>
                  <input
                    type="text"
                    placeholder="Type DELETE"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className={`w-full py-4 px-4 bg-transparent outline-none text-[15px] ${
                      isDarkMode ? 'text-white placeholder:text-[#5E607E]' : 'text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </motion.div>

              {/* Warning Box */}
              <motion.div 
                className="rounded-[14px] p-4 mb-8 bg-red-500/10 border border-red-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <p className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'}`}>
                    Upon confirmation, your account will be deactivated. You have a 180-day grace period to restore your account by logging in. If no action is taken, your data will be permanently deleted.
                  </p>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <motion.button
                  onClick={handleDelete}
                  disabled={confirmText.toLowerCase() !== 'delete'}
                  className={`w-full py-4 rounded-[14px] font-bold text-[16px] shadow-lg transition-all duration-200 ${
                    confirmText.toLowerCase() === 'delete'
                      ? 'bg-[#EF4444] text-white'
                      : isDarkMode
                      ? 'bg-[#2A2A3E] text-[#5E607E] cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={confirmText.toLowerCase() === 'delete' ? { scale: 1.02 } : {}}
                  whileTap={confirmText.toLowerCase() === 'delete' ? { scale: 0.98 } : {}}
                  style={confirmText.toLowerCase() === 'delete' ? {
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                  } : {}}
                >
                  Deactivate Account
                </motion.button>
                <motion.button
                  onClick={() => setStep(1)}
                  className={`w-full py-4 rounded-[14px] font-bold text-[16px] ${
                    isDarkMode ? 'bg-[#141422] text-white' : 'bg-white text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Go Back
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`w-full max-w-sm rounded-[20px] p-6 ${
                  isDarkMode ? 'bg-[#141422]' : 'bg-white'
                }`}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
                  <Trash2 size={32} className="text-[#EF4444]" />
                </div>
                <h3 className={`text-[20px] font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Last Chance!
                </h3>
                <p className={`text-[14px] text-center mb-6 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                  This will immediately deactivate your account and log you out. To cancel deletion, simply log back in within the next 180 days. After this period, data recovery is not possible.
                </p>
                <div className="space-y-3">
                  <motion.button
                    onClick={handleFinalDelete}
                    className="w-full py-3.5 rounded-[14px] bg-[#EF4444] text-white font-bold text-[15px]"
                    whileTap={{ scale: 0.98 }}
                  >
                    Confirm Deactivation
                  </motion.button>
                  <motion.button
                    onClick={() => setShowConfirmation(false)}
                    className={`w-full py-3.5 rounded-[14px] font-bold text-[15px] ${
                      isDarkMode ? 'bg-[#1A1A2E] text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
