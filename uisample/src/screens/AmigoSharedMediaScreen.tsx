import React, { useState } from 'react';
import { ArrowLeft, Image as ImageIcon, FileText, Mic, Link as LinkIcon, Download, Play, MoreVertical, Search, Grid, List, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';

interface AmigoSharedMediaScreenProps {
  onBack: () => void;
}

type TabType = 'media' | 'files' | 'voice' | 'links';

// Mock Data
const MEDIA_ITEMS = [
  { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80', date: 'Today' },
  { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', date: 'Yesterday' },
  { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', date: 'Yesterday' },
  { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1461988320302-91b5b4c61e47?auto=format&fit=crop&w=600&q=80', date: 'Last Week' },
  { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', date: 'Last Week' },
  { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1550005809-91a759055272?auto=format&fit=crop&w=600&q=80', date: 'Last Month' },
];

const FILE_ITEMS = [
  { id: '1', name: 'Project_Proposal_v2.pdf', size: '2.4 MB', date: 'Yesterday', type: 'pdf' },
  { id: '2', name: 'Design_System_Assets.zip', size: '45.1 MB', date: 'Last Week', type: 'zip' },
  { id: '3', name: 'Meeting_Notes_Q3.docx', size: '145 KB', date: 'Last Week', type: 'doc' },
  { id: '4', name: 'Financial_Report_2023.xlsx', size: '1.2 MB', date: 'Last Month', type: 'xls' },
];

const VOICE_ITEMS = [
  { id: '1', duration: '0:24', date: 'Today, 2:30 PM' },
  { id: '2', duration: '1:15', date: 'Yesterday, 10:45 AM' },
  { id: '3', duration: '0:05', date: 'Last Week' },
];

const LINK_ITEMS = [
  { id: '1', title: 'Figma - Interface Design Tool', url: 'https://www.figma.com', domain: 'figma.com', date: 'Today' },
  { id: '2', title: 'Tailwind CSS - Rapidly build modern websites', url: 'https://tailwindcss.com', domain: 'tailwindcss.com', date: 'Yesterday' },
  { id: '3', title: 'Motion | Framer for Developers', url: 'https://motion.dev', domain: 'motion.dev', date: 'Last Week' },
];

const GHOST_POSITIONS = [
    { top: '10%', left: '10%', rotate: -10, size: 24, delay: 0 },
    { top: '30%', right: '15%', rotate: 15, size: 32, delay: 1 },
    { top: '60%', left: '20%', rotate: -5, size: 28, delay: 2 },
    { top: '80%', right: '10%', rotate: 10, size: 20, delay: 0.5 },
];

export const AmigoSharedMediaScreen = ({ onBack }: AmigoSharedMediaScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabType>('media');
  const isDarkMode = themeMode !== 'day';
  
  // Theme colors
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    headerBg: isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#F5F5F7]/90',
    cardBg: isDarkMode ? 'bg-[#141422]' : 'bg-white',
    border: isDarkMode ? 'border-white/5' : 'border-gray-200',
    tabActive: isDarkMode ? 'text-white' : 'text-gray-900',
    tabInactive: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
  };

  const tabs = [
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'links', label: 'Links', icon: LinkIcon },
  ];

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden relative transition-colors duration-300 z-50", themeClasses.bg)}>
      
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
                  opacity: 0.03, // Very subtle
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

      {/* Header */}
      <div className={cn("flex-none px-5 pt-4 pb-0 z-10 sticky top-0 backdrop-blur-md border-b", themeClasses.border, themeClasses.headerBg)}>
        <div className="flex items-center justify-between mb-4">
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
          <span className={cn("font-bold text-lg", themeClasses.text)}>Shared Content</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between relative">
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             const Icon = tab.icon;
             return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                        "flex-1 flex flex-col items-center gap-2 pb-3 pt-2 relative transition-colors outline-none",
                        isActive ? themeClasses.tabActive : themeClasses.tabInactive
                    )}
                >
                    <Icon size={20} className={cn("transition-colors", isActive ? "" : "opacity-70")} style={{ color: isActive ? themeColor : undefined }} />
                    <span className={cn("text-[11px] font-medium tracking-wide uppercase", isActive ? "opacity-100 font-bold" : "opacity-70")}>{tab.label}</span>
                    {isActive && (
                        <motion.div 
                            layoutId="activeTabIndicatorMedia"
                            className="absolute bottom-0 w-full h-[3px] rounded-t-full"
                            style={{ backgroundColor: themeColor, boxShadow: `0 -2px 10px ${themeColor}80` }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                </button>
             );
          })}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto custom-scrollbar relative z-10", themeClasses.bg)}>
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 pb-24"
            >
                {/* MEDIA TAB */}
                {activeTab === 'media' && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {MEDIA_ITEMS.map((item, i) => (
                            <motion.div 
                                key={item.id}
                                className={cn("aspect-square relative overflow-hidden cursor-pointer rounded-xl", isDarkMode ? "bg-gray-800" : "bg-gray-200")}
                                whileHover={{ scale: 0.98 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <img src={item.url} alt="Shared" className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* FILES TAB */}
                {activeTab === 'files' && (
                    <div className="space-y-3">
                        {FILE_ITEMS.map((file, i) => (
                            <motion.div 
                                key={file.id}
                                className={cn("flex items-center p-3 rounded-2xl border transition-colors shadow-sm", themeClasses.cardBg, themeClasses.border)}
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mr-3", isDarkMode ? "bg-white/5" : "bg-gray-100")}>
                                    <FileText size={24} style={{ color: themeColor }} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className={cn("text-sm font-semibold truncate", themeClasses.text)}>{file.name}</h3>
                                    <p className={cn("text-xs mt-0.5 font-medium opacity-70", themeClasses.subtext)}>{file.size} • {file.date}</p>
                                </div>
                                <button className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100")}>
                                    <Download size={18} className={themeClasses.subtext} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* VOICE TAB */}
                {activeTab === 'voice' && (
                    <div className="space-y-3">
                        {VOICE_ITEMS.map((voice, i) => (
                            <motion.div 
                                key={voice.id}
                                className={cn("flex items-center p-3 rounded-2xl border transition-colors shadow-sm", themeClasses.cardBg, themeClasses.border)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div 
                                    className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors", isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200")}
                                    style={{ color: themeColor }}
                                >
                                    <Play size={18} className="ml-0.5" />
                                </div>
                                <div className="flex-1">
                                    <div className="h-8 flex items-end gap-0.5 opacity-50 mb-1">
                                         {/* Mock Waveform */}
                                         {Array.from({ length: 40 }).map((_, j) => (
                                             <div 
                                                key={j} 
                                                className={cn("w-1 rounded-full", isDarkMode ? "bg-white" : "bg-gray-800")}
                                                style={{ 
                                                    height: `${Math.max(20, Math.random() * 100)}%`,
                                                    opacity: Math.random() * 0.5 + 0.5 
                                                }} 
                                             />
                                         ))}
                                    </div>
                                    <p className={cn("text-xs font-medium opacity-70", themeClasses.subtext)}>{voice.duration} • {voice.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* LINKS TAB */}
                {activeTab === 'links' && (
                    <div className="space-y-3">
                        {LINK_ITEMS.map((link, i) => (
                            <motion.div 
                                key={link.id}
                                className={cn("flex flex-col p-4 rounded-2xl border transition-colors cursor-pointer shadow-sm group", themeClasses.cardBg, themeClasses.border)}
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                     <div className={cn("w-6 h-6 rounded flex items-center justify-center", isDarkMode ? "bg-white/5 group-hover:bg-white/10" : "bg-gray-100 group-hover:bg-gray-200")}>
                                         <LinkIcon size={12} className={themeClasses.subtext} />
                                     </div>
                                     <span className={cn("text-xs font-medium opacity-70", themeClasses.subtext)}>{link.domain}</span>
                                     <span className={cn("text-[10px] ml-auto opacity-40", themeClasses.subtext)}>{link.date}</span>
                                </div>
                                <h3 className={cn("text-sm font-semibold leading-snug mb-1 group-hover:text-[#9B7BFF] transition-colors", themeClasses.text)}>{link.title}</h3>
                                <p className={cn("text-xs truncate text-blue-500 opacity-80 group-hover:opacity-100 group-hover:underline")}>{link.url}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
