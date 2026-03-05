import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Shield, AlertTriangle, ExternalLink, MessageSquare, FileText } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

interface GhostSettingsScreenProps {
  onBack: () => void;
}

interface SettingItemProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
  delay?: number;
  isDestructive?: boolean;
}

const SettingItem = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  description, 
  onPress, 
  delay = 0,
  isDestructive = false
}: SettingItemProps) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    onClick={onPress}
    className="w-full bg-[#141422] rounded-2xl p-4 border border-[rgba(255,255,255,0.08)] flex items-start gap-4 text-left hover:bg-[#1A1A2E] transition-colors active:scale-[0.99]"
  >
    <div 
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${iconColor}20` }}
    >
      <Icon size={24} style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className={`text-base font-semibold mb-1 ${isDestructive ? 'text-[#FF6363]' : 'text-white'}`}>
        {title}
      </h3>
      <p className="text-sm text-[#8B8CAD] leading-snug">
        {description}
      </p>
    </div>
    <ExternalLink size={18} className="text-[#8B8CAD] shrink-0 mt-1" />
  </motion.button>
);

export const GhostSettingsScreen = ({ onBack }: GhostSettingsScreenProps) => {
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const handleContactUs = () => {
    setShowContactDialog(true);
  };

  const handleReportSafety = () => {
    setShowReportDialog(true);
  };

  const handleSubmitReport = () => {
    // In production, this would send to your backend
    console.log('Safety Report Submitted:', { reportReason, reportDetails });
    setReportSubmitted(true);
    setShowReportDialog(false);
    
    // Reset form after a delay
    setTimeout(() => {
      setReportSubmitted(false);
      setReportReason('');
      setReportDetails('');
    }, 3000);
  };

  const openEULA = () => {
    window.open('https://www.cryptogram.tech/eula', '_blank', 'noopener,noreferrer');
  };

  const openPrivacyPolicy = () => {
    window.open('https://www.cryptogram.tech/privacy', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onBack}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-gradient-to-b from-[#0A0A14] to-[#141426] rounded-3xl border border-[rgba(255,255,255,0.1)] shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            Settings
          </motion.h2>
          <button
            onClick={onBack}
            className="p-2 -mr-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full hover:bg-white/5"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Support Section */}
          <div>
            <h3 className="text-xs font-semibold text-[#8B8CAD] uppercase tracking-wider mb-3 ml-1">
              Support & Safety
            </h3>
            <div className="space-y-3">
              <SettingItem
                icon={Mail}
                iconColor="#9B7BFF"
                title="Contact Us"
                description="Get help or send feedback to our support team"
                onPress={handleContactUs}
                delay={0.1}
              />
              <SettingItem
                icon={Shield}
                iconColor="#FF6363"
                title="Report Safety Issue"
                description="Report abuse, harassment, or safety concerns"
                onPress={handleReportSafety}
                delay={0.15}
                isDestructive
              />
            </div>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-xs font-semibold text-[#8B8CAD] uppercase tracking-wider mb-3 ml-1">
              Legal
            </h3>
            <div className="space-y-3">
              <SettingItem
                icon={FileText}
                iconColor="#60A5FA"
                title="Privacy Policy"
                description="Learn how we protect your data and privacy"
                onPress={openPrivacyPolicy}
                delay={0.2}
              />
              <SettingItem
                icon={FileText}
                iconColor="#60A5FA"
                title="Terms of Service (EULA)"
                description="Read our end user license agreement"
                onPress={openEULA}
                delay={0.25}
              />
            </div>
          </div>

          {/* Success message */}
          {reportSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl p-4 flex items-center gap-3"
            >
              <Shield size={20} className="text-[#22C55E] shrink-0" />
              <p className="text-sm text-[#22C55E] font-medium">
                Report submitted successfully. Thank you for keeping Ghost Mode safe!
              </p>
            </motion.div>
          )}

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#141422]/50 border border-[rgba(155,123,255,0.2)] rounded-xl p-4"
          >
            <p className="text-xs text-[#C5C6E3] leading-relaxed">
              <strong className="text-[#9B7BFF]">Ghost Mode</strong> is a temporary, anonymous chat experience. 
              We take safety seriously and have zero tolerance for abusive content.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Contact Us Dialog */}
      <AlertDialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#9B7BFF]/20 flex items-center justify-center">
                <Mail size={24} className="text-[#9B7BFF]" />
              </div>
              <AlertDialogTitle className="text-xl text-white">
                Contact Support
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-[#C5C6E3] space-y-3 pt-2">
                <span className="block">Need help or have feedback? We'd love to hear from you!</span>
                <div className="bg-[#141422] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
                  <span className="text-white font-medium mb-2 block">Email us:</span>
                  <a 
                    href="mailto:support@cryptogram.tech"
                    className="text-[#FF6363] hover:text-[#ff4f4f] transition-colors underline"
                  >
                    support@cryptogram.tech
                  </a>
                </div>
                <span className="text-xs text-[#8B8CAD] block">
                  We typically respond within 24-48 hours.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowContactDialog(false)}
              className="bg-[#9B7BFF] text-white hover:bg-[#8B6BEF]"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Safety Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#FF6363]/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-[#FF6363]" />
              </div>
              <AlertDialogTitle className="text-xl text-white">
                Report Safety Issue
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-[#C5C6E3] space-y-3 pt-2">
                <span className="block">Report abuse, harassment, illegal content, or safety concerns.</span>
                
                <div className="bg-[#141422] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
                  <span className="text-white font-medium mb-2 block">Email us:</span>
                  <a 
                    href="mailto:support@cryptogram.tech"
                    className="text-[#FF6363] hover:text-[#ff4f4f] transition-colors underline"
                  >
                    support@cryptogram.tech
                  </a>
                </div>

                <div className="bg-[#FF6363]/10 border border-[#FF6363]/30 rounded-lg p-3">
                  <span className="text-xs text-[#C5C6E3] block">
                    <strong className="text-[#FF6363]">Zero Tolerance:</strong> Reports are reviewed immediately. 
                    Confirmed violations result in permanent bans.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowReportDialog(false)}
              className="bg-[#FF6363] text-white hover:bg-[#ff4f4f]"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};