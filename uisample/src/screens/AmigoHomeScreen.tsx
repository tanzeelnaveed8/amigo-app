import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, AlignJustify, Sun, Ghost, User, Settings, Trash2, LogOut, X, UserPlus, Copy, Check, Moon, ScanLine, Wallet } from 'lucide-react';
import { Avatar } from '../components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { InviteCodeModal } from '../components/InviteCodeModal';
import { LogoutModal } from '../components/LogoutModal';
import { WelcomeMessageDialog } from '../components/WelcomeMessageDialog';
import { ContactsScreen } from './ContactsScreen';
import { SettingsScreen } from './SettingsScreen';
import { DeleteAccountScreen } from './DeleteAccountScreen';
import { BlockedUsersScreen } from './BlockedUsersScreen';
import { SecurityDataScreen } from './SecurityDataScreen';
import { CreateRoomSignalScreen } from './CreateRoomSignalScreen';
import { AmigoGuidelinesScreen } from './AmigoGuidelinesScreen';
import { useSessionStore } from '../stores/useSessionStore';

interface AmigoHomeScreenProps {
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenChat: (chatId: string, type: 'dm' | 'group' | 'channel') => void;
}

type ScreenType = 'home' | 'contacts' | 'settings' | 'delete-account' | 'blocked-users' | 'security-data' | 'create-room-signal' | 'community-guidelines';
type TabType = 'dm' | 'groups' | 'signals';

