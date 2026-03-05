import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Search, UserPlus, MessageCircle, X, ChevronRight, Users, User } from 'lucide-react';
import { Avatar } from '../components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';

interface ContactsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  themeColor: string;
  themeGradient: string;
}

const MOCK_CONTACTS = [
  { id: '1', name: 'Sarah Wilson', username: '@sarah_w', isOnline: true, lastSeen: 'Online' },
  { id: '2', name: 'Mike Chen', username: '@mike_chen', isOnline: true, lastSeen: 'Online' },
  { id: '3', name: 'Emma Davis', username: '@emma_davis', isOnline: false, lastSeen: '2h ago' },
  { id: '4', name: 'James Rodriguez', username: '@james_r', isOnline: false, lastSeen: 'Yesterday' },
  { id: '5', name: 'Sophie Turner', username: '@sophie_turner', isOnline: true, lastSeen: 'Online' },
  { id: '6', name: 'Alex Thompson', username: '@alex_t', isOnline: false, lastSeen: '5h ago' },
  { id: '7', name: 'Rachel Green', username: '@rachel_green', isOnline: true, lastSeen: 'Online' },
  { id: '8', name: 'David Kim', username: '@david_k', isOnline: false, lastSeen: '1h ago' },
  { id: '9', name: 'Natalie Brooks', username: '@nat_brooks', isOnline: false, lastSeen: '3d ago' },
  { id: '10', name: 'Oliver Martinez', username: '@oliver_m', isOnline: true, lastSeen: 'Online' },
];

