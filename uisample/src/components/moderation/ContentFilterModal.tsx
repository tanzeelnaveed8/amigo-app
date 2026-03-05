import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { GhostButton } from '../ui/ghost-button';

interface ContentFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'scam' | 'sexual' | 'hate' | 'violence' | 'drugs' | 'personal_info';
  flagReason?: string;
  context: 'username' | 'crowd-name' | 'message';
}

const CATEGORY_INFO = {
  scam: {
    icon: '🚫',
    title: 'Potential Scam/Fraud Detected',
    color: '#EF4444',
    description: 'This content appears to contain scam or fraud-related material.',
  },
  sexual: {
    icon: '🔞',
    title: 'Inappropriate Content Detected',
    color: '#F97316',
    description: 'This content contains inappropriate sexual material.',
  },
  hate: {
    icon: '⚠️',
    title: 'Hate Speech Detected',
    color: '#DC2626',
    description: 'This content contains hate speech or offensive slurs.',
  },
  violence: {
    icon: '⛔',
    title: 'Violent Content Detected',
    color: '#B91C1C',
    description: 'This content contains violent material or threats.',
  },
  drugs: {
    icon: '💊',
    title: 'Drug-Related Content Detected',
    color: '#EA580C',
    description: 'This content appears to reference drug-related material.',
  },
  personal_info: {
    icon: '🔒',
    title: 'Personal Information Detected',
    color: '#D97706',
    description: 'This content contains personal information (phone, email, address).',
  },
};

const CONTEXT_MESSAGES = {
  username: 'Please choose a different ghost name that complies with our community guidelines.',
  'crowd-name': 'Please choose a different crowd name that complies with our community guidelines.',
  message: 'This message cannot be sent as it violates our community guidelines.',
};

export const ContentFilterModal = ({
  isOpen,
  onClose,
  category = 'scam',
  flagReason,
  context,
}: ContentFilterModalProps) => {
  const info = CATEGORY_INFO[category];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-[#1A1A2E] rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-[rgba(255,255,255,0.1)] pointer-events-auto"
              role="alertdialog"
              aria-labelledby="filter-modal-title"
              aria-describedby="filter-modal-description"
            >
              {/* Header with Icon */}
              <div className="relative bg-gradient-to-b from-[#1F1F38] to-[#1A1A2E] p-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-[#8B8CAD] hover:text-white transition-colors p-1"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  {/* Icon Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: `${info.color}20`,
                      border: `2px solid ${info.color}40`
                    }}
                  >
                    <Shield size={32} style={{ color: info.color }} />
                  </motion.div>

                  <h2 
                    id="filter-modal-title"
                    className="text-xl font-bold text-white mb-2"
                  >
                    {info.title}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p 
                  id="filter-modal-description"
                  className="text-[#C5C6E3] text-center text-sm leading-relaxed mb-4"
                >
                  {info.description}
                </p>

                {flagReason && (
                  <div className="bg-[#0F0F1E] rounded-xl p-3 mb-4 border border-[rgba(255,255,255,0.05)]">
                    <p className="text-[#8B8CAD] text-xs font-medium mb-1">Reason:</p>
                    <p className="text-[#C5C6E3] text-sm">{flagReason}</p>
                  </div>
                )}

                <div className="bg-[#141426] rounded-xl p-4 border border-[rgba(155,123,255,0.2)]">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-[#9B7BFF] mt-0.5 flex-shrink-0" />
                    <p className="text-[#C5C6E3] text-sm leading-relaxed">
                      {CONTEXT_MESSAGES[context]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-2">
                <GhostButton
                  fullWidth
                  size="lg"
                  variant="primary"
                  onClick={onClose}
                  aria-label="Acknowledge and close"
                >
                  Understood
                </GhostButton>

                <button
                  onClick={() => {
                    // Open community guidelines in a new tab or navigate to it
                    // For now, just log
                    console.log('View Community Guidelines');
                  }}
                  className="w-full mt-3 text-[#9B7BFF] text-sm font-medium hover:text-[#B88DFF] transition-colors py-2"
                >
                  View Community Guidelines
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
