import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Camera, CheckCircle, XCircle, Sparkles, User, AtSign, Mail, Send, X, Ghost } from 'lucide-react';
import { GhostLoadingIcon } from '../components/ui/ghost-loading-icon';

interface ProfileSetupScreenProps {
  onComplete: (profile: ProfileData) => void;
  onBack: () => void;
}

export interface ProfileData {
  displayName: string;
  username: string;
  email?: string;
  profilePhoto?: string;
}

export const ProfileSetupScreen = ({ onComplete, onBack }: ProfileSetupScreenProps) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Username validation states
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');
  
  // Email verification states
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate username format
  const validateUsername = (value: string): boolean => {
    if (value.length < 3 || value.length > 15) {
      setUsernameError('Username must be 3-15 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Only letters, numbers, and underscore allowed');
      return false;
    }
    setUsernameError('');
    return true;
  };

  // Check username availability (simulated)
  useEffect(() => {
    if (username.length >= 3 && validateUsername(username)) {
      setIsCheckingUsername(true);
      setUsernameAvailable(null);
      
      const timer = setTimeout(() => {
        const taken = ['admin', 'user', 'test'].includes(username.toLowerCase());
        setUsernameAvailable(!taken);
        setIsCheckingUsername(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);

  // Email countdown timer
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => {
        setEmailCountdown(emailCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  const handleSendEmailCode = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || emailCountdown > 0) return;
    
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setShowEmailVerify(true);
      setEmailCountdown(60);
    }, 600);
  };

  const handleVerifyEmailCode = () => {
    if (emailCode.length === 6) {
      setIsEmailVerified(true);
      setShowEmailVerify(false);
    }
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setProfilePhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleContinue = () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete({
        displayName,
        username,
        email: email || undefined,
        profilePhoto: profilePhoto || undefined,
      });
    }, 800);
  };

  const isFormValid = 
    displayName.trim().length >= 2 && 
    username.length >= 3 && 
    usernameAvailable === true &&
    !usernameError;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-[#0A0A14] px-6 pt-12 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-[#3B82F6]"
        >
          <Sparkles size={18} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[14px] font-medium">Almost there!</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-[32px] font-bold text-white leading-tight mb-2">
            Create your
            <br />
            <span className="bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent">
              Amigo profile
            </span>
          </h1>
          <p className="text-[15px] text-[#8B8CAD]">
            Let's make you stand out
          </p>
        </motion.div>

        {/* Large Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex justify-center"
        >
          <button
            onClick={handlePhotoUpload}
            className="group relative"
          >
            {/* Animated glow rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-[#2563EB] rounded-full blur-2xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.15, 0.3]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-3xl"
            />
            
            {/* Photo container */}
            <div className="relative w-32 h-32 rounded-full border-4 border-[rgba(29,78,216,0.4)] group-hover:border-[#2563EB] transition-all bg-[#141422] overflow-hidden shadow-[0_8px_40px_rgba(29,78,216,0.3)] group-hover:shadow-[0_12px_48px_rgba(37,99,235,0.5)]">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={40} className="text-[#3B82F6] group-hover:text-[#60A5FA] transition-colors" />
                </div>
              )}
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={32} className="text-white" />
              </div>
            </div>
            
            {/* Plus badge */}
            {!profilePhoto && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(37,99,235,0.6)] border-4 border-[#0A0A14]"
              >
                <span className="text-white text-[24px] font-light leading-none">+</span>
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Form Fields - Compact Cards */}
        <div className="flex-1 space-y-3 mb-6">
          {/* Display Name Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <User size={18} className="text-[#3B82F6]" />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
              placeholder="Display Name"
              maxLength={50}
              className="w-full bg-[#141422] border border-[rgba(29,78,216,0.4)] rounded-[16px] py-4 pl-12 pr-4 text-white placeholder:text-[#5E607E] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] transition-all"
            />
            {displayName.length >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <CheckCircle size={18} className="text-[#3B82F6]" />
              </motion.div>
            )}
          </motion.div>

          {/* Username Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute left-4 top-[20px] z-10 pointer-events-none">
              <AtSign size={18} className="text-[#3B82F6]" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15);
                setUsername(value);
                validateUsername(value);
              }}
              placeholder="Username"
              maxLength={15}
              className={`w-full bg-[#141422] border rounded-[16px] py-4 pl-12 pr-12 text-white placeholder:text-[#5E607E] focus:outline-none transition-all ${
                usernameAvailable === true
                  ? 'border-[#3B82F6] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]'
                  : usernameAvailable === false
                  ? 'border-[#EF4444] shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
                  : 'border-[rgba(29,78,216,0.4)] focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
              }`}
            />
            
            {/* Status Icon */}
            <div className="absolute right-4 top-[20px] pointer-events-none">
              {isCheckingUsername && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full"
                />
              )}
              {!isCheckingUsername && usernameAvailable === true && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle size={18} className="text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                </motion.div>
              )}
              {!isCheckingUsername && usernameAvailable === false && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <XCircle size={18} className="text-[#EF4444]" />
                </motion.div>
              )}
            </div>
            
            {/* Error/Success message */}
            {(usernameError || usernameAvailable === false) && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[12px] text-[#EF4444] mt-1.5 ml-1"
              >
                {usernameError || 'Username already taken'}
              </motion.p>
            )}
          </motion.div>

          {/* Email Field (Optional) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative"
          >
            <div className="absolute left-4 top-[20px] z-10 pointer-events-none">
              <Mail size={18} className={isEmailVerified ? "text-[#3B82F6]" : "text-[#5E607E]"} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value.slice(0, 100));
                if (isEmailVerified) {
                  setIsEmailVerified(false);
                }
              }}
              placeholder="Email (optional)"
              maxLength={100}
              disabled={isEmailVerified}
              className={`w-full bg-[#141422] border rounded-[16px] py-4 pl-12 pr-20 text-white placeholder:text-[#5E607E] focus:outline-none transition-all ${
                isEmailVerified 
                  ? 'border-[#3B82F6] shadow-[0_0_0_4px_rgba(59,130,246,0.15)] opacity-70'
                  : 'border-[rgba(29,78,216,0.25)] focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
              }`}
            />
            
            {/* Verify button or Verified badge */}
            <div className="absolute right-3 top-[20px]">
              {isEmailVerified ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="pointer-events-none"
                >
                  <CheckCircle size={18} className="text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                </motion.div>
              ) : email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? (
                <button
                  onClick={handleSendEmailCode}
                  disabled={isSendingEmail}
                  className={`text-[12px] font-medium transition-all -translate-y-1/2 ${
                    isSendingEmail
                      ? 'text-[#5E607E] cursor-not-allowed'
                      : 'text-[#3B82F6] hover:text-[#60A5FA]'
                  }`}
                >
                  {isSendingEmail ? 'Sending...' : 'Verify'}
                </button>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-[#141422] to-[#1a1a2e] border border-[rgba(29,78,216,0.2)] rounded-[16px] p-4 mb-6"
        >
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#1D4ED8]/20 flex items-center justify-center mt-0.5">
              <Sparkles size={14} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-[13px] text-[#8B8CAD] leading-relaxed">
                Your username is unique to you and can't be changed later. Choose wisely!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={handleContinue}
            disabled={!isFormValid || isSubmitting}
            whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
            whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
            className="relative w-full overflow-hidden rounded-[20px] py-4 text-[16px] font-bold text-white transition-all disabled:cursor-not-allowed group"
          >
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] transition-all ${
              isFormValid && !isSubmitting 
                ? 'opacity-100 group-hover:scale-105' 
                : 'opacity-30'
            }`} />
            
            {/* Shimmer effect */}
            {isFormValid && !isSubmitting && (
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "linear",
                  repeatDelay: 1
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            )}
            
            {/* Button shadow */}
            <div className={`absolute inset-0 shadow-[0_8px_32px_rgba(59,130,246,0.4)] transition-all ${
              isFormValid && !isSubmitting 
                ? 'opacity-100 group-hover:shadow-[0_12px_40px_rgba(59,130,246,0.6)]' 
                : 'opacity-0'
            }`} />
            
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <GhostLoadingIcon size={20} className="text-white" />
                  Creating your profile...
                </>
              ) : (
                <>
                  Continue
                  {isFormValid && (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        ease: "easeInOut"
                      }}
                    >
                      →
                    </motion.span>
                  )}
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Email Verification Popup */}
      <AnimatePresence>
        {showEmailVerify && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailVerify(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Popup Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-8 top-1/2 -translate-y-1/2 bg-[#0A0A14] border border-[rgba(29,78,216,0.3)] rounded-[18px] p-5 z-50 max-w-[340px] mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              {/* Close button */}
              <button
                onClick={() => setShowEmailVerify(false)}
                className="absolute top-3 right-3 p-1.5 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
              >
                <X size={18} />
              </button>

              {/* Icons with interaction */}
              <div className="flex justify-center items-center gap-3 mb-4">
                {/* Ghost Icon */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -4, 0],
                      scale: [1, 1.05, 1],
                      rotate: [0, -3, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="relative"
                  >
                    {/* Ghost Glow */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0.2, 0.4]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.5,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-purple-600 rounded-full blur-lg"
                    />
                    <div className="relative bg-[#141422] p-3 rounded-full border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <Ghost size={22} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Connection Line with Traveling Pulse */}
                <div className="relative w-8 h-[2px]">
                  {/* Base gradient line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-[#3B82F6] rounded-full"
                  />
                  
                  {/* Traveling glow pulse */}
                  <motion.div
                    animate={{ 
                      x: [-12, 20],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.5
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 blur-[4px]"
                  />
                  
                  {/* Small particles */}
                  <motion.div
                    animate={{ 
                      x: [-8, 16],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 0.5,
                      delay: 0.2
                    }}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"
                  />
                </div>

                {/* Mail Icon */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, 4, 0],
                      scale: [1, 1.05, 1],
                      rotate: [0, 3, 0]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1.25 // Offset by half the duration for opposite movement
                    }}
                    className="relative"
                  >
                    {/* Mail Glow */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.25, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2.5,
                        ease: "easeInOut",
                        delay: 1.25
                      }}
                      className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-lg"
                    />
                    
                    {/* Receive pulse effect */}
                    <motion.div
                      animate={{ 
                        scale: [0, 1.5],
                        opacity: [0.6, 0]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        repeatDelay: 1
                      }}
                      className="absolute inset-0 bg-[#3B82F6] rounded-full blur-md"
                    />
                    
                    <div className="relative bg-[#141422] p-3 rounded-full border border-[rgba(29,78,216,0.3)] shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      <Mail size={22} className="text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,1)]" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-[19px] font-bold text-white text-center mb-1">
                Verify Email
              </h2>
              
              {/* Description */}
              <p className="text-[12px] text-[#8B8CAD] text-center mb-3 leading-relaxed">
                Email helps in account recovery if you lose access
              </p>
              
              {/* Email display */}
              <p className="text-[13px] text-white/90 font-medium text-center mb-4 px-2 truncate">
                {email}
              </p>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-1.5 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={emailCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const newCode = emailCode.split('');
                      newCode[index] = value;
                      setEmailCode(newCode.join('').slice(0, 6));
                      
                      // Auto-focus next input
                      if (value && index < 5) {
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                        nextInput?.focus();
                      }

                      // Auto-verify when complete
                      if (newCode.join('').length === 6) {
                        setTimeout(() => handleVerifyEmailCode(), 300);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !emailCode[index] && index > 0) {
                        const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className="w-10 h-12 text-center text-[18px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-lg shadow-[0_3px_12px_rgba(0,0,0,0.4)] focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25),0_0_16px_rgba(37,99,235,0.3)] transition-all"
                  />
                ))}
              </div>

              {/* Resend */}
              <div className="text-center mb-4">
                <button
                  onClick={handleSendEmailCode}
                  disabled={emailCountdown > 0}
                  className={`text-[12px] font-medium inline-flex items-center gap-1.5 transition-all ${
                    emailCountdown > 0
                      ? 'text-[#5E607E] cursor-not-allowed'
                      : 'text-[#3B82F6] hover:text-[#60A5FA]'
                  }`}
                >
                  {emailCountdown > 0 ? (
                    `Resend in ${emailCountdown}s`
                  ) : (
                    <>
                      <Send size={13} />
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyEmailCode}
                disabled={emailCode.length !== 6}
                className="w-full bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:from-[#1D4ED8]/30 disabled:to-[#1E40AF]/30 disabled:cursor-not-allowed text-white font-semibold rounded-[14px] py-3 text-[14px] transition-all shadow-[0_4px_20px_rgba(29,78,216,0.5),0_0_0_1px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_24px_rgba(29,78,216,0.6),0_0_0_1px_rgba(59,130,246,0.5)]"
              >
                Verify Email
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};