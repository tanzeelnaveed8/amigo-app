import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, MessageCircle, Calendar, Ghost, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

interface AmigoSignalSearchScreenProps {
  onBack: () => void;
  chatId?: string;
}

// Mock data for search results
const MOCK_MESSAGES = [
  {
    id: '1',
    text: 'Has anyone seen the latest TechCrunch article about AI?',
    sender: 'Sarah Miller',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    date: 'Today',
    time: '10:30 AM'
  },
  {
    id: '2',
    text: 'The new Tailwind v4 features are absolutely mind-blowing! 🚀',
    sender: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    date: 'Yesterday',
    time: '2:15 PM'
  },
  {
    id: '3',
    text: 'We should schedule a meeting to discuss the roadmap for Q3.',
    sender: 'Jordan Taylor',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    date: 'Yesterday',
    time: '9:00 AM'
  },
  {
    id: '4',
    text: 'Can someone share the link to the design system documentation?',
    sender: 'Casey Smith',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    date: 'Mon',
    time: '4:45 PM'
  },
  {
    id: '5',
    text: 'Just pushed the latest updates to the staging environment.',
    sender: 'Riley Wilson',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80',
    date: 'Sun',
    time: '11:20 AM'
  },
  {
    id: '6',
    text: 'Ghost mode is looking great on the new interface! 👻',
    sender: 'Morgan Lee',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    date: 'Sat',
    time: '8:30 PM'
  }
];

export const AmigoSignalSearchScreen = ({ onBack, chatId = 'signal-1' }: AmigoSignalSearchScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_MESSAGES>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['AI updates', 'Design system', 'Roadmap']);

  const isDarkMode = themeMode !== 'day';
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    headerBg: isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#F5F5F7]/90',
    inputBg: isDarkMode ? 'bg-[#141422] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900',
    card: isDarkMode ? 'bg-[#141422] border-white/5 hover:bg-[#1A1A2E]' : 'bg-white border-gray-100 hover:bg-gray-50',
    highlight: isDarkMode ? 'bg-[#9B7BFF]/20 text-[#9B7BFF]' : 'bg-blue-100 text-blue-700',
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    // Simulate API delay
    const timeout = setTimeout(() => {
      const filtered = MOCK_MESSAGES.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className={cn("px-1 rounded-md font-medium", themeClasses.highlight)}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      {/* Header */}
      <div className={cn("flex-none px-4 pt-4 pb-2 z-10 sticky top-0 backdrop-blur-md border-b", isDarkMode ? "border-white/5" : "border-gray-200/50", themeClasses.headerBg)}>
        <div className="flex items-center gap-3 mb-2">
          <motion.button 
            onClick={onBack}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200 flex-shrink-0",
              isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} className={themeClasses.subtext} />
          </motion.button>
          
          <div className="flex-1 relative">
            <Search size={18} className={cn("absolute left-3 top-1/2 -translate-y-1/2", themeClasses.subtext)} />
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in signal..."
                autoFocus
                className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-2xl border text-[15px] outline-none focus:ring-2 focus:ring-[#9B7BFF]/50 transition-all placeholder:opacity-50", 
                    themeClasses.inputBg
                )}
            />
            {searchQuery && (
                <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-500/20 hover:bg-gray-500/30 transition-colors"
                >
                    <X size={14} className={themeClasses.text} />
                </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {!searchQuery ? (
          /* Recent Searches & Default State */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="px-2">
                <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-4 opacity-60", themeClasses.subtext)}>Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                        <button 
                            key={i}
                            onClick={() => setSearchQuery(term)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            )}
                        >
                            <Clock size={14} className="opacity-50" />
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-16 opacity-30">
                <Search size={64} className={cn("mb-4", isDarkMode ? "text-white" : "text-black")} strokeWidth={1} />
                <p className={cn("text-sm font-medium", themeClasses.text)}>Search for messages, links, and media</p>
            </div>
          </motion.div>
        ) : results.length > 0 ? (
          /* Search Results */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
             <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-2 opacity-60 px-2", themeClasses.subtext)}>
                {results.length} Result{results.length !== 1 ? 's' : ''}
             </h3>
             
             {results.map((msg, i) => (
                 <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer group",
                        themeClasses.card
                    )}
                 >
                    <div className="flex gap-3">
                        <Avatar className="w-10 h-10 border border-white/10">
                            <AvatarImage src={msg.avatar} />
                            <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn("font-semibold text-sm", themeClasses.text)}>{msg.sender}</span>
                                <span className={cn("text-[11px]", themeClasses.subtext)}>{msg.date}, {msg.time}</span>
                            </div>
                            <p className={cn("text-[14px] leading-relaxed line-clamp-2", themeClasses.subtext, isDarkMode ? "group-hover:text-gray-300" : "group-hover:text-gray-700")}>
                                {highlightText(msg.text, searchQuery)}
                            </p>
                        </div>
                    </div>
                 </motion.div>
             ))}
          </motion.div>
        ) : (
          /* No Results State (Ghost Mode) */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center pt-20"
          >
             <motion.div
                animate={{ 
                    y: [0, -10, 0],
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                }}
                className="relative mb-6"
             >
                 {/* Glow behind ghost */}
                 <div className={cn("absolute inset-0 blur-2xl opacity-20 rounded-full scale-150", isDarkMode ? "bg-[#9B7BFF]" : "bg-blue-500")} />
                 <Ghost size={80} className={cn("relative z-10 opacity-80", themeClasses.subtext)} strokeWidth={1} />
             </motion.div>
             
             <h3 className={cn("text-lg font-bold mb-2", themeClasses.text)}>No results found</h3>
             <p className={cn("text-sm text-center max-w-[250px] opacity-60", themeClasses.subtext)}>
                We couldn't find anything matching "{searchQuery}". Try different keywords.
             </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
