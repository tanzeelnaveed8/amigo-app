import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Send, CheckCircle2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

interface OtpScreenProps {
  phoneNumber: string;
  onVerify: () => void;
  onBack: () => void;
}

export const OtpScreen = ({ phoneNumber, onVerify, onBack }: OtpScreenProps) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [justResent, setJustResent] = useState(false);

  const handleVerify = () => {
    if (otp.length !== 6) return;
    
    setIsVerifying(true);
    setTimeout(() => {
      onVerify();
    }, 800);
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    
    setIsResending(true);
    setOtp('');
    
    // Simulate sending code
    setTimeout(() => {
      setIsResending(false);
      setJustResent(true);
      setResendCountdown(60);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setJustResent(false);
      }, 3000);
    }, 800);
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-[#0A0A14] px-6 pt-12 pb-8"
    >
      {/* Header */}
      <div className="flex items-center mb-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center mb-12">
          {/* Shield Icon with Glow */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Glow effect */}
              <motion.div
                animate={{ 
                  scale: otp.length === 6 ? [1, 1.2, 1] : [1, 1.1, 1],
                  opacity: otp.length === 6 ? [0.7, 0.5, 0.7] : [0.5, 0.3, 0.5]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#1D4ED8] rounded-full blur-xl"
              />
              {/* Extra glow when OTP is complete */}
              {otp.length === 6 && (
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
              <div className={`relative bg-[#141422] p-5 rounded-full border transition-all duration-300 ${
                otp.length === 6 
                  ? 'border-[#2563EB] shadow-[0_0_24px_rgba(37,99,235,0.4)]' 
                  : 'border-[rgba(29,78,216,0.3)]'
              }`}>
                <Shield 
                  size={32} 
                  className={`transition-all duration-300 ${
                    otp.length === 6
                      ? 'text-[#3B82F6] drop-shadow-[0_0_12px_rgba(59,130,246,1)]'
                      : 'text-[#3B82F6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                  }`}
                />
              </div>
            </motion.div>
          </motion.div>
          
          <h1 className="text-[28px] font-bold text-white text-center mb-3">
            Verify Phone Number
          </h1>
          <p className="text-[16px] text-[#8B8CAD] text-center max-w-xs">
            Enter the 6-digit code sent to
          </p>
          <p className="text-[16px] text-white font-medium mt-1">
            {phoneNumber}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-8">
          <InputOTP 
            maxLength={6} 
            value={otp} 
            onChange={setOtp}
          >
            <InputOTPGroup className="gap-3">
              <InputOTPSlot 
                index={0} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
              <InputOTPSlot 
                index={1} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
              <InputOTPSlot 
                index={2} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
              <InputOTPSlot 
                index={3} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
              <InputOTPSlot 
                index={4} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
              <InputOTPSlot 
                index={5} 
                className="w-[52px] h-[56px] text-[24px] font-semibold border-2 border-[rgba(29,78,216,0.5)] bg-gradient-to-br from-[#141422] to-[#1a1a2e] text-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.25),0_0_20px_rgba(37,99,235,0.3)] focus:bg-[#1a1a32] data-[active]:border-[#2563EB]/70 data-[active]:shadow-[0_0_16px_rgba(37,99,235,0.2)]" 
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Resend */}
        <div className="text-center mb-8">
          <button 
            onClick={handleResend}
            disabled={resendCountdown > 0 || isResending}
            className={`text-[14px] font-medium inline-flex items-center gap-1.5 transition-all ${
              resendCountdown > 0 || isResending
                ? 'text-[#5E607E] cursor-not-allowed'
                : 'text-[#3B82F6] hover:text-[#60A5FA]'
            }`}
          >
            {isResending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full"
                />
                Sending...
              </>
            ) : justResent ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 size={16} className="text-[#3B82F6]" />
                </motion.div>
                Code sent!
              </>
            ) : resendCountdown > 0 ? (
              `Resend in ${resendCountdown}s`
            ) : (
              <>
                <Send size={16} />
                Resend Code
              </>
            )}
          </button>
        </div>

        {/* Verify Button */}
        <div className="mt-auto">
          <button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] disabled:from-[#1D4ED8]/30 disabled:to-[#1E40AF]/30 disabled:cursor-not-allowed text-white font-semibold rounded-[16px] py-4 text-[16px] transition-all shadow-[0_4px_24px_rgba(29,78,216,0.5),0_0_0_1px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_28px_rgba(29,78,216,0.6),0_0_0_1px_rgba(59,130,246,0.5)]"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Verifying...
              </span>
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};