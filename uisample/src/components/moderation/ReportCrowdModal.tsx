import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flag, Check, AlertTriangle, Shield } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { GhostButton } from '../ui/ghost-button';

interface ReportCrowdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other', details?: string) => void;
  crowdName: string;
}

export const ReportCrowdModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  crowdName 
}: ReportCrowdModalProps) => {
  const [selectedReason, setSelectedReason] = useState<'spam' | 'harassment' | 'hate' | 'sexual' | 'other'>('spam');
  const [details, setDetails] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    onSubmit(selectedReason, details || undefined);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setDetails('');
      setSelectedReason('spam');
      onClose();
    }, 2500);
  };

  const handleClose = () => {
    if (!showSuccess) {
      setDetails('');
      setSelectedReason('spam');
      onClose();
    }
  };

  const reasons = [
    { value: 'spam', label: 'Spam / Scam', description: 'This crowd is used for spam or scams', icon: '🚫' },
    { value: 'harassment', label: 'Harassment / Abuse', description: 'Bullying or abusive behavior in this crowd', icon: '⚠️' },
    { value: 'hate', label: 'Hate / Violence', description: 'Hateful or violent content in this crowd', icon: '💢' },
    { value: 'sexual', label: 'Sexual Content', description: 'Inappropriate sexual material', icon: '🔞' },
    { value: 'other', label: 'Other', description: 'Something else that violates guidelines', icon: '📋' },
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
              className="bg-[#0A0A14] rounded-[20px] w-full max-w-[420px] shadow-[0_20px_60px_rgba(255,99,99,0.5)] border border-[rgba(255,99,99,0.3)] relative overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Animated Glow effect */}
              <motion.div 
                animate={{ 
                  opacity: [0.15, 0.3, 0.15],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 bg-[#FF6363] blur-3xl rounded-full pointer-events-none" 
              />

              <AnimatePresence mode="wait">
                {!showSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8"
                  >
                    {/* Close button */}
                    <motion.button
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.15 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full hover:bg-white/5 z-10"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </motion.button>

                    {/* Icon */}
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                      className="flex justify-center mb-3 sm:mb-4"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.25, 1],
                            opacity: [0.5, 0.25, 0.5]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2.5,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-[#FF6363] rounded-full blur-xl"
                        />
                        <motion.div 
                          animate={{ 
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.08, 1]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3.5,
                            ease: "easeInOut",
                            repeatDelay: 1.5
                          }}
                          className="relative bg-[#141422] p-3 sm:p-4 rounded-full border border-[rgba(255,99,99,0.4)] shadow-[0_0_20px_rgba(255,99,99,0.4)]"
                        >
                          <Flag size={24} className="sm:size-[28px] text-[#FF6363] drop-shadow-[0_0_10px_rgba(255,99,99,0.9)]" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-[20px] sm:text-[24px] font-bold text-white text-center mb-1.5 sm:mb-2"
                    >
                      Report Crowd
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="text-[13px] sm:text-[14px] text-[#C5C6E3] text-center mb-4 sm:mb-6"
                    >
                      Report <span className="text-[#FF6363] font-semibold">{crowdName}</span> for policy violations
                    </motion.p>

                    {/* Info Banner */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#FF6363]/10 border border-[rgba(255,99,99,0.2)] rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-5 flex items-start gap-2"
                    >
                      <Shield size={16} className="text-[#FF6363] mt-0.5 shrink-0" />
                      <p className="text-[11px] sm:text-[12px] text-[#C5C6E3] leading-relaxed">
                        Reports are anonymous and help keep our community safe
                      </p>
                    </motion.div>

                    {/* Reason selection */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5"
                    >
                      <RadioGroup value={selectedReason} onValueChange={(value) => setSelectedReason(value as any)}>
                        {reasons.map((reason, index) => (
                          <motion.label
                            key={reason.value}
                            htmlFor={reason.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                              selectedReason === reason.value
                                ? 'bg-[#FF6363]/10 border-[#FF6363]/50 shadow-[0_0_20px_rgba(255,99,99,0.15)]'
                                : 'bg-[#141422] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,99,99,0.3)]'
                            }`}
                          >
                            <RadioGroupItem
                              value={reason.value}
                              id={reason.value}
                              className={`mt-0.5 ${
                                selectedReason === reason.value
                                  ? 'border-[#FF6363] bg-[#FF6363]'
                                  : 'border-[#5E607E] bg-transparent'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="text-[14px] sm:text-[15px] font-medium text-white mb-0.5 flex items-center gap-1.5 sm:gap-2">
                                <span>{reason.icon}</span>
                                <span>{reason.label}</span>
                              </div>
                              <div className="text-[11px] sm:text-[12px] text-[#8B8CAD]">
                                {reason.description}
                              </div>
                            </div>
                          </motion.label>
                        ))}
                      </RadioGroup>
                    </motion.div>

                    {/* Optional details */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 }}
                      className="mb-5 sm:mb-6"
                    >
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Add additional details (optional)..."
                        maxLength={500}
                        aria-label="Additional report details"
                        className="w-full bg-[#141422] border border-[rgba(255,99,99,0.2)] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-[13px] sm:text-[14px] placeholder:text-[#5E607E] focus:outline-none focus:border-[#FF6363] focus:shadow-[0_0_0_3px_rgba(255,99,99,0.15)] transition-all resize-none min-h-[60px] focus:min-h-[100px]"
                      />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-between items-center mt-1.5 sm:mt-2 px-1"
                      >
                        <span className="text-[10px] sm:text-[11px] text-[#5E607E]">
                          Optional but helpful for our review
                        </span>
                        <motion.span 
                          className={`text-[10px] sm:text-[11px] font-medium ${
                            details.length > 450 
                              ? 'text-[#FF6363]' 
                              : details.length > 350 
                                ? 'text-[#FFA500]' 
                                : 'text-[#5E607E]'
                          }`}
                          animate={details.length > 450 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {details.length}/500
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    {/* Submit button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.75 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <GhostButton
                        fullWidth
                        size="lg"
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-[#FF6363] to-[#FF4F4F] hover:from-[#FF4F4F] hover:to-[#FF3B3B] shadow-[0_0_24px_rgba(255,99,99,0.4)] hover:shadow-[0_0_32px_rgba(255,99,99,0.6)] transition-all"
                      >
                        Submit Report
                      </GhostButton>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* Success State */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="relative px-6 py-12 text-center"
                  >
                    {/* Success icon with layered animations */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
                      className="flex justify-center mb-6"
                    >
                      <div className="relative">
                        {/* Expanding rings */}
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="absolute inset-0 bg-[#4ADE80] rounded-full blur-md"
                        />
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                          className="absolute inset-0 bg-[#4ADE80] rounded-full blur-sm"
                        />
                        
                        {/* Pulsing glow */}
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 0.3, 0.6]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 bg-[#4ADE80] rounded-full blur-xl"
                        />
                        
                        {/* Icon container */}
                        <motion.div 
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                          }}
                          transition={{ 
                            duration: 0.5,
                            ease: "easeInOut",
                            delay: 0.3
                          }}
                          className="relative bg-[#4ADE80]/20 p-5 rounded-full border-2 border-[#4ADE80]/50 shadow-[0_0_32px_rgba(74,222,128,0.5)]"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 300, delay: 0.4 }}
                          >
                            <Check size={36} className="text-[#4ADE80] drop-shadow-[0_0_16px_rgba(74,222,128,1)]" strokeWidth={3} />
                          </motion.div>
                        </motion.div>

                        {/* Floating particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ 
                              scale: 0,
                              x: 0,
                              y: 0,
                              opacity: 0 
                            }}
                            animate={{ 
                              scale: [0, 1, 0],
                              x: Math.cos((i * Math.PI * 2) / 6) * 60,
                              y: Math.sin((i * Math.PI * 2) / 6) * 60,
                              opacity: [0, 1, 0]
                            }}
                            transition={{ 
                              duration: 1,
                              delay: 0.3 + i * 0.05,
                              ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#4ADE80] rounded-full"
                            style={{ marginLeft: -4, marginTop: -4 }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Success text */}
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-[24px] font-bold text-white mb-3"
                    >
                      Thanks for reporting
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-[15px] text-[#C5C6E3] max-w-xs mx-auto leading-relaxed"
                    >
                      Our team will review this crowd. We take safety seriously and appreciate your help.
                    </motion.p>

                    {/* Success badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 }}
                      className="mt-6 inline-flex items-center gap-2 bg-[#4ADE80]/10 border border-[#4ADE80]/30 rounded-full px-4 py-2"
                    >
                      <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse" />
                      <span className="text-[13px] text-[#4ADE80] font-medium">Report submitted</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};