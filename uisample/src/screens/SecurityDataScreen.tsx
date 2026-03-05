import React, { useState, useEffect } from 'react';
import { ArrowLeft, HardDrive, Mail, CheckCircle2, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
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

interface SecurityDataScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeMode: 'day' | 'night' | 'ghost';
}

export const SecurityDataScreen = ({ onBack, isDarkMode, themeColor, themeMode }: SecurityDataScreenProps) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Empty if not provided during signup
  const [showAddEmailDialog, setShowAddEmailDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showManageEmailDialog, setShowManageEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  // Storage data - simulated
  const [storageUsed, setStorageUsed] = useState(0);
  const totalStorage = 5120; // 5 GB in MB
  const storagePercentage = (storageUsed / totalStorage) * 100;

  // Animate storage bar on mount
  useEffect(() => {
    // Simulate storage data loading
    const targetStorage = 2458; // 2.4 GB used
    const duration = 1500;
    const steps = 60;
    const increment = targetStorage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetStorage) {
        setStorageUsed(targetStorage);
        clearInterval(timer);
      } else {
        setStorageUsed(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      return;
    }

    setUserEmail(newEmail);
    setNewEmail('');
    setShowAddEmailDialog(false);
    // Automatically show OTP dialog
    setTimeout(() => setShowOTPDialog(true), 500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.match(/[0-9]/)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setOtpError(false);

      // Auto-focus next input
      if (index < 5 && value !== '') {
        const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (newOtp[index] !== '') {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
          newOtp[index - 1] = '';
          setOtp(newOtp);
        }
      }
    }
  };

  const handleVerifyOTP = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError(true);
      return;
    }

    setVerifyingOTP(true);
    // Simulate OTP verification (any 6-digit code works for demo)
    setTimeout(() => {
      setVerifyingOTP(false);
      setEmailVerified(true);
      // Close dialog after showing success
      setTimeout(() => {
        setShowOTPDialog(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError(false);
      }, 2000);
    }, 1500);
  };

  const handleResendOTP = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError(false);
    // Focus first input
    const firstInput = document.getElementById('otp-0') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    card: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200/60',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100',
    divider: isDarkMode ? 'border-white/5' : 'border-gray-200/60',
  };

  return (
    <div className={cn("flex flex-col h-screen w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      
      {/* Header */}
      <motion.div 
        className="flex-none px-5 pt-4 pb-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.button 
            onClick={onBack}
            className={cn(
              "p-2.5 -ml-2 rounded-xl transition-all duration-200",
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            )}
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} className={themeClasses.subtext} />
          </motion.button>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className={cn("text-[34px] font-bold leading-[1.1] mb-2", themeClasses.text)}>
            Security
            <br />
            <motion.span
              className="bg-clip-text text-transparent inline-block"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`,
                filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.35))'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              & Data
            </motion.span>
          </h1>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 z-10 scrollbar-hide">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="space-y-6"
        >
          
          {/* Storage Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={cn("rounded-[24px] p-6 border shadow-sm", themeClasses.card)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <HardDrive size={24} style={{ color: themeColor }} />
              </div>
              <div className="flex-1">
                <h3 className={cn("font-bold text-[17px]", themeClasses.text)}>Device Storage</h3>
                <p className={cn("text-[13px] mt-0.5", themeClasses.subtext)}>
                  {formatStorage(storageUsed)} of {formatStorage(totalStorage)} used
                </p>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${themeColor}, ${themeColor}CC)`,
                  boxShadow: `0 0 10px ${themeColor}40`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${storagePercentage}%` }}
                transition={{ 
                  duration: 1.5, 
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.5 
                }}
              />
            </div>

            {/* Storage percentage badge */}
            <motion.div
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: `${themeColor}15`,
                color: themeColor 
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              {storagePercentage.toFixed(1)}% Used
            </motion.div>
          </motion.div>

          {/* Email Verification Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-3"
          >
            <h3 className={cn("font-bold text-[17px] px-1", themeClasses.text)}>Account Security</h3>
            
            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={cn(
                "rounded-[18px] p-4 border",
                isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200/60'
              )}
            >
              <div className="flex gap-3">
                <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={cn("text-[14px] font-medium mb-1", isDarkMode ? 'text-blue-300' : 'text-blue-700')}>
                    Why verify your email?
                  </p>
                  <p className={cn("text-[13px] leading-relaxed", isDarkMode ? 'text-blue-400/80' : 'text-blue-600/80')}>
                    Email verification is necessary to secure your account, enable account recovery, and protect your data if you lose access.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email Verification Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className={cn("rounded-[20px] border shadow-sm overflow-hidden", themeClasses.card)}
            >
              <button
                onClick={() => {
                  if (emailVerified) {
                    setShowManageEmailDialog(true);
                  } else if (userEmail) {
                    setShowOTPDialog(true);
                  } else {
                    setShowAddEmailDialog(true);
                  }
                }}
                className={cn("w-full p-4 flex items-center justify-between transition-all", themeClasses.hover)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      emailVerified 
                        ? 'bg-green-500/15' 
                        : userEmail 
                          ? 'bg-orange-500/15' 
                          : 'bg-red-500/15'
                    )}
                  >
                    {emailVerified ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : userEmail ? (
                      <AlertCircle size={20} className="text-orange-500" />
                    ) : (
                      <Mail size={20} className="text-red-500" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-medium text-[15px]", themeClasses.text)}>
                        Email Verification
                      </span>
                      {emailVerified && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500"
                        >
                          VERIFIED
                        </motion.span>
                      )}
                    </div>
                    <p className={cn("text-[13px] mt-0.5", themeClasses.subtext)}>
                      {emailVerified 
                        ? userEmail
                        : userEmail 
                          ? `${userEmail} - Not verified`
                          : 'No email added yet'
                      }
                    </p>
                  </div>
                </div>
                <motion.div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[12px] font-bold",
                    emailVerified
                      ? isDarkMode ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-500'
                      : 'text-white'
                  )}
                  style={{
                    backgroundColor: !emailVerified ? themeColor : undefined
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emailVerified ? 'Manage' : userEmail ? 'Verify' : 'Add Email'}
                </motion.div>
              </button>
            </motion.div>
          </motion.div>

          {/* Additional Security Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={cn("rounded-[20px] p-5 border", themeClasses.card)}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <ShieldCheck size={20} style={{ color: themeColor }} />
              </div>
              <div className="flex-1">
                <h4 className={cn("font-bold text-[15px] mb-2", themeClasses.text)}>
                  End-to-End Encryption
                </h4>
                <p className={cn("text-[13px] leading-relaxed", themeClasses.subtext)}>
                  All your messages are protected with end-to-end encryption. Only you and your contacts can read them.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="pb-4" />
        </motion.div>
      </div>

      {/* Add Email Dialog */}
      <AlertDialog open={showAddEmailDialog} onOpenChange={setShowAddEmailDialog}>
        <AlertDialogContent className={isDarkMode ? "bg-[#0A0A14] border-white/10 text-white max-w-md" : "bg-white text-gray-900 max-w-md"}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-4 relative"
            >
              {/* Pulsing background */}
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: themeColor }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full"
                />
              </div>
              {/* Icon container */}
              <div 
                className="relative p-4 rounded-full border-2"
                style={{ 
                  backgroundColor: `${themeColor}20`,
                  borderColor: `${themeColor}30`
                }}
              >
                <Mail size={32} style={{ color: themeColor }} strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3 mb-4">
              <AlertDialogTitle className="text-xl">Add Email Address</AlertDialogTitle>
              <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                Enter your email address to secure your account and enable recovery options.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Email Input */}
            <div className="w-full mb-6">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={cn(
                  "w-full px-4 py-3 rounded-xl border text-[15px] transition-all",
                  isDarkMode 
                    ? "bg-[#141422] border-white/10 text-white placeholder:text-[#5E607E] focus:border-white/20" 
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-300"
                )}
                style={{
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColor;
                  e.target.style.boxShadow = `0 0 0 3px ${themeColor}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>

            <AlertDialogFooter className="w-full flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleAddEmail}
                disabled={!newEmail.trim()}
                className="text-white border-0 disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                Add Email
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* OTP Dialog */}
      <AlertDialog open={showOTPDialog} onOpenChange={(open) => {
        if (!open && !emailVerified) {
          // Reset OTP when closing without verification
          setOtp(['', '', '', '', '', '']);
          setOtpError(false);
        }
        setShowOTPDialog(open);
      }}>
        <AlertDialogContent className={isDarkMode ? "bg-[#0A0A14] border-white/10 text-white max-w-md" : "bg-white text-gray-900 max-w-md"}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-4 relative"
            >
              {/* Pulsing background */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: emailVerified ? '#10B981' : themeColor }}
              />
              {/* Icon container */}
              <div 
                className="relative p-4 rounded-full border-2"
                style={{ 
                  backgroundColor: emailVerified ? '#10B98120' : `${themeColor}20`,
                  borderColor: emailVerified ? '#10B98130' : `${themeColor}30`
                }}
              >
                {emailVerified ? (
                  <CheckCircle2 size={32} className="text-green-500" strokeWidth={2} />
                ) : (
                  <Mail size={32} style={{ color: themeColor }} strokeWidth={2} />
                )}
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl">
                {emailVerified ? 'Email Verified!' : verifyingOTP ? 'Verifying...' : 'Verify Your Email'}
              </AlertDialogTitle>
              <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                {emailVerified 
                  ? `Your email ${userEmail} has been successfully verified. Your account is now secure.`
                  : verifyingOTP 
                    ? `Verifying your email...`
                    : `We've sent a verification code to ${userEmail}. Enter the code below to verify your account.`
                }
              </AlertDialogDescription>
              {!verifyingOTP && !emailVerified && (
                <button
                  onClick={() => {
                    setShowOTPDialog(false);
                    setOtp(['', '', '', '', '', '']);
                    setOtpError(false);
                    setTimeout(() => {
                      setNewEmail(userEmail);
                      setUserEmail('');
                      setShowAddEmailDialog(true);
                    }, 300);
                  }}
                  className="text-[13px] font-medium transition-colors"
                  style={{ color: themeColor }}
                >
                  Wrong email? Change it
                </button>
              )}
            </AlertDialogHeader>

            {!verifyingOTP && !emailVerified && (
              <div className="w-full mt-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      className={cn(
                        "w-12 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all",
                        otpError 
                          ? "border-red-500 bg-red-500/5"
                          : isDarkMode 
                            ? "bg-[#141422] border-white/10 text-white focus:border-white/20" 
                            : "bg-white border-gray-200 text-gray-900 focus:border-gray-300"
                      )}
                      style={{
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        if (!otpError) {
                          e.target.style.borderColor = themeColor;
                          e.target.style.boxShadow = `0 0 0 3px ${themeColor}15`;
                        }
                      }}
                      onBlur={(e) => {
                        if (!otpError) {
                          e.target.style.borderColor = '';
                          e.target.style.boxShadow = '';
                        }
                      }}
                      id={`otp-${index}`}
                    />
                  ))}
                </div>
                {otpError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-[13px] mt-3 text-center font-medium"
                  >
                    Incorrect code. Please try again.
                  </motion.p>
                )}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResendOTP}
                    className={cn(
                      "text-[13px] font-medium transition-colors",
                      isDarkMode ? "text-[#8B8CAD] hover:text-white" : "text-gray-500 hover:text-gray-900"
                    )}
                    style={{
                      color: themeColor
                    }}
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {verifyingOTP && (
              <div className="w-full mt-6 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-8 h-8 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: themeColor, borderTopColor: 'transparent' }}
                />
              </div>
            )}

            {!verifyingOTP && !emailVerified && (
              <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                <AlertDialogCancel 
                  className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}
                  onClick={() => {
                    setOtp(['', '', '', '', '', '']);
                    setOtpError(false);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleVerifyOTP} 
                  disabled={otp.join('').length !== 6}
                  className="text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColor }}
                >
                  Verify
                </AlertDialogAction>
              </AlertDialogFooter>
            )}

            {emailVerified && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full py-3 rounded-2xl font-bold text-white"
                style={{ backgroundColor: themeColor }}
                onClick={() => {
                  setShowOTPDialog(false);
                  setOtp(['', '', '', '', '', '']);
                  setOtpError(false);
                }}
              >
                Done
              </motion.button>
            )}
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Email Dialog */}
      <AlertDialog open={showManageEmailDialog} onOpenChange={setShowManageEmailDialog}>
        <AlertDialogContent className={isDarkMode ? "bg-[#0A0A14] border-white/10 text-white max-w-md" : "bg-white text-gray-900 max-w-md"}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-4 relative"
            >
              {/* Pulsing background */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: '#10B981' }}
              />
              {/* Icon container */}
              <div 
                className="relative p-4 rounded-full border-2"
                style={{ 
                  backgroundColor: '#10B98120',
                  borderColor: '#10B98130'
                }}
              >
                <CheckCircle2 size={32} className="text-green-500" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3 mb-4">
              <AlertDialogTitle className="text-xl">Manage Email</AlertDialogTitle>
              <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                Your email <span className="font-semibold" style={{ color: themeColor }}>{userEmail}</span> is verified and secure.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Security Information */}
            <div className={cn(
              "w-full p-5 rounded-xl border",
              isDarkMode ? 'bg-[#141422]/50 border-white/5' : 'bg-gray-50 border-gray-200'
            )}>
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${themeColor}15` }}
                >
                  <ShieldCheck size={20} style={{ color: themeColor }} />
                </div>
                <div className="flex-1">
                  <h4 className={cn("font-bold text-[15px] mb-2", themeClasses.text)}>
                    Need to update your email?
                  </h4>
                  <p className={cn("text-[13px] leading-relaxed mb-3", themeClasses.subtext)}>
                    For security purposes, email changes must be verified through our support team.
                  </p>
                  <div className={cn(
                    "p-3 rounded-lg text-[13px]",
                    isDarkMode ? 'bg-[#0A0A14] border border-white/5' : 'bg-white border border-gray-200'
                  )}>
                    <p className={cn("font-medium mb-1", themeClasses.text)}>
                      Send your request to:
                    </p>
                    <a 
                      href={`mailto:support@cryptogram.tech?subject=Email%20Change%20Request&body=Current%20verified%20email:%20${userEmail}`}
                      className="font-mono font-bold break-all hover:underline transition-colors"
                      style={{ color: themeColor }}
                    >
                      support@cryptogram.tech
                    </a>
                    <p className={cn("text-[12px] mt-2", themeClasses.subtext)}>
                      Please send from <span className="font-semibold">{userEmail}</span> for verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AlertDialogFooter className="w-full mt-6">
              <AlertDialogCancel className={cn("w-full", isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : "")}>
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};