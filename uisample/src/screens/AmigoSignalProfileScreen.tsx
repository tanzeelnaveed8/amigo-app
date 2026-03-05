import React, { useState } from 'react';
import { ArrowLeft, Bell, Ban, Flag, Image as ImageIcon, FileText, Video, Mic, ChevronRight, Share2, Mail, MessageCircle, Phone, UserPlus, Ghost, Shield, Copy, Check, Search, Lock, Users, LogOut, Info, Settings, Megaphone, Globe, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';
import { AmigoSharedMediaScreen } from './AmigoSharedMediaScreen';
import { AmigoSignalSettingsScreen } from './AmigoSignalSettingsScreen';
import { AmigoSignalSearchScreen } from './AmigoSignalSearchScreen';
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

interface AmigoSignalProfileScreenProps {
  onBack: () => void;
  chatId?: string;
  name?: string;
  username?: string;
  avatar?: string;
  description?: string;
  subscribersCount?: string;
}

const GHOST_POSITIONS = [
    { top: '10%', left: '10%', rotate: -10, size: 24, delay: 0 },
    { top: '30%', right: '15%', rotate: 15, size: 32, delay: 1 },
    { top: '60%', left: '20%', rotate: -5, size: 28, delay: 2 },
    { top: '80%', right: '10%', rotate: 10, size: 20, delay: 0.5 },
    { top: '15%', left: '40%', rotate: 20, size: 18, delay: 1.5 },
];

export const AmigoSignalProfileScreen = ({ 
  onBack, 
  chatId = 'signal-1',
  name = 'Tech News Daily', 
  username = '@technews',
  avatar,
  description = 'Your daily dose of the latest technology news, breakthroughs, and insights. 🚀',
  subscribersCount = '12.5K'
}: AmigoSignalProfileScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  const [showSharedMedia, setShowSharedMedia] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [leaveSignalDialogOpen, setLeaveSignalDialogOpen] = useState(false);
  const [reportSignalDialogOpen, setReportSignalDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isDarkMode = themeMode !== 'day';

  if (showSearch) {
      return <AmigoSignalSearchScreen onBack={() => setShowSearch(false)} chatId={chatId} />;
  }

  if (showSharedMedia) {
      return <AmigoSharedMediaScreen onBack={() => setShowSharedMedia(false)} />;
  }

  if (showSettings) {
      return <AmigoSignalSettingsScreen onBack={() => setShowSettings(false)} name={name} chatId={chatId} description={description} />;
  }

  // Theme colors matching AmigoHomeScreen
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';
  const themeGradient = themeMode === 'ghost'
    ? 'from-[#9B7BFF] to-[#7C5FD4]' 
    : themeMode === 'day'
    ? 'from-[#2563EB] to-[#1E40AF]'
    : 'from-[#3B82F6] to-[#1D4ED8]';

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    card: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200/60',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    border: isDarkMode ? 'border-white/5' : 'border-gray-200',
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100',
  };

  const mediaItems = [
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80',
  ];

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      
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
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mb-6">
            <motion.button 
                onClick={onBack}
                className={cn(
                "p-2 -ml-2 rounded-xl transition-all duration-200",
                isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
                )}
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={24} className={themeClasses.subtext} />
            </motion.button>
            
            
        </div>

        {/* Signature Header Style */}
        <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex-1">
                <motion.p 
                className={cn("text-[15px] font-medium mb-1", themeClasses.subtext)}
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                Signal Profile
                </motion.p>
                <motion.h1 
                className={`text-[32px] font-bold leading-tight tracking-tight bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent pb-1`}
                initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                {name}
                </motion.h1>
            </div>
            
             <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
            >
                <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-white/10 shadow-lg">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#10B981]",
                        isDarkMode ? "border-[#0A0A14]" : "border-[#F5F5F7]"
                    )}>
                        <Megaphone size={12} className="text-white" />
                    </div>
                </div>
            </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 z-10 scrollbar-hide">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
        >
            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
                <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSearch(true)}
                        className={cn("flex-1 py-3 px-4 rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[15px] transition-all shadow-md hover:shadow-lg border", themeClasses.card, themeClasses.hover, themeClasses.text)}
                >
                    <Search size={18} />
                    <span>Search</span>
                </motion.button>
                 <motion.button 
                        whileTap={{ scale: 0.95 }}
                        className={cn("p-3 rounded-[16px] border transition-colors", themeClasses.card, themeClasses.hover)}
                >
                    <Globe size={20} className={themeClasses.text} />
                </motion.button>
            </div>

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

            {/* Info Card */}
            <div className={cn("rounded-[24px] p-5 border overflow-hidden relative", themeClasses.card)}>
                 <div className="space-y-4">
                    <div>
                        <p className={cn("text-xs font-medium uppercase tracking-wider mb-1 opacity-70", themeClasses.subtext)}>About</p>
                        <p className={cn("text-[15px] leading-relaxed", themeClasses.text)}>
                            {description}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                        <Users size={16} className={themeClasses.subtext} />
                        <span className={cn("text-sm font-medium", themeClasses.text)}>{subscribersCount} Subscribers</span>
                    </div>
                 </div>
            </div>

            {/* Media Section */}
            <div className={cn("p-5 rounded-[24px] border", themeClasses.card)}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={cn("font-bold text-[17px]", themeClasses.text)}>Signal Media</h3>
                    <button 
                        onClick={() => setShowSharedMedia(true)}
                        className={cn("text-xs font-bold uppercase tracking-wide hover:opacity-80 transition-opacity", themeColor)}
                    >
                        View All
                    </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {mediaItems.map((url, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.05 }}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    >
                        <img src={url} alt="Shared media" className="w-full h-full object-cover" />
                    </motion.div>
                    ))}
                </div>
            </div>

            {/* Settings & Danger Zone */}
            <div className={cn("rounded-[24px] border overflow-hidden", themeClasses.card)}>
                 <button 
                    onClick={() => setShowSettings(true)}
                    className={cn("w-full flex items-center justify-between p-4 transition-colors border-b", themeClasses.hover, themeClasses.border)}
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gray-500/10 text-gray-500">
                            <Settings size={20} />
                        </div>
                        <span className={cn("font-medium", themeClasses.text)}>Signal Settings</span>
                    </div>
                     <ChevronRight size={18} className={themeClasses.subtext} />
                </button>
                 <button 
                    onClick={() => setLeaveSignalDialogOpen(true)}
                    className={cn("w-full flex items-center gap-3 p-4 transition-colors hover:bg-red-500/5 text-red-500 border-b", themeClasses.border)}
                 >
                    <div className="p-2 rounded-xl bg-red-500/10">
                        <LogOut size={20} />
                    </div>
                    <span className="font-medium">Leave Signal</span>
                </button>
                <button 
                    onClick={() => setReportSignalDialogOpen(true)}
                    className={cn("w-full flex items-center gap-3 p-4 transition-colors hover:bg-red-500/5 text-red-500")}
                >
                     <div className="p-2 rounded-xl bg-red-500/10">
                        <Flag size={20} />
                    </div>
                    <span className="font-medium">Report Signal</span>
                </button>
            </div>

            <div className="text-center pb-6">
                <p className={cn("text-xs", themeClasses.subtext)}>
                    Signal ID: {chatId} • Public Signal
                </p>
            </div>
        </motion.div>
      </div>

      {/* Leave Signal Dialog */}
      <AlertDialog open={leaveSignalDialogOpen} onOpenChange={setLeaveSignalDialogOpen}>
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
                    <LogOut size={32} className="text-[#FF6363]" strokeWidth={2} />
                  </div>
              </motion.div>

              <AlertDialogHeader className="text-center space-y-3">
                <AlertDialogTitle className="text-xl">Leave Signal?</AlertDialogTitle>
                <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                  You will no longer receive updates from this signal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                 <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                    Cancel
                 </AlertDialogCancel>
                 <AlertDialogAction 
                    onClick={onBack} 
                    className="bg-[#FF6363] hover:bg-[#FF4545] text-white border-0"
                  >
                    Leave Signal
                 </AlertDialogAction>
              </AlertDialogFooter>
           </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Signal Dialog */}
      <AlertDialog open={reportSignalDialogOpen} onOpenChange={setReportSignalDialogOpen}>
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
                    <Flag size={32} className="text-[#FFA500]" strokeWidth={2} />
                  </div>
              </motion.div>

              <AlertDialogHeader className="text-center space-y-3">
                <AlertDialogTitle className="text-xl">Report Signal?</AlertDialogTitle>
                <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                  Report this signal for inappropriate content. Our moderation team will review it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                 <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                    Cancel
                 </AlertDialogCancel>
                 <AlertDialogAction 
                    onClick={() => setReportSignalDialogOpen(false)} 
                    className="bg-[#FFA500] hover:bg-[#FF9500] text-white border-0"
                 >
                    Report Signal
                 </AlertDialogAction>
              </AlertDialogFooter>
           </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
