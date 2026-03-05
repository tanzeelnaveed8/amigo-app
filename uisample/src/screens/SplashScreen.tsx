import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Ghost } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#050509] to-[#141426]"
      aria-label="Ghost Mode splash screen"
      role="banner"
    >
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatType: "reverse" }}
        >
          <Ghost size={120} className="text-[#9B7BFF] mb-8" fill="url(#ghost-gradient)" />
          <svg width="0" height="0">
            <linearGradient id="ghost-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop stopColor="#5FD4FF" offset="0%" />
              <stop stopColor="#9B7BFF" offset="100%" />
            </linearGradient>
          </svg>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[32px] font-bold text-white tracking-tight leading-[38px] mt-5"
        >
          Ghost Mode
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm text-[#8B8CAD] mt-2 font-medium"
        >
          Anonymous · Temporary · Free
        </motion.p>
      </div>
    </div>
  );
};
