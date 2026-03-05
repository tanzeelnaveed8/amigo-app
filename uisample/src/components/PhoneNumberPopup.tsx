import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Ghost, Phone } from 'lucide-react';

interface PhoneNumberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (phoneNumber: string) => void;
}

export const PhoneNumberPopup = ({ isOpen, onClose, onVerify }: PhoneNumberPopupProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isChecking, setIsChecking] = useState(false);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setCountryCode('+1');
      setIsChecking(false);
    }
  }, [isOpen]);

  const handleVerify = () => {
    if (phoneNumber.length >= 10) {
      setIsChecking(true);
      // Simulate checking - parent will handle navigation
      setTimeout(() => {
        onVerify(`${countryCode}${phoneNumber}`);
      }, 1500);
    }
  };

  const handleClose = () => {
    if (!isChecking) {
      onClose();
    }
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          />

          {/* Center Popup */}
          <div className="fixed inset-0 flex items-center justify-center z-50 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#0A0A14] rounded-[28px] w-full max-w-[400px] shadow-[0_20px_60px_rgba(155,123,255,0.3)] border border-[rgba(155,123,255,0.2)] relative overflow-hidden"
            >
              {/* Soft glow effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#9B7BFF] opacity-20 blur-3xl rounded-full pointer-events-none" />

              {/* Content */}
              <div className="relative px-6 py-8">
                {!isChecking ? (
                  <>
                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className="absolute top-4 right-4 p-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>

                    {/* Ghost Icon */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                      >
                        {/* Glow */}
                        <motion.div
                          animate={{ 
                            scale: phoneNumber.length >= 10 ? [1, 1.2, 1] : [1, 1.1, 1],
                            opacity: phoneNumber.length >= 10 ? [0.7, 0.5, 0.7] : [0.5, 0.3, 0.5]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-xl"
                        />
                        {/* Extra glow layer when active */}
                        {phoneNumber.length >= 10 && (
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
                        <Ghost 
                          size={32} 
                          className={`relative transition-all duration-300 ${
                            phoneNumber.length >= 10 
                              ? 'text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,1)]' 
                              : 'text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                          }`} 
                        />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h2 className="text-[22px] font-bold text-white text-center mb-6">
                      Enter your mobile number
                    </h2>

                    {/* Phone Input */}
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        {/* Country Code */}
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-[#141422] border border-[rgba(29,78,216,0.4)] rounded-[14px] px-3 py-3 text-white text-[15px] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all w-20"
                        >
                          <option value="+1">+1</option>
                          <option value="+91">+91</option>
                          <option value="+44">+44</option>
                        </select>

                        {/* Phone Number */}
                        <div className="flex-1 relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Phone size={18} className="text-[#3B82F6] drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                          </div>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-[#141422] border border-[rgba(29,78,216,0.4)] rounded-[14px] px-3 pl-10 py-3 text-white text-[15px] placeholder:text-[#5E607E] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                          />
                        </div>
                      </div>

                      {/* Verify Button */}
                      <button
                        onClick={handleVerify}
                        disabled={phoneNumber.length < 10}
                        className="w-full bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:from-[#1D4ED8]/30 disabled:to-[#1E40AF]/30 disabled:cursor-not-allowed text-white font-semibold rounded-[14px] py-3 text-[15px] transition-all shadow-[0_4px_24px_rgba(29,78,216,0.5),0_0_0_1px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_28px_rgba(29,78,216,0.6),0_0_0_1px_rgba(59,130,246,0.5)]"
                      >
                        Verify
                      </button>
                    </div>
                  </>
                ) : (
                  /* Checking State */
                  <div className="py-8 text-center">
                    <div className="mb-6">
                      <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                    </div>
                    <p className="text-white text-[16px] font-medium">Checking account...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};