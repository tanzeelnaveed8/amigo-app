import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Copy, Check, Sparkles, Ticket } from 'lucide-react';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeGradient: string;
}

interface InviteCode {
  id: string;
  code: string;
  createdAt: Date;
}

export const InviteCodeModal = ({
  isOpen,
  onClose,
  isDarkMode,
  themeColor,
}: InviteCodeModalProps) => {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const MAX_INVITES = 3;

  const generateInviteCode = () => {
    if (inviteCodes.length >= MAX_INVITES) return;

    const code = `AMIGO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newCode: InviteCode = {
      id: Date.now().toString(),
      code,
      createdAt: new Date(),
    };

    setInviteCodes([...inviteCodes, newCode]);
  };

  const copyToClipboard = (code: string, id: string) => {
    // Fallback function using deprecated execCommand which often works in sandboxed iframes
    const legacyCopy = () => {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textArea);
    };

    // Try modern API first, but handle permissions errors gracefully
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          legacyCopy();
        });
    } else {
      legacyCopy();
    }
  };

  const remainingInvites = MAX_INVITES - inviteCodes.length;
  const progress = inviteCodes.length / MAX_INVITES;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={`w-full max-w-md rounded-[40px] overflow-hidden relative border shadow-2xl ${
                isDarkMode 
                  ? 'bg-[#141422] border-white/10' 
                  : 'bg-white border-white/60'
              }`}
              style={{
                background: isDarkMode 
                  ? 'linear-gradient(145deg, #1A1A2E, #141422)' 
                  : 'linear-gradient(145deg, #FFFFFF, #F8F9FA)',
                boxShadow: isDarkMode
                  ? `0 24px 64px -12px rgba(0,0,0,0.5), 0 0 0 1px ${themeColor}15`
                  : '0 24px 64px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)',
              }}
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 pb-4 relative">
                {/* Decorative background blur */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                  style={{ background: themeColor }}
                />

                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <motion.div
                      className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                      style={{
                        background: `linear-gradient(135deg, ${themeColor}, ${themeColor}DD)`,
                        boxShadow: `0 10px 25px -5px ${themeColor}50`,
                      }}
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="absolute inset-0 rounded-2xl border border-white/20" />
                      <UserPlus size={26} className="text-white drop-shadow-sm" />
                    </motion.div>
                    <div>
                      <h2
                        className={`text-[22px] font-bold tracking-tight mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Invite Friends
                      </h2>
                      <p
                        className={`text-[14px] font-medium tracking-wide ${
                          isDarkMode ? 'text-white/60' : 'text-gray-500'
                        }`}
                      >
                        {remainingInvites} invite{remainingInvites !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all border"
                    style={{
                      backgroundColor: isDarkMode
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.03)',
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'transparent'
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} className={isDarkMode ? 'text-white/60' : 'text-gray-400'} />
                  </motion.button>
                </div>

                {/* Refined Progress bar */}
                <div className="relative mx-1">
                  <div
                    className="w-full h-[6px] rounded-full overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{
                        background:
                          progress >= 1
                            ? 'linear-gradient(90deg, #EF4444, #F87171)'
                            : themeColor,
                        boxShadow: `0 0 10px ${progress >= 1 ? '#EF4444' : themeColor}40`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                    >
                        {/* Shimmer effect on progress bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 pt-4">
                {/* Simplified Info Text */}
                <p
                  className={`text-[14px] leading-relaxed mb-8 px-1 font-medium ${
                    isDarkMode ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  Who’s your favorite? 🌟 Send a code to someone who matters most. These invites are single-use, so save them for the real ones!
                </p>

                {/* Codes List - Premium Card Design */}
                <div className="space-y-4 mb-8 min-h-[10px]">
                    <AnimatePresence mode="popLayout">
                    {inviteCodes.map((invite) => (
                      <motion.div
                        key={invite.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                      >
                        <div 
                            className={`rounded-2xl p-4 flex items-center justify-between gap-4 group transition-all duration-200 border ${
                                isDarkMode 
                                ? 'bg-[#1C1C2E]/60 border-white/5 hover:bg-[#1C1C2E]' 
                                : 'bg-white border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-6px_rgba(0,0,0,0.08)]'
                            }`}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div 
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                        isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                                    }`}
                                >
                                    <Ticket size={18} style={{ color: themeColor, opacity: 0.9 }} />
                                </div>
                                <div className="flex flex-col">
                                    <p className={`font-mono text-[15px] font-bold tracking-wider ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {invite.code}
                                    </p>
                                    <span className={`text-[11px] font-medium ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                                        Single-use invite
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => copyToClipboard(invite.code, invite.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                    copiedId === invite.id
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : isDarkMode 
                                            ? 'bg-white/5 text-white/80 hover:bg-white/10' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                {copiedId === invite.id ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Check size={18} strokeWidth={2.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Copy size={18} strokeWidth={2.5} />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    </AnimatePresence>
                </div>

                {/* Generate Button - Premium & Tactile */}
                <motion.button
                  onClick={generateInviteCode}
                  disabled={remainingInvites === 0}
                  className="w-full py-4 rounded-2xl font-bold text-[16px] relative overflow-hidden group"
                  style={
                    remainingInvites > 0
                      ? {
                          backgroundColor: themeColor,
                          color: 'white',
                          boxShadow: `0 8px 20px -6px ${themeColor}60`,
                        }
                      : {
                          backgroundColor: isDarkMode
                            ? 'rgba(255,255,255,0.04)'
                            : 'rgba(0,0,0,0.04)',
                          color: isDarkMode ? '#5E607E' : '#B0B0B0',
                          cursor: 'not-allowed',
                          boxShadow: 'none'
                        }
                  }
                  whileHover={remainingInvites > 0 ? { scale: 1.02, y: -2 } : {}}
                  whileTap={remainingInvites > 0 ? { scale: 0.98, y: 0 } : {}}
                >
                  {remainingInvites > 0 && (
                     <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <span className="flex items-center justify-center gap-2.5 relative z-10">
                    {remainingInvites === 0 ? (
                      'Limit Reached'
                    ) : (
                      <>
                        <Sparkles size={18} className="animate-pulse" />
                        Generate Code
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