export const ContactsScreen = ({ onBack, isDarkMode, themeColor, themeGradient }: ContactsScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const onlineContacts = filteredContacts.filter(c => c.isOnline);
  const allSorted = useMemo(() => [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name)), [filteredContacts]);

  const grouped = useMemo(() => {
    const g: { letter: string; contacts: typeof allSorted }[] = [];
    let current = '';
    allSorted.forEach(c => {
      const l = c.name[0].toUpperCase();
      if (l !== current) {
        current = l;
        g.push({ letter: l, contacts: [] });
      }
      g[g.length - 1].contacts.push(c);
    });
    return g;
  }, [allSorted]);

  const letters = grouped.map(g => g.letter);
  const selectedContactData = MOCK_CONTACTS.find(c => c.id === selectedContact);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`section-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`flex h-screen w-full flex-col relative ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#FAFAFA]'} transition-colors duration-300`}>

      {/* Header */}
      <motion.div
        className={`px-5 pt-4 pb-4 ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#FAFAFA]'}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Nav row */}
        <div className="flex items-center justify-between mt-2 mb-5">
          <motion.button
            onClick={onBack}
            className={`w-10 h-10 -ml-1 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
              isDarkMode ? 'hover:bg-white/[0.06] active:bg-white/[0.1]' : 'hover:bg-black/[0.04] active:bg-black/[0.07]'
            }`}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowLeft size={21} className={isDarkMode ? 'text-white' : 'text-gray-800'} />
          </motion.button>
        </div>

        {/* Title block */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={`text-[32px] font-bold leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your{'\n'}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: isDarkMode
                  ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                  : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
              }}
            >
              Contacts
            </span>
          </h1>
          <div className="flex items-center gap-2.5 mt-1">
            <motion.p
              className={`text-[15px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-400'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              All in one place on Amigo
            </motion.p>
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${themeColor}12` }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.25 }}
            >
              <Users size={10} style={{ color: themeColor }} />
              <span className="text-[10px] font-bold" style={{ color: themeColor }}>
                {MOCK_CONTACTS.length}
              </span>
            </motion.div>
          </div>
        </motion.div>

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
              ? `0 0 0 3px ${themeColor}4D, 0 10px 20px ${themeColor}33`
              : '0 0 0 0px transparent'
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            delay: 0.2,
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
                  ? ''
                  : isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
              }`} style={searchFocused ? { color: themeColor } : undefined} />
            </motion.div>
          </motion.div>
          <motion.input
            type="text"
            placeholder="Search contacts..."
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
              opacity: { duration: 0.35, delay: 0.25, ease: "easeOut" },
              x: { type: "spring", stiffness: 320, damping: 26, delay: 0.27 },
              filter: { duration: 0.45, delay: 0.25, ease: "easeOut" },
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>

        {/* Online Section */}
        {onlineContacts.length > 0 && !searchQuery && (
          <motion.div
            className="py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <div className="px-5 mb-3.5 flex items-center gap-2">
              <div className="w-[6px] h-[6px] rounded-full bg-[#10B981]" />
              <span className={`text-[11px] font-bold uppercase tracking-[0.08em] ${isDarkMode ? 'text-[#4A4A6A]' : 'text-gray-400'}`}>
                Online
              </span>
              <span className={`text-[11px] font-bold ${isDarkMode ? 'text-[#3A3A50]' : 'text-gray-300'}`}>
                {onlineContacts.length}
              </span>
            </div>

            <div className="flex gap-3 px-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {onlineContacts.map((contact, i) => (
                <motion.button
                  key={contact.id}
                  className="flex flex-col items-center gap-2 min-w-[62px]"
                  initial={{ opacity: 0, y: 16, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.32 + i * 0.055 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="relative">
                    <div
                      className="rounded-full p-[2.5px]"
                      style={{ background: `linear-gradient(145deg, ${themeColor}, #10B981)` }}
                    >
                      <div className={`rounded-full p-[2px] ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#FAFAFA]'}`}>
                        <Avatar name={contact.name} size="lg" />
                      </div>
                    </div>
                    {/* Online dot */}
                    <div
                      className={`absolute bottom-0 right-0 w-[12px] h-[12px] rounded-full bg-[#10B981] border-[2.5px] ${
                        isDarkMode ? 'border-[#0A0A14]' : 'border-[#FAFAFA]'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold w-[62px] truncate text-center ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                    {contact.name.split(' ')[0]}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Divider */}
            <div className={`mx-5 mt-3 h-px ${isDarkMode ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`} />
          </motion.div>
        )}

        {/* All Contacts List */}
        {grouped.length > 0 ? (
          <div className="pb-20">
            {grouped.map((group, gi) => (
              <div key={group.letter} id={`section-${group.letter}`}>
                {/* Letter Header */}
                <motion.div
                  className={`px-5 py-2 sticky top-0 z-10 backdrop-blur-xl ${
                    isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#FAFAFA]/90'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + gi * 0.03 }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: themeColor }}
                    >
                      {group.letter}
                    </span>
                    <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/[0.04]' : 'bg-black/[0.05]'}`} />
                    <span className={`text-[10px] font-medium ${isDarkMode ? 'text-[#3A3A50]' : 'text-gray-300'}`}>
                      {group.contacts.length}
                    </span>
                  </div>
                </motion.div>

                {/* Contacts */}
                {group.contacts.map((contact, ci) => (
                  <motion.div
                    key={contact.id}
                    className={`group cursor-pointer mx-3 rounded-2xl transition-all duration-200 ${
                      isDarkMode
                        ? 'hover:bg-[#12122A] active:bg-[#161636]'
                        : 'hover:bg-white active:bg-white'
                    }`}
                    style={{
                      transition: 'background-color 0.2s, box-shadow 0.2s',
                    }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.32 + gi * 0.03 + ci * 0.025 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setSelectedContact(contact.id)}
                    onMouseEnter={(e) => {
                      if (!isDarkMode) {
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-center gap-3.5 px-3 py-3">
                      <div className="relative flex-shrink-0">
                        <Avatar name={contact.name} size="lg" />
                        {contact.isOnline && (
                          <div className={`absolute -bottom-[1px] -right-[1px] w-[12px] h-[12px] bg-[#10B981] rounded-full border-[2.5px] ${
                            isDarkMode ? 'border-[#0A0A14]' : 'border-[#FAFAFA]'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[15px] font-semibold block mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {contact.name}
                        </span>
                        <span className={`text-[12px] block ${
                          contact.isOnline
                            ? 'text-[#10B981] font-medium'
                            : isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'
                        }`}>
                          {contact.isOnline ? 'Online' : `Last seen ${contact.lastSeen}`}
                        </span>
                      </div>
                      <motion.div
                        className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                      >
                        <ChevronRight size={16} style={{ color: isDarkMode ? '#3A3A50' : '#D0D0D0' }} />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center py-24 px-6"
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${
                isDarkMode ? 'bg-[#13132A]' : 'bg-white'
              }`}
              style={{
                boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.05)'
              }}
              initial={{ rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Search size={24} style={{ color: isDarkMode ? '#4A4A6A' : '#D0D0D0' }} />
            </motion.div>
            <p className={`text-[15px] font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No results found
            </p>
            <p className={`text-[13px] ${isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'}`}>
              No contacts match "<span className="font-medium">{searchQuery}</span>"
            </p>
          </motion.div>
        )}
      </div>

      {/* Alphabet Rail */}
      {!searchQuery && letters.length > 0 && (
        <motion.div
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center z-20 rounded-full py-1.5 px-0.5 ${
            isDarkMode ? 'bg-white/[0.03]' : 'bg-black/[0.02]'
          }`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          {letters.map(l => (
            <button
              key={l}
              onClick={() => scrollToLetter(l)}
              onMouseEnter={() => setHoveredLetter(l)}
              onMouseLeave={() => setHoveredLetter(null)}
              className="w-[20px] h-[20px] flex items-center justify-center rounded-full transition-all duration-150"
              style={{
                color: hoveredLetter === l ? themeColor : isDarkMode ? '#4A4A6A' : '#B0B0B0',
                backgroundColor: hoveredLetter === l
                  ? `${themeColor}18`
                  : 'transparent',
                fontSize: 9,
                fontWeight: 700,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {l}
            </button>
          ))}
        </motion.div>
      )}

      {/* Action Sheet */}
      <AnimatePresence>
        {selectedContact && selectedContactData && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedContact(null)}
            />
            <motion.div
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] overflow-hidden ${isDarkMode ? 'bg-[#141422]' : 'bg-white'}`}
              style={{
                boxShadow: isDarkMode
                  ? '0 -8px 40px rgba(0,0,0,0.5)'
                  : '0 -8px 40px rgba(0,0,0,0.08)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            >
              {/* Gradient accent bar */}
              

              <div className="px-6 pt-4 pb-8 relative overflow-hidden">
                {/* Decorative background blur */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 opacity-20 pointer-events-none blur-3xl"
                  style={{ background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)` }}
                />

                {/* Grab handle - Sleek & Wide */}
                <div
                  className={`w-12 h-[4px] rounded-full mx-auto mb-8 ${isDarkMode ? 'bg-white/10' : 'bg-gray-300/50'}`}
                />

                {/* Centered profile - Premium styling */}
                <motion.div
                  className="flex flex-col items-center text-center mb-8 relative z-10"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28, delay: 0.04 }}
                >
                  <div className="relative mb-5 group">
                    <div
                      className="rounded-full p-[3px] transition-transform duration-500 ease-out group-hover:scale-105"
                      style={{
                        background: selectedContactData.isOnline
                          ? `linear-gradient(135deg, ${themeColor}, #10B981)`
                          : isDarkMode ? `linear-gradient(135deg, ${themeColor}40, transparent)` : 'linear-gradient(135deg, #E5E7EB, #F3F4F6)',
                        boxShadow: selectedContactData.isOnline ? `0 10px 30px -10px ${themeColor}60` : 'none'
                      }}
                    >
                      <div className={`rounded-full p-[3px] ${isDarkMode ? 'bg-[#141422]' : 'bg-white'}`}>
                        <Avatar name={selectedContactData.name} size="xl" />
                      </div>
                    </div>
                    {selectedContactData.isOnline && (
                      <div className={`absolute bottom-1 right-1 w-[18px] h-[18px] bg-[#10B981] rounded-full border-[3px] ${
                        isDarkMode ? 'border-[#141422]' : 'border-white'
                      } shadow-sm z-10`}>
                         <div className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-[22px] font-bold mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedContactData.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 justify-center">
                    <p className={`text-[15px] font-medium ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                        {selectedContactData.username}
                    </p>
                    
                    {selectedContactData.isOnline ? (
                        <motion.div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
                        style={{ 
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            borderColor: 'rgba(16, 185, 129, 0.2)' 
                        }}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.12 }}
                        >
                        <div className="w-[5px] h-[5px] bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981]" />
                        <span className="text-[11px] font-semibold text-[#10B981] tracking-wide">ONLINE</span>
                        </motion.div>
                    ) : (
                        <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${
                            isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'
                        }`}>
                        Last seen {selectedContactData.lastSeen}
                        </span>
                    )}
                  </div>
                </motion.div>

                {/* Action Group - iOS Style Card */}
                <motion.div
                  className={`rounded-2xl overflow-hidden mb-4 border ${
                    isDarkMode ? 'bg-[#1C1C2E]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 26, delay: 0.08 }}
                >
                  {/* Send Message */}
                  <motion.button
                    onClick={() => { console.log('Message', selectedContactData.name); setSelectedContact(null); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 group relative overflow-hidden transition-colors ${
                       isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ 
                          background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}05)`,
                          color: themeColor
                      }}
                    >
                      <MessageCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left flex flex-col justify-center">
                        <span className={`text-[16px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Send Message
                        </span>
                        <span className={`text-[12px] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Start a conversation</span>
                    </div>
                    <ChevronRight size={18} className={`opacity-40 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>

                  {/* Divider with gradient fade */}
                  <div className="relative h-px w-full">
                      <div className={`absolute inset-0 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                  </div>

                  {/* View Profile */}
                  <motion.button
                    onClick={() => console.log('View Profile', selectedContactData.name)}
                    className={`w-full flex items-center gap-4 px-5 py-4 group relative overflow-hidden transition-colors ${
                       isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                      }`}
                    >
                      <User size={18} strokeWidth={2.5} className={isDarkMode ? 'text-white/70' : 'text-gray-500'} />
                    </div>
                    <div className="flex-1 text-left flex flex-col justify-center">
                        <span className={`text-[16px] font-semibold ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                        View Profile
                        </span>
                        <span className={`text-[12px] ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>See details & media</span>
                    </div>
                    <ChevronRight size={18} className={`opacity-40 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>
                </motion.div>

                {/* Destructive Action */}
                <motion.div
                  className={`rounded-2xl overflow-hidden mb-6 border ${
                    isDarkMode ? 'bg-[#1C1C2E]/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 26, delay: 0.12 }}
                >
                  <motion.button
                    onClick={() => console.log('Block', selectedContactData.name)}
                    className={`w-full flex items-center gap-4 px-5 py-4 group relative overflow-hidden transition-colors ${
                        isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/10 text-red-500 transition-transform group-hover:scale-110">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    </div>
                    <span className="text-[16px] font-semibold flex-1 text-left text-red-500">
                      Block Contact
                    </span>
                  </motion.button>
                </motion.div>

                {/* Cancel Button - Floating Pill */}
                <motion.button
                  onClick={() => setSelectedContact(null)}
                  className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all active:scale-95 ${
                    isDarkMode ? 'bg-[#2D2D3F] text-white hover:bg-[#3A3A4F]' : 'bg-[#E5E5EA] text-black hover:bg-[#D1D1D6]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 26, delay: 0.16 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};