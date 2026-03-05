import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface WelcomeMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  isDarkMode: boolean;
  themeColor: string;
  themeMode: 'day' | 'night' | 'ghost';
}

export const WelcomeMessageDialog: React.FC<WelcomeMessageDialogProps> = ({
  isOpen,
  onClose,
  userName,
  isDarkMode,
  themeColor,
  themeMode
}) => {
  // Always use purple/ghost theme for welcome message
  const purpleColor = '#9B7BFF';
  const purpleGradient = 'from-[#9B7BFF] to-[#7C5FD4]';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.5 
              }}
              className="pointer-events-auto w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn(
                "relative rounded-3xl shadow-2xl overflow-hidden border",
                isDarkMode 
                  ? "bg-[#0A0A14] border-white/10" 
                  : "bg-white border-gray-200"
              )}>
                {/* Animated gradient glow background */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${purpleColor}, transparent 70%)`
                  }}
                />

                {/* Close button */}
                

                {/* Content */}
                <div className="relative p-8 pt-12">
                  {/* Floating hearts animation */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        initial={{ 
                          y: "100%", 
                          x: `${Math.random() * 100}%`,
                          opacity: 0,
                          scale: 0.5
                        }}
                        animate={{ 
                          y: "-20%", 
                          opacity: [0, 0.6, 0],
                          scale: [0.5, 1, 0.8],
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 6 + i,
                          repeat: Infinity,
                          delay: i * 1.2,
                          ease: "easeInOut"
                        }}
                        style={{ color: purpleColor }}
                      >
                        <Heart size={16} fill="currentColor" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Icon with bounce */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="flex justify-center mb-6"
                  >
                    <div className="relative">
                      {/* Pulsing glow */}
                      <motion.div
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.5, 0.2, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{ backgroundColor: purpleColor }}
                      />
                      
                      {/* Icon container */}
                      <motion.div
                        animate={{ 
                          rotate: [0, -10, 10, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative p-5 rounded-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${purpleColor}40, ${purpleColor}20)`,
                          border: `2px solid ${purpleColor}60`
                        }}
                      >
                        <Sparkles size={32} style={{ color: purpleColor }} strokeWidth={2.5} />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Welcome text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center space-y-4"
                  >
                    <motion.h2
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className={cn(
                        "text-2xl font-bold",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}
                    >
                      Welcome to Amigo, {userName}! 
                    </motion.h2>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="space-y-4"
                    >
                      <p className={cn(
                        "text-[15px] leading-relaxed",
                        isDarkMode ? "text-white/80" : "text-gray-700"
                      )}>
                        Hey {userName}, I just wanted to say thank you. Seriously. Having you here means everything to me.
                      </p>

                      <p className={cn(
                        "text-[15px] leading-relaxed",
                        isDarkMode ? "text-white/80" : "text-gray-700"
                      )}>
                        I built Amigo from my <span className="font-semibold" style={{ color: purpleColor }}>heart and soul</span> because I believe real connections matter. Your voice, your needs, your thoughts — they're not just important to me, they're <span className="font-semibold" style={{ color: purpleColor }}>everything</span> this platform stands for.
                      </p>

                      <motion.p 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className={cn(
                          "text-[15px] font-semibold pt-2",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}
                      >
                        Welcome to the family. Let's build something beautiful together. 💜
                      </motion.p>
                    </motion.div>

                    {/* Signature */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className={cn(
                        "pt-4 text-sm italic border-t",
                        isDarkMode 
                          ? "text-white/60 border-white/10" 
                          : "text-gray-500 border-gray-200"
                      )}
                    >
                      With all my heart,
                      <br />
                      <span className="font-semibold not-italic" style={{ color: purpleColor }}>
                        Founder
                      </span>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-full py-4 rounded-2xl font-semibold text-white text-[15px] transition-all shadow-lg mt-6 cursor-pointer relative z-10",
                        `bg-gradient-to-r ${purpleGradient}`
                      )}
                      style={{
                        boxShadow: `0 8px 24px ${purpleColor}40`
                      }}
                    >
                      Let's Get Started! 🚀
                    </motion.button>
                  </motion.div>
                </div>

                {/* Bottom decorative glow */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-32 opacity-20 blur-2xl"
                  style={{
                    background: `linear-gradient(to top, ${purpleColor}, transparent)`
                  }}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};