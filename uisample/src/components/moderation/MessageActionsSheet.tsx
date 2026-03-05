import React from 'react';
import { motion } from 'motion/react';
import { Copy, Flag, X } from 'lucide-react';
import { Message } from '../../stores/useChatStore';

interface MessageActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onCopy: () => void;
  onReport: () => void;
  isOwnMessage?: boolean;
}

export const MessageActionsSheet = ({
  isOpen,
  onClose,
  message,
  onCopy,
  onReport,
  isOwnMessage = false
}: MessageActionsSheetProps) => {
  if (!isOpen || !message) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A14] border-t border-[rgba(155,123,255,0.2)] rounded-t-[28px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-w-[480px] mx-auto"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#5E607E] rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* Message preview */}
          <div className="bg-[#141422] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 mb-4">
            <p className="text-[13px] text-[#C5C6E3] line-clamp-3">
              {message.text || '[Media message]'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Copy */}
            <button
              onClick={() => {
                onCopy();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#141422] border border-[rgba(255,255,255,0.05)] hover:bg-[#1A1A2E] hover:border-[rgba(155,123,255,0.3)] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#9B7BFF]/10 border border-[rgba(155,123,255,0.2)] flex items-center justify-center group-hover:bg-[#9B7BFF]/20 transition-colors">
                <Copy size={18} className="text-[#9B7BFF]" />
              </div>
              <span className="text-[15px] font-medium text-white">
                Copy Message
              </span>
            </button>

            {/* Report (only if not own message) */}
            {!isOwnMessage && (
              <button
                onClick={() => {
                  onReport();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#141422] border border-[rgba(255,255,255,0.05)] hover:bg-[#1A1A2E] hover:border-[rgba(255,99,99,0.3)] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6363]/10 border border-[rgba(255,99,99,0.2)] flex items-center justify-center group-hover:bg-[#FF6363]/20 transition-colors">
                  <Flag size={18} className="text-[#FF6363]" />
                </div>
                <span className="text-[15px] font-medium text-white">
                  Report Message
                </span>
              </button>
            )}
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-transparent text-[#8B8CAD] hover:text-white transition-colors"
          >
            <X size={18} />
            <span className="text-[14px] font-medium">Cancel</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
