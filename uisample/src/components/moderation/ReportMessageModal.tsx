import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Shield, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { GhostButton } from '../ui/ghost-button';

interface ReportMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other', details?: string) => void;
  messagePreview?: string;
}

export const ReportMessageModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  messagePreview 
}: ReportMessageModalProps) => {
  const [selectedReason, setSelectedReason] = useState<'spam' | 'harassment' | 'hate' | 'sexual' | 'other'>('spam');
  const [details, setDetails] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    onSubmit(selectedReason, details || undefined);
    setShowSuccess(true);
    
    // Auto-close after showing success
    setTimeout(() => {
      setShowSuccess(false);
      setDetails('');
      setSelectedReason('spam');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!showSuccess) {
      setDetails('');
      setSelectedReason('spam');
      onClose();
    }
  };

  const reasons = [
    { value: 'spam', label: 'Spam / Scam', description: 'Unwanted promotional content or scams' },
    { value: 'harassment', label: 'Harassment / Abuse', description: 'Bullying or abusive behavior' },
    { value: 'hate', label: 'Hate / Violence', description: 'Hateful or violent content' },
    { value: 'sexual', label: 'Sexual Content', description: 'Inappropriate sexual material' },
    { value: 'other', label: 'Other', description: 'Something else that violates guidelines' },
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
              transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.05 }}
              className="bg-[#0A0A14] rounded-[20px] w-full max-w-[420px] shadow-[0_20px_60px_rgba(155,123,255,0.4)] border border-[rgba(155,123,255,0.3)] relative overflow-hidden pointer-events-auto"
            >
              {/* Animated Glow effect */}
              <motion.div 
                animate={{ 
                  opacity: [0.15, 0.25, 0.15],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#9B7BFF] blur-3xl rounded-full pointer-events-none" 
              />

              <AnimatePresence mode="wait">
                {!showSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="relative px-5 py-5"
                  >
                    {/* Close button */}
                    <motion.button
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleClose}
                      className="absolute top-3 right-3 p-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full hover:bg-white/5 z-10"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </motion.button>

                    {/* Icon */}
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                      className="flex justify-center mb-3"
                    >
                      <div className="relative">
                        {/* Animated glow */}
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
                          className="absolute inset-0 bg-[#FF6363] rounded-full blur-xl"
                        />
                        <motion.div 
                          animate={{ rotate: [0, -5, 5, -5, 0] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "easeInOut",
                            repeatDelay: 2
                          }}
                          className="relative bg-[#141422] p-2.5 rounded-full border border-[rgba(255,99,99,0.3)] shadow-[0_0_20px_rgba(255,99,99,0.3)]"
                        >
                          <AlertTriangle size={20} className="text-[#FF6363] drop-shadow-[0_0_10px_rgba(255,99,99,0.9)]" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h2 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-[20px] font-bold text-white text-center mb-1"
                    >
                      Report Message
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-[13px] text-[#8B8CAD] text-center mb-4"
                    >
                      Help us keep this crowd safe
                    </motion.p>

                    {/* Message preview (optional) */}
                    {messagePreview && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-[#141422] border border-[rgba(255,255,255,0.05)] rounded-xl p-2.5 mb-4"
                      >
                        <p className="text-[12px] text-[#C5C6E3] line-clamp-2 italic">
                          "{messagePreview}"
                        </p>
                      </motion.div>
                    )}

                    {/* Reason selection */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-2 mb-4"
                    >
                      <RadioGroup value={selectedReason} onValueChange={(value) => setSelectedReason(value as any)}>
                        {reasons.map((reason, index) => (
                          <motion.label
                            key={reason.value}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              selectedReason === reason.value
                                ? 'bg-[#9B7BFF]/10 border-[#9B7BFF]/50 shadow-[0_0_16px_rgba(155,123,255,0.2)]'
                                : 'bg-[#141422] border-[rgba(255,255,255,0.05)] hover:border-[rgba(155,123,255,0.3)]'
                            }`}
                          >
                            <RadioGroupItem
                              value={reason.value}
                              id={reason.value}
                              className={`mt-0.5 ${
                                selectedReason === reason.value
                                  ? 'border-[#9B7BFF] bg-[#9B7BFF]'
                                  : 'border-[#5E607E] bg-transparent'
                              }`}
                            />
                            <div className="flex-1">
                              <div className="text-[14px] font-medium text-white mb-0.5">
                                {reason.label}
                              </div>
                              <div className="text-[11px] text-[#8B8CAD]">
                                {reason.description}
                              </div>
                            </div>
                          </motion.label>
                        ))}
                      </RadioGroup>
                    </motion.div>

                    {/* Optional details */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-5"
                    >
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Add details (optional)"
                        maxLength={500}
                        className="w-full bg-[#141422] border border-[rgba(155,123,255,0.2)] rounded-xl px-3 py-2.5 text-white text-[13px] placeholder:text-[#5E607E] focus:outline-none focus:border-[#9B7BFF] focus:shadow-[0_0_0_3px_rgba(155,123,255,0.15)] transition-all resize-none h-16"
                      />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-between items-center mt-1 px-1"
                      >
                        <span className="text-[10px] text-[#5E607E]">
                          Optional but helpful
                        </span>
                        <span className="text-[10px] text-[#5E607E]">
                          {details.length}/500
                        </span>
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
                      Our team will review this message. We take safety seriously and appreciate your help.
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