const MOCK_DM_CHATS = [
  {
    id: '1',
    name: 'Sarah Wilson',
    lastMessage: 'Hey, there!!',
    timestamp: '10:00 am',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    lastMessage: 'Thanks for the help! 🙏',
    timestamp: '9:45 am',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Emma Davis',
    lastMessage: 'Can you send me that document?',
    timestamp: '9:30 am',
    unreadCount: 5,
    isOnline: false,
  },
  {
    id: '4',
    name: 'James Rodriguez',
    lastMessage: 'Perfect! Let me know when you\'re ready',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Sophie Turner',
    lastMessage: 'See you at the coffee shop! ☕',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
];

const MOCK_GROUP_CHATS = [
  {
    id: 'g1',
    name: 'Team Awesome',
    lastMessage: 'Alex: Don\'t forget the meeting at 3',
    timestamp: '3:20 PM',
    unreadCount: 12,
    isOnline: false,
  },
  {
    id: 'g2',
    name: 'Family',
    lastMessage: 'Mom: Dinner this Sunday?',
    timestamp: '11:30 AM',
    unreadCount: 3,
    isOnline: false,
  },
  {
    id: 'g3',
    name: 'College Friends',
    lastMessage: 'You: Sounds good to me!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'g4',
    name: 'Weekend Warriors',
    lastMessage: 'Jake: Who\'s up for hiking?',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
];

const MOCK_SIGNALS = [
  {
    id: 's1',
    name: 'Tech News Daily',
    lastMessage: 'New breakthrough in AI technology announced',
    timestamp: '4:15 PM',
    unreadCount: 8,
    isOnline: false,
  },
  {
    id: 's2',
    name: 'Fitness Goals',
    lastMessage: 'Morning workout reminder! 💪',
    timestamp: '6:00 AM',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: 's3',
    name: 'Weekend Plans',
    lastMessage: 'New event: Saturday hiking trip',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
];

export const AmigoHomeScreen = ({ onLogout, onOpenWallet, onOpenChat }: AmigoHomeScreenProps) => {
  const { 
    amigoThemeMode: themeMode, 
    setAmigoThemeMode: setThemeMode,
    hasSeenWelcomeMessage,
    markWelcomeMessageAsSeen,
    incrementRoomCreation,
    canCreateRoom,
    getRoomsCreatedToday,
    hasSignal,
    createSignal
  } = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>('dm');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const username = 'Alex';

  // Show welcome message on first load if not seen before
  useEffect(() => {
    if (!hasSeenWelcomeMessage) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowWelcomeMessage(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcomeMessage]);

  const handleCloseWelcome = () => {
    setShowWelcomeMessage(false);
    markWelcomeMessageAsSeen();
  };

  // Determine if dark mode based on theme
  const isDarkMode = themeMode !== 'day';

  // Theme colors based on mode
  // Day mode (light): Vivid Blue theme
  // Night mode (dark): Soft Blue theme
  // Ghost mode (dark): Purple theme
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';
  const themeGradient = themeMode === 'ghost'
    ? 'from-[#9B7BFF] to-[#7C5FD4]' 
    : themeMode === 'day'
    ? 'from-[#2563EB] to-[#1E40AF]'
    : 'from-[#3B82F6] to-[#1D4ED8]';
  const themeShadow = themeMode === 'ghost'
    ? '0 8px 24px rgba(155, 123, 255, 0.4)' 
    : themeMode === 'day'
    ? '0 8px 24px rgba(37, 99, 235, 0.35)'
    : '0 8px 24px rgba(59, 130, 246, 0.4)';

  // Handle theme toggle: day -> night -> ghost -> day
  const handleThemeToggle = () => {
    if (themeMode === 'day') {
      setThemeMode('night');
    } else if (themeMode === 'night') {
      setThemeMode('ghost');
    } else {
      setThemeMode('day');
    }
  };

  // Get the appropriate icon for current theme
  const getThemeIcon = () => {
    if (themeMode === 'day') {
      return <Moon size={22} />;
    } else {
      // Both night and ghost modes show Ghost icon
      return <Ghost size={22} />;
    }
  };

  // Get icon color based on theme
  const getIconColor = () => {
    if (themeMode === 'day') {
      return 'text-[#2563EB]'; // Vivid Blue for day mode
    } else if (themeMode === 'night') {
      return 'text-[#3B82F6]'; // Soft Blue for night mode
    } else {
      return 'text-[#9B7BFF]'; // Purple for ghost mode
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleCreateRoom = (data: any) => {
    // Handle room creation
    console.log('Creating room:', data);
    incrementRoomCreation();
    setCurrentScreen('home');
    // TODO: Add to rooms list
  };

  const handleCreateSignal = (data: any) => {
    // Handle signal creation
    console.log('Creating signal:', data);
    createSignal();
    setCurrentScreen('home');
    // TODO: Add to signals list
  };

  const getTabUnread = (tab: TabType) => {
    switch (tab) {
      case 'dm':
        return MOCK_DM_CHATS.reduce((sum, chat) => sum + chat.unreadCount, 0);
      case 'groups':
        return MOCK_GROUP_CHATS.reduce((sum, chat) => sum + chat.unreadCount, 0);
      case 'signals':
        return MOCK_SIGNALS.reduce((sum, chat) => sum + chat.unreadCount, 0);
    }
  };

  const getCurrentChats = () => {
    switch (activeTab) {
      case 'dm':
        return MOCK_DM_CHATS;
      case 'groups':
        return MOCK_GROUP_CHATS;
      case 'signals':
        return MOCK_SIGNALS;
    }
  };

  const currentChats = getCurrentChats();

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return currentChats;
    
    const query = searchQuery.toLowerCase();
    return currentChats.filter(chat => 
      chat.name.toLowerCase().includes(query) || 
      chat.lastMessage.toLowerCase().includes(query)
    );
  }, [currentChats, searchQuery]);

  // Separate unread and read chats
  const unreadChats = filteredChats.filter(chat => chat.unreadCount > 0);
  const readChats = filteredChats.filter(chat => chat.unreadCount === 0);

  // Handle mark all as read
  const handleMarkAllRead = () => {
    // In real app, this would update the backend
    console.log('Marking all messages as read');
  };

  // Handle chat click
  const handleChatClick = (chatId: string) => {
    let type: 'dm' | 'group' | 'channel' = 'dm';
    if (activeTab === 'groups') type = 'group';
    if (activeTab === 'signals') type = 'channel';
    
    onOpenChat(chatId, type);
  };

  // Handle profile click
  const handleProfileClick = () => {
    // In real app, this would open profile/settings
    console.log('Opening profile');
  };

  // Handle new chat
  const handleNewChat = () => {
    // Open create room/signal screen
    setCurrentScreen('create-room-signal');
  };

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'} transition-colors duration-300`}>
      {/* Status Bar */}
      <motion.div 
        className="px-5 pt-4 pb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mt-2">
          <motion.button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 -ml-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            aria-label="Open menu"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9, rotate: -5 }}
          >
            <AlignJustify size={24} className={`${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'} transition-transform duration-200`} />
          </motion.button>
          <motion.button 
            onClick={handleThemeToggle}
            className={`p-2 rounded-xl transition-all duration-200 opacity-75 hover:opacity-100 ${
              themeMode === 'ghost'
                ? 'text-[#9B7BFF] hover:bg-white/3 active:bg-white/5'
                : themeMode === 'night'
                ? 'text-[#3B82F6] hover:bg-white/3 active:bg-white/5'
                : 'text-[#2563EB] hover:bg-gray-50 active:bg-gray-100'
            }`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            whileHover={{ scale: 1.15, rotate: 15 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
          >
            <motion.div
              key={themeMode}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {getThemeIcon()}
            </motion.div>
          </motion.button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div 
        className="px-5 pt-2 pb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <motion.p 
              className={`text-[15px] font-medium mb-1 ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
              initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {getGreeting()}
            </motion.p>
            <motion.h1 
              className={`text-[32px] font-bold leading-tight tracking-tight bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent pb-1`}
              initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {username}
            </motion.h1>
          </div>
          <motion.button 
            onClick={handleProfileClick}
            className={`w-[56px] h-[56px] rounded-full bg-gradient-to-br ${themeGradient} flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 mt-4 relative overflow-hidden`}
            whileHover={{ 
              scale: 1.15,
            }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5, rotate: -180, boxShadow: '0 0 0 rgba(0,0,0,0)' }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            style={{
              boxShadow: `0 4px 12px ${themeMode === 'ghost' ? 'rgba(155, 123, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
            }}
            aria-label="View profile"
          >
            <motion.span 
              className="text-white font-bold text-[18px]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 15 }}
            >
              {username[0]}
            </motion.span>
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              animate={{ 
                opacity: [0, 0.2, 0],
                scale: [0.8, 1.2, 1.4],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.button>
        </div>

        {/* Search */}
        <motion.div 
          className={`relative rounded-[14px] overflow-hidden transition-all duration-300 ${
            isDarkMode ? 'bg-[#141422] border border-white/5' : 'bg-white border border-gray-200/60'
          }`}
          initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            boxShadow: searchFocused 
              ? themeMode === 'ghost'
                ? '0 0 0 3px rgba(155, 123, 255, 0.3), 0 10px 20px rgba(155, 123, 255, 0.2)'
                : themeMode === 'day'
                ? '0 0 0 3px rgba(37, 99, 235, 0.3), 0 10px 20px rgba(37, 99, 235, 0.15)'
                : '0 0 0 3px rgba(59, 130, 246, 0.3), 0 10px 20px rgba(59, 130, 246, 0.2)'
              : '0px 0px 0px 0px transparent, 0px 0px 0px 0px transparent'
          }}
          transition={{ 
            type: "spring",
            stiffness: 320,
            damping: 28,
            delay: 0.45,
            boxShadow: { 
              type: "spring",
              stiffness: 400,
              damping: 30,
              duration: 0.25
            }
          }}
        >
          <motion.div
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ 
              opacity: searchFocused ? 1 : 0.6,
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <motion.div
              animate={{
                scale: searchFocused ? 1.08 : 1,
                rotate: searchFocused ? 3 : 0,
              }}
              transition={{
                scale: {
                  type: "spring",
                  stiffness: 350,
                  damping: 20
                },
                rotate: { 
                  duration: 0.3,
                  ease: "easeInOut"
                }
              }}
            >
              <Search size={17} className={`transition-colors duration-300 ${
                searchFocused
                  ? themeMode === 'ghost' ? 'text-[#9B7BFF]' : themeMode === 'day' ? 'text-[#2563EB]' : 'text-[#3B82F6]'
                  : isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
              }`} />
            </motion.div>
          </motion.div>
          <motion.input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            initial={{ opacity: 0, x: -6, filter: "blur(3px)" }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              filter: "blur(0px)",
              paddingLeft: searchFocused ? 42 : 40,
            }}
            whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.008)" }}
            style={{ backgroundColor: "rgba(0,0,0,0)" }}
            className={`w-full py-3 pl-10 pr-10 outline-none text-[15px] transition-colors duration-300 ${
              isDarkMode ? 'text-white placeholder:text-[#5E607E]' : 'text-gray-900 placeholder:text-gray-400'
            }`}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30, 
              mass: 0.75,
              opacity: { duration: 0.35, delay: 0.5, ease: "easeOut" },
              x: { type: "spring", stiffness: 320, damping: 26, delay: 0.52 },
              filter: { duration: 0.45, delay: 0.5, ease: "easeOut" },
              paddingLeft: { type: "spring", stiffness: 500, damping: 35 },
              backgroundColor: { duration: 0.2, ease: "easeOut" },
            }}
          />
          {/* Clear (X) Button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 ${
                    isDarkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                initial={{ opacity: 0, scale: 0, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: 90 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 22,
                }}
                onClick={() => setSearchQuery('')}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
              >
                <X size={12} className={isDarkMode ? 'text-white/70' : 'text-gray-600'} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Tabs - Horizontal Pills */}
      <motion.div 
        className="px-5 mb-5 mt-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className={`inline-flex rounded-[16px] p-1 gap-0.5 border ${
          isDarkMode ? 'bg-[#141422] border-transparent' : 'bg-white border-gray-200/40'
        }`}>
          <motion.button
            onClick={() => setActiveTab('dm')}
            className={`relative px-6 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all duration-300 ${
              activeTab === 'dm'
                ? 'text-white shadow-sm'
                : isDarkMode
                ? 'text-[#8B8CAD] hover:text-[#A8A9C5]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === 'dm' ? { backgroundColor: themeColor } : {}}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: activeTab === 'dm' ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label="Direct messages"
          >
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: activeTab === 'dm' ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              Direct
            </motion.span>
            <AnimatePresence>
              {getTabUnread('dm') > 0 && (
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 600, 
                    damping: 15,
                    opacity: { duration: 0.2 }
                  }}
                  style={{
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.4)'
                  }}
                >
                  {getTabUnread('dm') >= 10 ? '9+' : getTabUnread('dm')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('groups')}
            className={`relative px-6 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all duration-300 ${
              activeTab === 'groups'
                ? 'text-white shadow-sm'
                : isDarkMode
                ? 'text-[#8B8CAD] hover:text-[#A8A9C5]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === 'groups' ? { backgroundColor: themeColor } : {}}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: activeTab === 'groups' ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label="Group chats"
          >
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: activeTab === 'groups' ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >Rooms</motion.span>
            <AnimatePresence>
              {getTabUnread('groups') > 0 && (
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 600, 
                    damping: 15,
                    opacity: { duration: 0.2 }
                  }}
                  style={{
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.4)'
                  }}
                >
                  {getTabUnread('groups') >= 10 ? '9+' : getTabUnread('groups')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('signals')}
            className={`relative px-6 py-2.5 rounded-[14px] text-[13px] font-semibold transition-all duration-300 ${
              activeTab === 'signals'
                ? 'text-white shadow-sm'
                : isDarkMode
                ? 'text-[#8B8CAD] hover:text-[#A8A9C5]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === 'signals' ? { backgroundColor: themeColor } : {}}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: activeTab === 'signals' ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label="Signal notifications"
          >
            <motion.span
              initial={{ y: 0 }}
              animate={{ y: activeTab === 'signals' ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              Signals
            </motion.span>
            <AnimatePresence>
              {getTabUnread('signals') > 0 && (
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.2 }
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 600, 
                    damping: 15,
                    opacity: { duration: 0.2 }
                  }}
                  style={{
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 0 rgba(239, 68, 68, 0.4)'
                  }}
                >
                  {getTabUnread('signals') >= 10 ? '9+' : getTabUnread('signals')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Unread Messages Section */}
        <AnimatePresence mode="wait">
          {unreadChats.length > 0 && (
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              key="unread-section"
            >
              <motion.div 
                className="px-5 mb-3 flex items-center justify-between"
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h2 className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                }`}>
                  Unread • {unreadChats.length}
                </h2>
                <motion.button 
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold uppercase tracking-wide transition-all duration-200"
                  style={{ color: themeColor }}
                  whileHover={{ scale: 1.08, x: 2 }}
                  whileTap={{ scale: 0.92 }}
                >
                  Mark all read
                </motion.button>
              </motion.div>
              <div className="space-y-0.5">
                {unreadChats.map((chat, index) => (
                  <motion.button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`w-full px-5 py-3.5 transition-all duration-200 relative ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -30, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.6 + index * 0.06,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    whileTap={{ x: 6, scale: 0.98 }}
                  >
                    {/* Indicator line */}
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" 
                      style={{ backgroundColor: themeColor }}
                      initial={{ scaleY: 0, originY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.65 + index * 0.06,
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                    />
                    
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="relative flex-shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                          delay: 0.65 + index * 0.06
                        }}
                      >
                        <Avatar name={chat.name} size="lg" />
                        {chat.isOnline && (
                          <motion.div 
                            className={`absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-[#10B981] rounded-full border-[2.5px] ${
                                isDarkMode ? 'border-[#0A0A14]' : 'border-[#F5F5F7]'
                              }`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 600, 
                              damping: 20,
                              delay: 0.75 + index * 0.06 
                            }}
                          />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.div 
                          className="flex items-baseline justify-between mb-1"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + index * 0.06 }}
                        >
                          <h3 className={`font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {chat.name}
                          </h3>
                          <span 
                            className="text-[11px] font-bold flex-shrink-0 ml-2"
                            style={{ color: themeColor }}
                          >
                            {chat.timestamp}
                          </span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between gap-3"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.75 + index * 0.06 }}
                        >
                          <p className={`text-[14px] font-medium truncate ${
                            isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'
                          }`}>
                            {chat.lastMessage}
                          </p>
                          <motion.div 
                            className="flex-shrink-0 min-w-[22px] h-[22px] px-2 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: themeColor }}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 500, 
                              damping: 20,
                              delay: 0.75 + index * 0.06 
                            }}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                          >
                            <span className="text-white text-[11px] font-bold">
                              {chat.unreadCount >= 10 ? '9+' : chat.unreadCount}
                            </span>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Messages Section */}
        <AnimatePresence mode="wait">
          {readChats.length > 0 && (
            <motion.div 
              className="pb-28"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              key="recent-section"
            >
              <motion.div 
                className="px-5 mb-3"
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ 
                  duration: 0.5, 
                  delay: unreadChats.length > 0 ? 0.6 + unreadChats.length * 0.06 : 0.55,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
              >
                <h2 className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                }`}>
                  Recent
                </h2>
              </motion.div>
              <div className="space-y-0.5">
                {readChats.map((chat, index) => (
                  <motion.button
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    className={`w-full px-5 py-3.5 transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -30, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: unreadChats.length > 0 ? 0.65 + (unreadChats.length * 0.06) + (index * 0.05) : 0.6 + index * 0.06,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    whileTap={{ x: 6, scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="relative flex-shrink-0"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                          delay: unreadChats.length > 0 ? 0.7 + (unreadChats.length * 0.06) + (index * 0.05) : 0.65 + index * 0.06
                        }}
                      >
                        <Avatar name={chat.name} size="lg" />
                        {chat.isOnline && (
                          <motion.div 
                            className={`absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-[#10B981] rounded-full border-[2.5px] ${
                                isDarkMode ? 'border-[#0A0A14]' : 'border-[#F5F5F7]'
                              }`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 600, 
                              damping: 20,
                              delay: unreadChats.length > 0 ? 0.8 + (unreadChats.length * 0.06) + (index * 0.05) : 0.75 + index * 0.06
                            }}
                          />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <motion.div 
                          className="flex items-baseline justify-between mb-1"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: unreadChats.length > 0 ? 0.75 + (unreadChats.length * 0.06) + (index * 0.05) : 0.7 + index * 0.06
                          }}
                        >
                          <h3 className={`font-bold text-[15px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {chat.name}
                          </h3>
                          <span className={`text-[11px] font-medium flex-shrink-0 ml-2 ${
                            isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                          }`}>
                            {chat.timestamp}
                          </span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: unreadChats.length > 0 ? 0.8 + (unreadChats.length * 0.06) + (index * 0.05) : 0.75 + index * 0.06
                          }}
                        >
                          <p className={`text-[14px] font-medium truncate ${
                            isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'
                          }`}>
                            {chat.lastMessage}
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {filteredChats.length === 0 && (
            <motion.div 
              className="flex flex-col items-center justify-center py-20 px-6"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div 
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 ${
                  isDarkMode ? 'bg-[#141422]' : 'bg-white border border-gray-200/60'
                }`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: 0.2 
                }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Search size={36} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-300'} />
                </motion.div>
              </motion.div>
              <motion.p 
                className={`text-[15px] font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {searchQuery ? 'No results found' : 'No conversations yet'}
              </motion.p>
              <motion.p 
                className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {searchQuery ? 'Try searching for something else' : 'Start a new conversation'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button 
        onClick={handleNewChat}
        className={`fixed bottom-6 right-5 w-[58px] h-[58px] rounded-full bg-gradient-to-br ${themeGradient} flex items-center justify-center transition-all duration-300`}
        initial={{ scale: 0, rotate: -180, boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          boxShadow: themeShadow
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.6 
        }}
        whileHover={{ 
          scale: 1.1, 
          rotate: 90,
          boxShadow: isDarkMode 
            ? '0 12px 32px rgba(155, 123, 255, 0.6)' 
            : '0 12px 32px rgba(59, 130, 246, 0.6)'
        }}
        whileTap={{ scale: 0.9 }}
        aria-label="New conversation"
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Add floating animation to FAB */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        button[aria-label="New conversation"] {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Slide-in Menu Panel */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className={`fixed left-0 top-0 bottom-0 w-[75%] max-w-[320px] z-50 ${
                isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'
              }`}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header with Profile */}
                <div className={`pt-6 pb-5 px-5 ${
                  isDarkMode ? 'bg-[#141422]' : 'bg-white'
                }`}>
                  {/* Close Button */}
                  <motion.button
                    onClick={() => setShowMenu(false)}
                    className={`p-2 -ml-2 -mt-1 mb-4 rounded-xl transition-all duration-200 ${
                      isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close menu"
                  >
                    <X size={24} className={isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'} />
                  </motion.button>

                  {/* Profile Info */}
                  <motion.div
                    className="flex items-center gap-4 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div
                      className={`w-[64px] h-[64px] rounded-full bg-gradient-to-br ${themeGradient} flex items-center justify-center shadow-lg`}
                      style={{ 
                        boxShadow: `0 8px 16px ${isDarkMode ? 'rgba(155, 123, 255, 0.4)' : 'rgba(59, 130, 246, 0.4)'}` 
                      }}
                    >
                      <span className="text-white font-bold text-[24px]">{username[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-[20px] font-bold mb-0.5 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {username} Parker
                      </h2>
                      <p className={`text-[14px] font-medium ${
                        isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'
                      }`}>
                        @{username.toLowerCase()}_parker
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Menu Options */}
                <div className="flex-1 py-4 px-2">
                  <motion.button
                    onClick={() => {
                      setCurrentScreen('contacts');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDarkMode ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
                    >
                      <User size={20} style={{ color: themeColor }} />
                    </div>
                    <span className={`text-[16px] font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Contacts
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setShowInviteModal(true);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDarkMode ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
                    >
                      <UserPlus size={20} style={{ color: themeColor }} />
                    </div>
                    <span className={`text-[16px] font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Invite
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setShowQRScanner(true);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.19 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDarkMode ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
                    >
                      <ScanLine size={20} style={{ color: themeColor }} />
                    </div>
                    <span className={`text-[16px] font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Scan QR
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                        onOpenWallet();
                        setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.195 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDarkMode ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
                    >
                      <Wallet size={20} style={{ color: themeColor }} />
                    </div>
                    <span className={`text-[16px] font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>Wallet</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setCurrentScreen('settings');
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-[#141422] active:bg-[#1A1A2E]' 
                        : 'hover:bg-white active:bg-gray-50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isDarkMode ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)' }}
                    >
                      <Settings size={20} style={{ color: themeColor }} />
                    </div>
                    <span className={`text-[16px] font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Settings
                    </span>
                  </motion.button>

                  
                </div>

                {/* Logout Button at Bottom */}
                <div className="p-5 border-t border-white/5">
                  <motion.button
                    onClick={() => {
                      setShowLogoutModal(true);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-[#141422] hover:bg-[#1A1A2E] active:bg-[#1F1F33]' 
                        : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={20} className="text-[#EF4444]" />
                    <span className={`text-[16px] font-bold text-[#EF4444]`}>
                      Log Out
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invite Code Modal */}
      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        isDarkMode={isDarkMode}
        themeColor={themeColor}
        themeGradient={themeGradient}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onLogout}
        isDarkMode={isDarkMode}
        themeColor={themeColor}
      />

      {/* Welcome Message Dialog */}
      <WelcomeMessageDialog
        isOpen={showWelcomeMessage}
        onClose={handleCloseWelcome}
        userName={username}
        isDarkMode={isDarkMode}
        themeColor={themeColor}
        themeMode={themeMode}
      />

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowQRScanner(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Header */}
              <motion.div
                className="w-full max-w-[340px] flex items-center justify-between mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <h2 className="text-white text-[22px] font-bold">Scan QR Code</h2>
                  <p className="text-white/50 text-[13px] mt-0.5">
                    Point camera at a QR code to connect
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowQRScanner(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} className="text-white" />
                </motion.button>
              </motion.div>

              {/* Scanner Viewfinder */}
              <motion.div
                className="relative w-[260px] h-[260px] rounded-[28px] overflow-hidden"
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
              >
                {/* Camera background simulation */}
                <div className={`absolute inset-0 ${
                  isDarkMode ? 'bg-[#1A1A2E]' : 'bg-gray-800'
                }`}>
                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `radial-gradient(circle, ${themeColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Animated scan line */}
                <motion.div
                  className="absolute left-4 right-4 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
                    boxShadow: `0 0 20px ${themeColor}, 0 0 40px ${themeColor}40`
                  }}
                  animate={{ top: ["8%", "88%", "8%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Corner brackets - Top-left */}
                <motion.div
                  className="absolute top-3 left-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                >
                  <div className="w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-lg" style={{ borderColor: themeColor }} />
                </motion.div>
                {/* Top-right */}
                <motion.div
                  className="absolute top-3 right-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 500 }}
                >
                  <div className="w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-lg" style={{ borderColor: themeColor }} />
                </motion.div>
                {/* Bottom-left */}
                <motion.div
                  className="absolute bottom-3 left-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
                >
                  <div className="w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-lg" style={{ borderColor: themeColor }} />
                </motion.div>
                {/* Bottom-right */}
                <motion.div
                  className="absolute bottom-3 right-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, type: "spring", stiffness: 500 }}
                >
                  <div className="w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-lg" style={{ borderColor: themeColor }} />
                </motion.div>

                {/* Center icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  <ScanLine size={48} style={{ color: themeColor }} />
                </motion.div>
              </motion.div>

              {/* Helper text */}
              <motion.p
                className="text-white/40 text-[13px] mt-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Scanning for QR codes...
              </motion.p>

              {/* Action buttons */}
              <motion.div
                className="flex gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, type: "spring", stiffness: 300 }}
              >
                <motion.button
                  className={`px-6 py-3 rounded-xl bg-gradient-to-br ${themeGradient} text-white text-[14px] font-semibold`}
                  initial={{ boxShadow: '0px 0px 0px rgba(0,0,0,0)' }}
                  animate={{ boxShadow: themeShadow }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQRScanner(false)}
                >
                  My QR Code
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-xl text-white text-[14px] font-semibold"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQRScanner(false)}
                >
                  Upload Image
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay Screens */}
      <AnimatePresence>
        {currentScreen === 'contacts' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <ContactsScreen
              onBack={() => setCurrentScreen('home')}
              isDarkMode={isDarkMode}
              themeColor={themeColor}
              themeGradient={themeGradient}
            />
          </motion.div>
        )}

        {currentScreen === 'settings' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <SettingsScreen
              onBack={() => setCurrentScreen('home')}
              onDeleteAccount={() => setCurrentScreen('delete-account')}
              onBlockedUsers={() => setCurrentScreen('blocked-users')}
              onSecurityData={() => setCurrentScreen('security-data')}
              onCommunityGuidelines={() => setCurrentScreen('community-guidelines')}
              isDarkMode={isDarkMode}
              themeColor={themeColor}
              themeGradient={themeGradient}
              themeMode={themeMode}
              onThemeChange={setThemeMode}
            />
          </motion.div>
        )}

        {currentScreen === 'delete-account' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <DeleteAccountScreen
              onBack={() => setCurrentScreen('settings')}
              onDeleteAccount={onLogout}
              isDarkMode={isDarkMode}
              themeColor={themeColor}
            />
          </motion.div>
        )}

        {currentScreen === 'blocked-users' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <BlockedUsersScreen
              onBack={() => setCurrentScreen('settings')}
            />
          </motion.div>
        )}

        {currentScreen === 'security-data' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <SecurityDataScreen
              onBack={() => setCurrentScreen('settings')}
              isDarkMode={isDarkMode}
              themeColor={themeColor}
              themeMode={themeMode}
            />
          </motion.div>
        )}

        {currentScreen === 'create-room-signal' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <CreateRoomSignalScreen
              onBack={() => setCurrentScreen('home')}
              isDarkMode={isDarkMode}
              themeColor={themeColor}
              themeMode={themeMode}
              roomsCreatedToday={getRoomsCreatedToday()}
              hasSignal={hasSignal}
              onCreateRoom={handleCreateRoom}
              onCreateSignal={handleCreateSignal}
            />
          </motion.div>
        )}

        {currentScreen === 'community-guidelines' && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0A0A14]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <AmigoGuidelinesScreen
              onBack={() => setCurrentScreen('settings')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};