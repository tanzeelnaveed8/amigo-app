import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, ChevronRight, MessageCircle, Lock, Copy, Check, AtSign, Ghost, AlertCircle, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AmigoSharedMediaScreen } from './AmigoSharedMediaScreen';
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

interface AmigoUserProfileScreenProps {
  onBack: () => void;
  userId?: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
}

const GHOST_POSITIONS = [
    { top: '10%', left: '10%', rotate: -10, size: 24, delay: 0, opacity: 0.06 },
    { top: '30%', right: '15%', rotate: 15, size: 32, delay: 1, opacity: 0.08 },
    { top: '60%', left: '20%', rotate: -5, size: 28, delay: 2, opacity: 0.07 },
    { top: '80%', right: '10%', rotate: 10, size: 20, delay: 0.5, opacity: 0.05 },
    { top: '15%', left: '40%', rotate: 20, size: 18, delay: 1.5, opacity: 0.06 },
];

export const AmigoUserProfileScreen = ({ 
  onBack, 
  userId = 'user-1',
  name = 'Sarah Miller', 
  username = '@sarah_m',
  avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  bio = "Professional napper. 👻 Fluent in sarcasm. Blame the wifi if I vanish. 📶",
  isOnline = true
}: AmigoUserProfileScreenProps) => {
  const { amigoThemeMode: themeMode, blockUser } = useSessionStore();
  const [copied, setCopied] = useState(false);
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showSharedMedia, setShowSharedMedia] = useState(false);
  const [reportUserDialogOpen, setReportUserDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  
  const isDarkMode = themeMode !== 'day';

  if (showSharedMedia) {
    return <AmigoSharedMediaScreen onBack={() => setShowSharedMedia(false)} />;
  }

  const confirmBlockUser = () => {
    blockUser("other", name, avatar);
    setBlockDialogOpen(false);
    onBack();
  };

  const confirmReportUser = () => {
    setReportUserDialogOpen(false);
    // Logic to report user
  };

  // Theme colors matching AmigoHomeScreen
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';
  
  // Custom gradient style with enhanced glow
  const gradientStyle = isDarkMode
    ? `linear-gradient(135deg, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
    : `linear-gradient(135deg, ${themeColor}, ${themeColor}DD, ${themeColor}BB)`;

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]', 
    card: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200/60',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500', 
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100',
    divider: isDarkMode ? 'border-white/5' : 'border-gray-200/60',
  };

  const mediaItems = [
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1461988320302-91b5b4c61e47?auto=format&fit=crop&w=300&q=80',
  ];

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col h-screen w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      
      {/* Ghost Background Pattern */}
      <AnimatePresence>
        {themeMode === 'ghost' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
          >
            {GHOST_POSITIONS.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute text-[#9B7BFF]"
                style={{
                  top: pos.top,
                  left: pos.left,
                  right: pos.right,
                  opacity: pos.opacity || 0.07,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [pos.rotate, pos.rotate + 5, pos.rotate],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: pos.delay,
                }}
              >
                <Ghost size={pos.size} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Area */}
      <motion.div 
        className="flex-none px-5 pt-4 pb-2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between mb-6">
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
            
             {/* Online Status */}
             {isOnline && (
                null
            )}
        </div>

        {/* Signature Header - Enhanced Visual Polish */}
        <div className="flex items-start justify-between mt-1 mb-7">
            <div className="flex-1 pr-4">
                 <motion.h1 
                    className={cn("text-[34px] font-bold leading-[1.1] mb-1", themeClasses.text)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                 >
                    Profile
                    <br />
                    <motion.span
                        className="bg-clip-text text-transparent inline-block"
                        style={{
                            backgroundImage: gradientStyle,
                            filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.35))'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                    {name}
                    </motion.span>
                </motion.h1>
            </div>
            
             <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 150,
                  damping: 15
                }}
            >
                {/* Glow effect behind avatar */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                    style={{ background: themeColor }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.25, 0.35, 0.25],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <Avatar className="w-[88px] h-[88px] border-[3px] shadow-2xl relative" style={{ borderColor: `${themeColor}40` }}>
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                {/* Online indicator with pulse */}
                {isOnline && (
                    <motion.div 
                        className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] z-10"
                        style={{ 
                            backgroundColor: '#10B981',
                            borderColor: isDarkMode ? '#0A0A14' : '#F5F5F7'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full bg-[#10B981]"
                            animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.8, 0, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut"
                            }}
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
      </motion.div>

      {/* Content - Modern Clean Layout */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 z-10 scrollbar-hide">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="space-y-6"
        >
             {/* Bio Section - Enhanced with stagger */}
             {bio && (
                <motion.div 
                    className={cn("pl-4 border-l-[3px] py-1 text-sm leading-normal italic opacity-90", themeClasses.text)} 
                    style={{ borderColor: themeColor }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.92, x: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                >
                    "{bio}"
                </motion.div>
            )}

            {/* Username Pill - Enhanced */}
            <motion.button 
                onClick={handleCopyUsername}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={cn(
                    "w-full flex items-center justify-between p-4 rounded-[16px] border transition-all shadow-sm",
                    themeClasses.card, 
                    themeClasses.hover
                )}
            >
                <div className="flex items-center gap-3">
                    <motion.div 
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: `${themeColor}15` }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <AtSign size={18} style={{ color: themeColor }} />
                    </motion.div>
                    <div className="text-left">
                        <span className={cn("block text-[11px] uppercase tracking-wider opacity-60 mb-0.5", themeClasses.subtext)}>Username</span>
                        <span className={cn("block font-semibold text-[15px]", themeClasses.text)}>{username}</span>
                    </div>
                </div>
                 <motion.div
                    animate={copied ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                >
                    {copied ? (
                        <Check size={18} className="text-green-500" />
                    ) : (
                        <Copy size={18} className={themeClasses.subtext} />
                    )}
                 </motion.div>
            </motion.button>

            {/* Primary Action Button - Enhanced */}
            <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="relative w-full py-4 rounded-[20px] flex items-center justify-center gap-2.5 font-bold text-[16px] text-white overflow-hidden"
                style={{ 
                    background: `linear-gradient(135deg, ${themeMode === 'ghost' ? '#9B7BFF' : '#2563EB'}, ${themeMode === 'ghost' ? '#7C5FD4' : '#1D4ED8'})`,
                    boxShadow: `0 8px 24px ${themeMode === 'ghost' ? 'rgba(155, 123, 255, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`
                }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                        x: ['-100%', '200%'],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                    }}
                />
                <MessageCircle size={20} className="fill-white/20 relative z-10" />
                <span className="relative z-10">Message</span>
            </motion.button>

             {/* Media Strip - Enhanced */}
             <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
             >
                <div className="flex items-center justify-between px-1">
                    <h3 className={cn("font-bold text-[15px]", themeClasses.text)}>Shared Media</h3>
                    <button 
                        onClick={() => setShowSharedMedia(true)}
                        className={cn("text-[11px] font-bold uppercase tracking-wide opacity-60 hover:opacity-100 transition-all hover:scale-105", themeClasses.text)}
                    >
                        View All
                    </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {mediaItems.map((url, i) => (
                        <motion.div 
                            key={i} 
                            onClick={() => setShowSharedMedia(true)}
                            className="flex-none w-24 h-32 rounded-[14px] overflow-hidden relative group cursor-pointer shadow-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.65 + (i * 0.05), duration: 0.4 }}
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                    <motion.div 
                        onClick={() => setShowSharedMedia(true)}
                        className={cn("flex-none w-24 h-32 rounded-[14px] border-2 border-dashed flex items-center justify-center flex-col gap-2 cursor-pointer transition-all", themeClasses.divider)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.85, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -4, borderColor: themeColor }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ImageIcon size={20} className={themeClasses.subtext} />
                    </motion.div>
                </div>
             </motion.div>

             {/* Security & Danger Actions - Enhanced */}
            <motion.div 
                className={cn("rounded-[20px] overflow-hidden border shadow-sm", themeClasses.card)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                 <motion.button 
                    onClick={() => setShowEncryptionModal(true)}
                    className={cn("w-full flex items-center justify-between p-4 transition-all border-b", themeClasses.hover, themeClasses.divider)}
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.99 }}
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${themeColor}10` }}>
                            <Lock size={18} style={{ color: themeColor }} />
                        </div>
                        <span className={cn("font-medium", themeClasses.text)}>Encryption</span>
                    </div>
                    <ChevronRight size={18} className={themeClasses.subtext} />
                 </motion.button>

                 <motion.button 
                    onClick={() => setReportUserDialogOpen(true)}
                    className={cn("w-full flex items-center justify-between p-4 transition-all border-b", themeClasses.hover, themeClasses.divider)}
                    whileHover={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.99 }}
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <AlertCircle size={18} className="text-orange-500" />
                        </div>
                        <span className={cn("font-medium", themeClasses.text)}>Report User</span>
                    </div>
                    <ChevronRight size={18} className={themeClasses.subtext} />
                 </motion.button>

                 <motion.button 
                    onClick={() => setBlockDialogOpen(true)}
                    className={cn("w-full flex items-center justify-between p-4 transition-all text-red-500 hover:bg-red-500/5")}
                    whileTap={{ scale: 0.99 }}
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                            <Ban size={18} className="text-red-500" />
                        </div>
                        <span className="font-medium">Block User</span>
                    </div>
                    <ChevronRight size={18} className={themeClasses.subtext} />
                 </motion.button>
            </motion.div>
            
             <motion.div 
                className="text-center pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.8, duration: 0.5 }}
             >
                <p className={cn("text-[10px] uppercase tracking-widest", themeClasses.subtext)}>
                    User ID: {userId}
                </p>
            </motion.div>

        </motion.div>
      </div>

        {/* Encryption Modal */}
        <Dialog open={showEncryptionModal} onOpenChange={setShowEncryptionModal}>
            <DialogContent className={cn("sm:max-w-md border-0 p-6", isDarkMode ? "bg-[#141422] text-white" : "bg-white text-gray-900")}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                            style={{ backgroundColor: themeColor }}
                        />
                        {/* Icon container */}
                        <div 
                            className="relative p-4 rounded-full border-2"
                            style={{ 
                                backgroundColor: `${themeColor}20`,
                                borderColor: `${themeColor}30`
                            }}
                        >
                            <Lock size={32} style={{ color: themeColor }} strokeWidth={2} />
                        </div>
                    </motion.div>

                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-center text-xl font-bold">End-to-End Encrypted</DialogTitle>
                        <DialogDescription className={cn("text-center text-sm leading-relaxed", themeClasses.subtext)}>
                            Messages and calls in this chat are secured with end-to-end encryption. Only you and {name} can read or listen to them, not even Amigo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center mt-6 w-full">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowEncryptionModal(false)}
                            className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all"
                            style={{ 
                                backgroundColor: themeColor,
                                boxShadow: `0 4px 12px ${themeColor}40`
                            }}
                        >
                            Got it
                        </motion.button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>

        {/* Report User Dialog */}
        <AlertDialog open={reportUserDialogOpen} onOpenChange={setReportUserDialogOpen}>
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
                            className="absolute inset-0 bg-[#FFA500] rounded-full blur-xl"
                        />
                        {/* Icon container */}
                        <div className="relative bg-[#FFA500]/20 p-4 rounded-full border-2 border-[#FFA500]/30">
                            <AlertCircle size={32} className="text-[#FFA500]" strokeWidth={2} />
                        </div>
                    </motion.div>

                    <AlertDialogHeader className="text-center space-y-3">
                        <AlertDialogTitle className="text-xl">Report User?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            Report this user for spam or inappropriate content. The last 5 messages will be forwarded to our team.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmReportUser} 
                            className="bg-[#FFA500] hover:bg-[#FF9500] text-white border-0"
                        >
                            Report User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>

        {/* Block Dialog */}
        <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
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
                            className="absolute inset-0 bg-[#FF6363] rounded-full blur-xl"
                        />
                        {/* Icon container */}
                        <div className="relative bg-[#FF6363]/20 p-4 rounded-full border-2 border-[#FF6363]/30">
                            <Ban size={32} className="text-[#FF6363]" strokeWidth={2} />
                        </div>
                    </motion.div>

                    <AlertDialogHeader className="text-center space-y-3">
                        <AlertDialogTitle className="text-xl">Block {name}?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            Blocked contacts will no longer be able to send you messages. You can unblock them anytime from Settings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmBlockUser} 
                            className="bg-[#FF6363] hover:bg-[#FF4545] text-white border-0"
                        >
                            Block User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
};
