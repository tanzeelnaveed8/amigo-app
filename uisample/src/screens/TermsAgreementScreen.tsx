import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, AlertTriangle, FileText, Check } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';
import { Checkbox } from '../components/ui/checkbox';

interface TermsAgreementScreenProps {
  onAccept: () => void;
  onBack: () => void;
}

export const TermsAgreementScreen = ({ onAccept, onBack }: TermsAgreementScreenProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleContinue = () => {
    if (termsAccepted) {
      // Store acceptance in localStorage
      localStorage.setItem('ghost_terms_accepted', 'true');
      localStorage.setItem('ghost_terms_accepted_date', new Date().toISOString());
      onAccept();
    }
  };

  const openEULA = () => {
    window.open('https://www.cryptogram.tech/eula', '_blank', 'noopener,noreferrer');
  };

  const openPrivacyPolicy = () => {
    window.open('https://www.cryptogram.tech/privacy', '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] relative overflow-hidden"
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-[#9B7BFF]/10 via-transparent to-transparent opacity-40 pointer-events-none" />
      
      {/* Top Bar */}
      <div className="relative z-10 w-full pt-12 px-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#C5C6E3] hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={28} />
        </button>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className="max-w-md mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9B7BFF] to-[#7B5BCF] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9B7BFF]/30"
            >
              <FileText size={32} className="text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Terms & Privacy
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-[#C5C6E3]"
            >
              Please review and accept our terms to continue
            </motion.p>
          </div>

          {/* Key Points Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mb-8"
          >
            {/* Zero Tolerance Policy */}
            <div className="bg-gradient-to-br from-[#FF6363]/15 to-[#FF6363]/5 border border-[#FF6363]/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6363]/20 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-[#FF6363]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Zero Tolerance Policy</h3>
                  <p className="text-xs text-[#C5C6E3] leading-relaxed">
                    We have <strong className="text-[#FF6363]">zero tolerance</strong> for objectionable content, abusive behavior, harassment, hate speech, or illegal activity. Violations result in <strong className="text-[#FF6363]">immediate permanent bans</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Anonymous & Temporary */}
            <div className="bg-[#1A1A2E]/60 border border-[rgba(155,123,255,0.2)] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#9B7BFF]/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-[#9B7BFF]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Anonymous & Temporary</h3>
                  <p className="text-xs text-[#C5C6E3] leading-relaxed">
                    Ghost Mode is completely anonymous and temporary. <strong className="text-[#9B7BFF]">No personal information is collected</strong> and crowds are ephemeral chat spaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div className="bg-[#1A1A2E]/60 border border-[rgba(155,123,255,0.2)] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center shrink-0">
                  <Check size={20} className="text-[#22C55E]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">Safety & Moderation</h3>
                  <p className="text-xs text-[#C5C6E3] leading-relaxed">
                    User reporting tools, blocking features, and community moderation keep Ghost Mode safe. Report any violations immediately.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Agreement Checkboxes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            {/* Terms Checkbox */}
            <div className="bg-[#141422] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5 shrink-0 data-[state=checked]:bg-[#9B7BFF] data-[state=checked]:border-[#9B7BFF]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C5C6E3] leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openEULA();
                      }}
                      className="text-[#9B7BFF] hover:text-[#B88DFF] underline font-medium transition-colors"
                    >
                      Terms of Service (EULA)
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        openPrivacyPolicy();
                      }}
                      className="text-[#9B7BFF] hover:text-[#B88DFF] underline font-medium transition-colors"
                    >
                      Privacy Policy
                    </button>
                    , and understand the zero tolerance policy for objectionable content and abusive behavior.
                  </p>
                </div>
              </label>
            </div>
          </motion.div>

          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-[#FF6363]/10 border border-[#FF6363]/30 rounded-xl p-3 mb-6"
          >
            <p className="text-xs text-center text-[#C5C6E3]">
              <strong className="text-[#FF6363]">Important:</strong> By continuing, you acknowledge that any violation of our policies will result in permanent account termination without warning.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 w-full px-6 pb-8">
        <div className="max-w-md mx-auto">
          <GhostButton 
            fullWidth 
            onClick={handleContinue}
            variant="primary"
            size="lg"
            disabled={!termsAccepted}
            aria-label="Accept terms and continue"
          >
            Accept & Continue
          </GhostButton>
          {!termsAccepted && (
            <p className="text-xs text-center text-[#8B8CAD] mt-3">
              Please accept both agreements to continue
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};