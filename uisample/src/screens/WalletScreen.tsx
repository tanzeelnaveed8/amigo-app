import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Image as ImageIcon, Trash2, X, AlertCircle, Search, ChevronRight, MoreHorizontal, Clock, HardDrive, Shield, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useSessionStore } from '../stores/useSessionStore';

interface WalletItem {
  id: string;
  type: 'image' | 'document';
  name: string;
  size: string;
  date: Date;
  url?: string;
  sizeBytes: number;
}

interface WalletScreenProps {
  onBack: () => void;
}

export const WalletScreen = ({ onBack }: WalletScreenProps) => {
  // Theme State Management from Global Store
  const { amigoThemeMode: themeMode } = useSessionStore();

  // Derived theme values
  const isDarkMode = themeMode !== 'day';
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';

  const [items, setItems] = useState<WalletItem[]>([
    { 
      id: '1', 
      type: 'image', 
      name: 'Driver License Front', 
      size: '2.4 MB', 
      date: new Date('2025-10-12'), 
      sizeBytes: 2400000, 
      url: 'https://images.unsplash.com/photo-1628105569477-3e5f271168f0?q=80&w=200&auto=format&fit=crop' 
    },
    { 
      id: '2', 
      type: 'image', 
      name: 'Passport', 
      size: '3.1 MB', 
      date: new Date('2025-09-28'), 
      sizeBytes: 3100000, 
      url: 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?q=80&w=200&auto=format&fit=crop' 
    },
    { 
      id: '3', 
      type: 'document', 
      name: 'Concert Tickets', 
      size: '1.2 MB', 
      date: new Date('2025-10-20'), 
      sizeBytes: 1200000 
    },
    { 
      id: '4', 
      type: 'document', 
      name: 'Car Insurance Policy', 
      size: '4.5 MB', 
      date: new Date('2025-08-15'), 
      sizeBytes: 4500000 
    },
    { 
      id: '5', 
      type: 'document', 
      name: 'Tax Return 2024', 
      size: '8.2 MB', 
      date: new Date('2025-04-10'), 
      sizeBytes: 8200000 
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'docs'>('all');
  const [selectedItem, setSelectedItem] = useState<WalletItem | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 70;
  const MAX_STORAGE_MB = 300;
  const MAX_ITEMS = 30;

  // Reset rename state when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setRenameValue(selectedItem.name);
      setIsRenaming(false);
    }
  }, [selectedItem]);

  // Focus input when renaming starts
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isRenaming]);

  // Filter logic
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Type filter
    if (activeTab === 'images') result = result.filter(i => i.type === 'image');
    if (activeTab === 'docs') result = result.filter(i => i.type === 'document');

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result;
  }, [items, searchQuery, activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (items.length >= MAX_ITEMS) {
      setError(`Wallet is full (${MAX_ITEMS} items max).`);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(`File too large (${MAX_FILE_SIZE_MB}MB max).`);
      return;
    }

    const currentTotalSizeMB = items.reduce((acc, item) => acc + item.sizeBytes, 0) / (1024 * 1024);
    if (currentTotalSizeMB + fileSizeMB > MAX_STORAGE_MB) {
      setError(`Storage limit exceeded (${MAX_STORAGE_MB}MB max).`);
      return;
    }

    const newItem: WalletItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.startsWith('image/') ? 'image' : 'document',
      name: file.name.split('.')[0], // Remove extension for display
      size: fileSizeMB.toFixed(1) + ' MB',
      date: new Date(),
      sizeBytes: file.size,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };

    setItems([newItem, ...items]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleRename = () => {
    if (!renameValue.trim() || !selectedItem) return;

    const newName = renameValue.trim();
    
    // Update items array
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === selectedItem.id 
          ? { ...item, name: newName } 
          : item
      )
    );

    // Update the selectedItem state to reflect the change
    setSelectedItem(prev => prev ? { ...prev, name: newName } : null);
    setIsRenaming(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleRename();
  };

  const totalSize = items.reduce((acc, item) => acc + item.sizeBytes, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
  const usedPercentage = Math.min((totalSize / (1024 * 1024) / MAX_STORAGE_MB) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex flex-col h-full w-full ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F2F2F7]'}`}
    >
      {/* iOS-style Header */}
      <motion.div 
        className={`px-5 pt-4 pb-2 flex items-center justify-between shrink-0 z-10 ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F2F2F7]'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-1 -ml-2 px-2 py-2 rounded-lg active:opacity-50 transition-opacity"
        >
          <ArrowLeft size={22} style={{ color: themeColor }} />
        </button>
      </motion.div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-5 pb-32">
          {/* Title */}
          <div className="mb-6 mt-2">
            <motion.p 
              className={`text-[34px] font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              My
            </motion.p>
            <motion.h1 
              className="text-[34px] font-bold leading-tight"
              initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
               <span
                 className="bg-clip-text text-transparent"
                 style={{
                   backgroundImage: isDarkMode
                     ? `linear-gradient(to right, ${themeColor}, ${themeColor}CC, ${themeColor}99)`
                     : `linear-gradient(to right, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`
                 }}
               >
                 Wallet
               </span>
            </motion.h1>
            <motion.p 
              className={`mt-3 text-[15px] leading-snug max-w-[90%] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
              initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              Securely store, organize, and access your important documents and IDs.
            </motion.p>
          </div>

          {/* Storage Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className={`p-5 rounded-[22px] mb-6 relative overflow-hidden ${
              isDarkMode ? 'bg-[#141422]' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#1F1F2E]' : 'bg-gray-100'
                  }`}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Shield size={20} style={{ color: themeColor }} />
                </motion.div>
                <div>
                  <motion.h3 
                    className={`text-[16px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    Secure Vault
                  </motion.h3>
                  <motion.p 
                    className={`text-[13px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    Encrypted Storage
                  </motion.p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[20px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {items.length}<span className="text-[14px] font-normal text-gray-400">/{MAX_ITEMS}</span>
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-medium mb-2 opacity-60">
                <span className={isDarkMode ? 'text-white' : 'text-black'}>Storage Used</span>
                <span className={isDarkMode ? 'text-white' : 'text-black'}>{totalSizeMB} MB / {MAX_STORAGE_MB} MB</span>
              </div>
              <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-[#1F1F2E]' : 'bg-gray-100'}`}>
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: themeColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${usedPercentage}%` }}
                  transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <div className="mb-6 space-y-5">
            <motion.div 
              className={`relative rounded-[14px] overflow-hidden transition-all duration-300 ${
                isDarkMode ? 'bg-[#141422] border border-white/5' : 'bg-[#E3E3E8] border border-transparent'
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
                  : '0 0 0 0px transparent'
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
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
                      : isDarkMode ? 'text-[#5E607E]' : 'text-gray-500'
                  }`} />
                </motion.div>
              </motion.div>
              <motion.input
                type="text"
                placeholder="Search files..."
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
                  isDarkMode ? 'text-white placeholder:text-[#5E607E]' : 'text-black placeholder:text-gray-500'
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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex gap-2"
            >
              {(['all', 'images', 'docs'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-[15px] font-medium transition-all ${
                    activeTab === tab
                      ? 'text-white'
                      : isDarkMode 
                        ? 'bg-[#141422] text-[#8B8CAD]' 
                        : 'bg-white text-gray-500 shadow-sm'
                  }`}
                  style={activeTab === tab ? { backgroundColor: themeColor } : {}}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </motion.div>
          </div>

          {/* List Content */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-[13px]">
                  <AlertCircle size={16} />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          <motion.div 
            className={`rounded-[18px] overflow-hidden ${isDarkMode ? 'bg-[#141422]' : 'bg-white'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.6 + (index * 0.06), 
                    ease: [0.25, 0.1, 0.25, 1] 
                  }}
                  onClick={() => setSelectedItem(item)}
                  whileTap={{ x: 6, scale: 0.98 }}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-[#1F1F2E]' : 'hover:bg-gray-50'
                  } ${index !== filteredItems.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
                >
                  {/* Icon/Thumbnail */}
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center overflow-hidden shrink-0 ${
                    isDarkMode ? 'bg-[#1F1F2E]' : 'bg-gray-100'
                  }`}>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + (index * 0.06), type: "spring", stiffness: 400, damping: 20 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {item.type === 'image' && item.url ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={20} className={isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'} />
                      )}
                    </motion.div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-[16px] font-medium truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-[12px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                        {format(item.date, 'MMM d')}
                      </p>
                      <span className={`w-0.5 h-0.5 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                      <p className={`text-[12px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                        {item.size}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
                </motion.div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                   isDarkMode ? 'bg-[#1F1F2E]' : 'bg-gray-50'
                 }`}>
                   <Search size={24} className="text-gray-400" />
                 </div>
                 <p className={`text-[15px] font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                   No items found
                 </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upload Button - Fixed at bottom center like a pill */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <motion.button 
          onClick={() => fileInputRef.current?.click()}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto shadow-xl flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold"
          style={{ backgroundColor: themeColor, boxShadow: `0 8px 24px ${themeColor}50` }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Add New Item</span>
        </motion.button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx"
      />

      {/* Details Sheet/Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`relative w-full max-w-sm rounded-[32px] p-8 overflow-hidden shadow-2xl ${
                isDarkMode 
                  ? 'bg-[#141422] ring-1 ring-white/10' 
                  : 'bg-white ring-1 ring-black/5'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-white/60 hover:text-white hover:bg-white/10' 
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center mt-2 mb-8">
                <motion.div 
                  className={`w-28 h-28 rounded-[24px] mb-6 overflow-hidden flex items-center justify-center shadow-lg ${
                    isDarkMode ? 'bg-[#1F1F2E]' : 'bg-gray-50'
                  }`}
                  layoutId={`item-${selectedItem.id}`}
                >
                   {selectedItem.type === 'image' && selectedItem.url ? (
                      <img src={selectedItem.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText size={48} style={{ color: themeColor }} />
                    )}
                </motion.div>
                
                <div className={`group text-[20px] font-semibold text-center mb-1.5 flex items-center justify-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isRenaming ? (
                    <form 
                      onSubmit={handleRenameSubmit}
                      className="flex items-center gap-2 justify-center"
                    >
                      <input 
                        ref={renameInputRef}
                        type="text" 
                        value={renameValue} 
                        onChange={(e) => setRenameValue(e.target.value)}
                        className={`bg-transparent outline-none text-center border-b ${
                          isDarkMode ? 'border-white/20 text-white' : 'border-black/20 text-black'
                        } w-[180px] pb-1 text-[18px]`}
                        onBlur={() => handleRename()}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setIsRenaming(false);
                        }}
                      />
                      <button 
                        type="submit" 
                        className={`p-1.5 rounded-full ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-green-400' : 'bg-gray-100 hover:bg-gray-200 text-green-600'}`}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                         <Check size={16} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3 className="truncate max-w-[200px] tracking-tight">{selectedItem.name}</h3>
                      <button 
                        onClick={() => setIsRenaming(true)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isDarkMode ? 'text-gray-500 hover:text-white bg-white/5' : 'text-gray-400 hover:text-black bg-black/5'
                        }`}
                      >
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                </div>
                <p className={`text-[13px] font-medium tracking-wide ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                  {selectedItem.type.toUpperCase()} • {selectedItem.size}
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  className={`w-full py-3.5 rounded-[16px] font-medium text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-[#1F1F2E] text-white hover:bg-[#2A2A35]' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  View Full Screen
                </button>
                <button 
                  onClick={() => {
                    handleDelete(selectedItem.id);
                  }}
                  className={`w-full py-3.5 rounded-[16px] font-medium text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    isDarkMode 
                       ? 'text-red-400 hover:bg-[#1F1F2E]' 
                       : 'text-red-500 hover:bg-red-50'
                  }`}
                >
                  Delete Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
