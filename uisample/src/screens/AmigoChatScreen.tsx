import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, MoreVertical, Paperclip, Send, Moon, Ghost, Smile, Mic, Eye, CheckCircle2, Loader2, AlertCircle, FileText, Download, Clock, Trash2, Play, Pause, X, Image as ImageIcon, Ban, Shield, UserMinus, AlertTriangle, Flag, Copy, Reply, Camera, Music, Users, Search, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '../components/ui/avatar';
import { useSessionStore } from '../stores/useSessionStore';
import { AmigoUserProfileScreen } from './AmigoUserProfileScreen';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: 'sending' | 'delivered' | 'seen' | 'failed';
  type: 'text' | 'image' | 'file' | 'audio';
  mediaUrl?: string; // For images/files/audio
  fileName?: string; // For files
  duration?: number; // For audio in seconds
  replyToId?: string; // ID of the message being replied to
}

interface AmigoChatScreenProps {
  chatId: string;
  onBack: () => void;
}

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hey! Are you still at the office?',
    senderId: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), // Yesterday
    status: 'seen',
    type: 'text',
  },
  {
    id: '2',
    text: 'Yeah, just wrapping up the last few designs. Why?',
    senderId: 'me',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    status: 'seen',
    type: 'text',
  },
  {
    id: '3',
    text: 'We are heading to that neon noodle bar. 🍜',
    senderId: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // Today
    status: 'seen',
    type: 'text',
  },
  {
    id: '4',
    text: 'Check this vibe:',
    senderId: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    status: 'seen',
    type: 'text',
  },
  {
    id: 'img1',
    text: 'Looks amazing! I\'m in.',
    senderId: 'other',
    timestamp: new Date(Date.now() - 1000 * 60 * 24),
    status: 'seen',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    text: 'Oh nice. Give me 10 mins.',
    senderId: 'me',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'delivered',
    type: 'text',
  },
];

const GHOST_POSITIONS = [
  { top: '8%', left: '5%', size: 24, rotate: -15, delay: 0 },
  { top: '18%', right: '8%', size: 32, rotate: 10, delay: 1 },
  { top: '32%', left: '12%', size: 20, rotate: -5, delay: 2 },
  { top: '45%', right: '15%', size: 28, rotate: 15, delay: 0.5 },
  { top: '60%', left: '8%', size: 22, rotate: -10, delay: 1.5 },
  { top: '75%', right: '5%', size: 30, rotate: 12, delay: 1.2 },
  { top: '12%', left: '45%', size: 18, rotate: 5, delay: 2.5 },
  { top: '88%', left: '35%', size: 26, rotate: -8, delay: 0.8 },
  { top: '55%', left: '50%', size: 40, rotate: 0, delay: 3, opacity: 0.03 }, // Big center one
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AmigoChatScreen = ({ chatId, onBack }: AmigoChatScreenProps) => {
  const { amigoThemeMode: themeMode, setAmigoThemeMode: setThemeMode, blockUser } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // New States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ file: File; type: 'image' | 'video' | 'file'; previewUrl: string } | null>(null);

  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Dialog States
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportUserDialogOpen, setReportUserDialogOpen] = useState(false);
  const [reportMessageDialogOpen, setReportMessageDialogOpen] = useState(false);
  const [messageToReport, setMessageToReport] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------------------------------------------------------------
  // Theme Logic
  // ---------------------------------------------------------------------------
  
  const isDarkMode = themeMode !== 'day';

  // Theme Color Logic
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';

  const themeGradient = themeMode === 'ghost'
    ? 'from-[#9B7BFF] to-[#7C5FD4]' 
    : themeMode === 'day'
    ? 'from-[#2563EB] to-[#1E40AF]'
    : 'from-[#3B82F6] to-[#1D4ED8]'; 

  const themeStyles = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    textMain: isDarkMode ? 'text-white' : 'text-gray-900',
    textSub: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    headerBg: isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#F5F5F7]/90',
    
    // Bubble Logic:
    bubbleOwn: themeMode === 'ghost' 
      ? 'bg-gradient-to-br from-[#9B7BFF] to-[#7C5FD4] shadow-[0_4px_12px_rgba(155,123,255,0.25)] border border-[#9B7BFF]/20 text-white' 
      : themeMode === 'day' 
        ? 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] shadow-[0_4px_12px_rgba(37,99,235,0.2)] text-white' 
        : 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] shadow-[0_4px_12px_rgba(59,130,246,0.25)] border border-[#3B82F6]/20 text-white',
        
    bubbleOther: isDarkMode 
      ? 'bg-[#1A1A2E] text-white border border-white/5 shadow-sm' 
      : 'bg-white text-gray-900 border border-gray-100 shadow-sm',
    inputBg: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200',
    inputText: isDarkMode ? 'text-white placeholder:text-[#5E607E]' : 'text-gray-900 placeholder:text-gray-400',
  };

  // ---------------------------------------------------------------------------
  // Effects & Handlers
  // ---------------------------------------------------------------------------

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches = messages
      .filter(m => m.type === 'text' && m.text.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(m => m.id)
      .reverse(); // Newest first

    setSearchMatches(matches);
    setCurrentMatchIndex(0);
  }, [searchQuery, messages]);

  const scrollToBottom = () => {
    if (!isSearching) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMessage(searchMatches[nextIndex]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIndex);
    scrollToMessage(searchMatches[prevIndex]);
  };

  const closeSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchMatches([]);
  };

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingDuration(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      type: 'audio',
      duration: recordingDuration,
      mediaUrl: 'mock-audio-url'
    };

    setMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1500);
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'seen' } : m));
    }, 3000);
  };

  const cancelRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    setMediaPreview({
      file,
      type: isImage ? 'image' : (isVideo ? 'video' : 'file'),
      previewUrl: URL.createObjectURL(file)
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAttachMenu(false);
  };

  const handleCameraAction = () => {
    setShowAttachMenu(false);
    setMediaPreview({
      file: new File([""], "camera_capture.jpg", { type: "image/jpeg" }),
      type: 'image',
      previewUrl: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80'
    });
  };

  const sendMedia = () => {
    if (!mediaPreview) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText, // Caption
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      type: mediaPreview.type as any,
      mediaUrl: mediaPreview.previewUrl,
      fileName: mediaPreview.file.name,
      replyToId: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMediaPreview(null);
    setInputText('');
    setReplyingTo(null);

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1500);
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'seen' } : m));
    }, 3000);
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    // Don't close picker, allows multiple emojis
    inputRef.current?.focus();
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleClearChat = () => {
    setDeleteDialogOpen(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    setDeleteDialogOpen(false);
  };
  
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleBlockUser = () => {
    setBlockDialogOpen(true);
  };

  const confirmBlockUser = () => {
    // In a real app, we would get the user ID and name from the chat data
    blockUser("other", "Sarah Wilson", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80");
    setBlockDialogOpen(false);
    onBack(); // Go back after blocking
  };

  const handleReportUser = () => {
    setReportUserDialogOpen(true);
  };

  const confirmReportUser = () => {
    setReportUserDialogOpen(false);
    // Logic to report user
  };

  const handleReportMessage = (message: Message) => {
    setMessageToReport(message);
    setReportMessageDialogOpen(true);
  };

  const confirmReportMessage = () => {
    // Logic to report message
    setReportMessageDialogOpen(false);
    setMessageToReport(null);
  };

  const handleCopyMessage = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(err => {
        console.error("Clipboard write failed, trying fallback:", err);
        fallbackCopyTextToClipboard(text);
      });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !mediaPreview) return;
    
    if (mediaPreview) {
      sendMedia();
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      type: 'text',
      replyToId: replyingTo?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyingTo(null);

    if (inputRef.current) inputRef.current.style.height = '24px';

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1500);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'seen' } : m));
    }, 3000);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sounds good!',
          senderId: 'other',
          timestamp: new Date(),
          status: 'seen',
          type: 'text',
        };
        setMessages(prev => [...prev, reply]);
      }, 1500);
    }, 3500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (date.toDateString() === now.toDateString()) return 'Today';
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderTextWithLinks = (text: string, highlight?: boolean) => {
    let parts: (string | JSX.Element)[] = [text];
    
    // 1. Process Links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    parts = parts.flatMap(part => {
        if (typeof part !== 'string') return part;
        const subParts = part.split(urlRegex);
        return subParts.map((sub, i) => {
            if (sub.match(urlRegex)) {
                return (
                    <a 
                        key={`link-${i}`}
                        href={sub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:opacity-80 break-words"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sub}
                    </a>
                );
            }
            return sub;
        });
    });

    // 2. Highlight Search Query
    if (highlight && searchQuery && searchQuery.trim() !== '') {
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        parts = parts.flatMap((part, idx) => {
            if (typeof part !== 'string') return part;
            const subParts = part.split(regex);
            return subParts.map((sub, i) => 
                regex.test(sub) ? (
                    <mark key={`highlight-${idx}-${i}`} className="bg-yellow-300 text-black px-0.5 rounded-sm mx-0.5">
                        {sub}
                    </mark>
                ) : sub
            );
        });
    }
    
    return parts;
  };

  if (showProfile) {
    return (
      <AmigoUserProfileScreen 
        onBack={() => setShowProfile(false)}
      />
    );
  }

  return (
    <div className={cn("flex h-screen w-full flex-col overflow-hidden transition-colors duration-300 relative", themeStyles.bg)}>
      
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
      
      {/* Search Header */}
      {isSearching ? (
        <div className={cn("flex-none px-4 py-3 z-30 flex items-center gap-3 border-b", themeStyles.headerBg, isDarkMode ? "border-white/10" : "border-gray-200")}>
            <motion.button 
                onClick={() => setIsSearching(false)}
                className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100")}
            >
                <ArrowLeft size={20} className={themeStyles.textSub} />
            </motion.button>
            <div className="flex-1 relative">
                <input 
                    ref={searchInputRef}
                    autoFocus
                    type="text" 
                    placeholder="Search in chat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                        "w-full pl-4 pr-10 py-2 rounded-xl text-sm outline-none transition-all",
                        isDarkMode ? "bg-white/5 focus:bg-white/10 text-white placeholder:text-white/30" : "bg-gray-100 focus:bg-gray-200 text-gray-900 placeholder:text-gray-400"
                    )}
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    >
                        <X size={14} className={themeStyles.textSub} />
                    </button>
                )}
            </div>
            {searchQuery && (
                <div className={cn("flex items-center gap-1 text-xs font-medium whitespace-nowrap opacity-60", themeStyles.textMain)}>
                    <span>{searchMatches.length > 0 ? `${currentMatchIndex + 1} of ${searchMatches.length}` : 'No results'}</span>
                    <div className="flex ml-2 gap-1">
                        <button 
                            onClick={handlePrevMatch}
                            disabled={searchMatches.length === 0}
                            className={cn("p-1 rounded hover:bg-black/10 disabled:opacity-30", isDarkMode ? "hover:bg-white/10" : "")}
                        >
                            <ChevronUp size={16} />
                        </button>
                        <button 
                            onClick={handleNextMatch}
                            disabled={searchMatches.length === 0}
                            className={cn("p-1 rounded hover:bg-black/10 disabled:opacity-30", isDarkMode ? "hover:bg-white/10" : "")}
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
      ) : (
        /* Standard Header */
        <div className="flex-none px-5 pt-4 pb-2 z-20">
            <div className="flex items-center justify-between mb-2">
            <motion.button 
                onClick={onBack}
                className={cn(
                "p-2 -ml-2 rounded-xl transition-all duration-200",
                isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
                )}
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft size={24} className={themeStyles.textSub} />
            </motion.button>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.button 
                    className={cn(
                        "p-2 -mr-2 rounded-xl transition-all duration-200",
                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    >
                    <MoreVertical size={24} className={themeStyles.textSub} />
                    </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("z-50 min-w-[160px]", isDarkMode ? "bg-[#1A1A2E] border-white/10 text-white" : "bg-white border-gray-200")}>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setShowProfile(true)}>
                    <Eye className="w-4 h-4 mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsSearching(true)}>
                    <Search className="w-4 h-4 mr-2" /> Search
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleReportUser}>
                    <AlertCircle className="w-4 h-4 mr-2" /> Report
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleClearChat}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Chat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className={isDarkMode ? "bg-white/10" : "bg-gray-200"} />
                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleBlockUser}>
                    <Ban className="w-4 h-4 mr-2" /> Block User
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
            </div>

            <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex-1 cursor-pointer" onClick={() => setShowProfile(true)}>
                <motion.p 
                className={cn("text-[15px] font-medium mb-1", themeStyles.textSub)}
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                Online now
                </motion.p>
                <motion.h1 
                className={`text-[34px] font-bold leading-tight bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent pb-1`}
                initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                Sarah Wilson
                </motion.h1>
            </div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mt-2"
            >
                <div className="relative">
                    <Avatar name="Sarah Wilson" size="md" className="w-[54px] h-[54px]" />
                    <span className={cn(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2",
                    isDarkMode ? "border-[#050509] bg-[#10B981]" : "border-white bg-[#10B981]"
                    )} />
                </div>
            </motion.div>
            </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar relative z-10">
        <div className="space-y-1 pb-4">
            
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.senderId === 'me';
              const prevMsg = messages[index - 1];
              const nextMsg = messages[index + 1];

              const isLastMeMessage = isMe && messages.slice(index + 1).findIndex(m => m.senderId === 'me') === -1;
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
              const showDateHeader = !prevMsg || prevMsg.timestamp.toDateString() !== msg.timestamp.toDateString();

              const roundedTopLeft = isMe ? '20px' : (isFirstInGroup ? '20px' : '4px');
              const roundedBottomLeft = isMe ? '20px' : (isLastInGroup ? '4px' : '4px');
              const roundedTopRight = isMe ? (isFirstInGroup ? '20px' : '4px') : '20px';
              const roundedBottomRight = isMe ? (isLastInGroup ? '4px' : '4px') : '20px';

              const hasMedia = !!msg.mediaUrl || msg.type === 'file' || msg.type === 'audio';
              const hasText = !!msg.text;

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col"
                >
                  {showDateHeader && (
                     <div className="flex justify-center my-6 opacity-60">
                       <span className={cn("text-xs font-medium px-3 py-1 rounded-full", isDarkMode ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500")}>
                         {formatMessageDate(msg.timestamp)}
                       </span>
                     </div>
                  )}

                  <div
                    className={cn(
                      "flex w-full gap-2",
                      isMe ? "justify-end" : "justify-start",
                      isFirstInGroup ? "mt-3" : "mt-0.5"
                    )}
                  >
                    {!isMe && (
                      <div className="flex-shrink-0 w-8 flex flex-col justify-end">
                        {isLastInGroup ? (
                          <Avatar name="Sarah Wilson" size="sm" className="w-8 h-8" />
                        ) : (
                          <div className="w-8" />
                        )}
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[75%] relative group flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}>
                      {/* Message Content Group */}
                      <div className={cn("flex items-end gap-2 group/bubble", isMe ? "flex-row-reverse" : "flex-row")}>
                        <div className="relative flex flex-col">
                            
                            {/* Reply Context Bubble */}
                            {msg.replyToId && (
                                <div className={cn(
                                    "mb-1 px-3 py-2 rounded-xl text-xs border-l-2 backdrop-blur-sm shadow-sm",
                                    themeMode === 'ghost' 
                                        ? "bg-purple-500/10 border-purple-400/50 text-white/90" 
                                        : isDarkMode 
                                            ? "bg-blue-500/20 border-blue-400/50 text-white/90" 
                                            : "bg-blue-500/10 border-blue-500/50 text-gray-800",
                                    "cursor-pointer hover:opacity-100 transition-opacity"
                                )}>
                                    <div className="font-semibold mb-0.5 opacity-75">
                                        {messages.find(m => m.id === msg.replyToId)?.senderId === 'me' ? 'You' : 'Sarah Wilson'}
                                    </div>
                                    <div className="line-clamp-1 opacity-90">
                                        {messages.find(m => m.id === msg.replyToId)?.text || 'Media Attachment'}
                                    </div>
                                </div>
                            )}

                          {/* Message Actions Menu (Triggered by clicking bubble) */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <div 
                                    className={cn(
                                        "flex flex-col relative overflow-hidden transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.98]",
                                        isMe ? themeStyles.bubbleOwn : themeStyles.bubbleOther,
                                        isMe && msg.status === 'sending' ? "opacity-70" : "opacity-100"
                                    )}
                                    style={{
                                        borderRadius: `${roundedTopLeft} ${roundedTopRight} ${roundedBottomRight} ${roundedBottomLeft}`,
                                    }}
                               >
                                    {/* 1. Image Media */}
                                    {msg.type === 'image' && msg.mediaUrl && (
                                        <div className="w-full pointer-events-none">
                                            <img 
                                                src={msg.mediaUrl} 
                                                alt="Shared image" 
                                                className="max-w-full min-w-[200px] w-auto h-auto object-cover max-h-[400px]"
                                            />
                                        </div>
                                    )}

                                    {/* 2. File Media */}
                                    {msg.type === 'file' && (
                                        <div className={cn(
                                            "flex items-center gap-3 p-3 pointer-events-none",
                                            isMe ? "bg-white/10" : "bg-black/5"
                                        )}>
                                            <div className="p-2 bg-white/10 rounded-lg">
                                                <FileText size={20} className={isMe ? "text-white" : "text-gray-500"} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{msg.fileName || 'Attachment.pdf'}</p>
                                                <p className="text-xs opacity-70">2.4 MB</p>
                                            </div>
                                            <button className="p-2 hover:bg-white/10 rounded-full pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* 3. Audio Media */}
                                    {msg.type === 'audio' && (
                                        <div className="flex flex-col gap-1 p-3 pl-4 pr-3 min-w-[230px]">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    className="p-2.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors shrink-0 pointer-events-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPlayingAudioId(playingAudioId === msg.id ? null : msg.id);
                                                    }}
                                                >
                                                    {playingAudioId === msg.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                                </button>
                                                <div className="flex-1 flex items-center gap-0.5 h-8 mx-1 pointer-events-none">
                                                    {[...Array(16)].map((_, i) => (
                                                        <motion.div 
                                                        key={i} 
                                                        className="w-1 bg-current rounded-full opacity-60" 
                                                        animate={{ 
                                                            height: playingAudioId === msg.id ? [6, 20, 10, 16, 6] : 6 
                                                        }}
                                                        transition={{ 
                                                            duration: 0.8, 
                                                            repeat: Infinity, 
                                                            delay: i * 0.05,
                                                            ease: "easeInOut",
                                                            repeatType: "mirror"
                                                        }}
                                                        style={{ height: 6 }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pointer-events-none">
                                                <span className="text-[11px] font-medium opacity-80 ml-[50px]">{formatDuration(msg.duration || 0)}</span>
                                                <div className="w-14" /> {/* Spacer for absolute timestamp */}
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Text Content (Caption or Standalone) */}
                                    {(msg.text || (msg.type === 'text' && !msg.mediaUrl)) && (
                                        <div className={cn(
                                            "px-4 py-2 text-[15px] leading-relaxed break-words pointer-events-none",
                                            hasMedia ? "pt-2" : "py-3 px-5"
                                        )} id={`message-${msg.id}`}>
                                            {renderTextWithLinks(msg.text, true)}
                                        </div>
                                    )}

                                    {/* 5. Timestamp & Status (Integrated at bottom of bubble) */}
                                    <div className={cn(
                                        "px-3 pb-1.5 text-[10px] font-medium text-right select-none flex items-center justify-end gap-1.5 pointer-events-none",
                                        isMe ? "text-white/70" : (isDarkMode ? "text-white/40" : "text-gray-400"),
                                        (hasMedia && !hasText) ? "absolute bottom-1 right-1 bg-black/30 rounded-full px-2 py-0.5 backdrop-blur-sm text-white" : ""
                                    )}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && msg.status === 'sending' && (
                                            <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                            <Ghost size={12} className="text-white/80" />
                                            </motion.div>
                                        )}
                                    </div>
                               </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isMe ? "end" : "start"} className={isDarkMode ? "bg-[#1A1A2E] border-white/10 text-white" : "bg-white border-gray-200"}>
                               <DropdownMenuItem onClick={() => handleCopyMessage(msg.text)}>
                                 <Copy size={14} className="mr-2" /> Copy
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleReply(msg)}>
                                 <Reply size={14} className="mr-2" /> Reply
                               </DropdownMenuItem>
                               {!isMe && (
                                 <DropdownMenuItem 
                                   className="text-orange-500 focus:text-orange-500 focus:bg-orange-500/10"
                                   onClick={() => handleReportMessage(msg)}
                                 >
                                   <Flag size={14} className="mr-2" /> Report Message
                                 </DropdownMenuItem>
                               )}
                               {isMe && (
                                 <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => handleDeleteMessage(msg.id)}>
                                   <Trash2 size={14} className="mr-2" /> Delete
                                 </DropdownMenuItem>
                               )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                      </div>
                      
                      {/* Delivery Status Text (Outside Bubble - optional, mostly for failed/sending details if needed) */}
                      <AnimatePresence mode="wait">
                        {isMe && isLastMeMessage && msg.status !== 'sending' && (
                          <motion.div
                            key={msg.status}
                            initial={{ opacity: 0, y: -5, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -2 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={cn(
                              "text-[10px] font-medium mt-1 mr-1 select-none text-right overflow-hidden",
                              msg.status === 'failed' ? "text-red-500" : (isDarkMode ? "text-white/30" : "text-gray-400")
                            )}
                          >
                             {msg.status === 'delivered' && "Delivered"}
                             {msg.status === 'seen' && "Seen"}
                             {msg.status === 'failed' && "Failed"}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="flex justify-start mt-4 gap-3 items-center ml-1"
             >
                <div className="flex-shrink-0 w-8 flex flex-col justify-end">
                    <Avatar name="Sarah Wilson" size="sm" className="w-8 h-8" />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                  <span className={cn("text-xs font-medium", themeStyles.textSub)}>
                    Sarah is typing...
                  </span>
                </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={cn("flex-none z-20 pb-safe", themeStyles.bg)}>
        {/* Reply Context Bar */}
        <AnimatePresence>
            {replyingTo && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={cn("px-4 pt-2 overflow-hidden", isDarkMode ? "bg-black/20" : "bg-gray-50")}
                >
                    <div className="flex items-center justify-between pl-3 border-l-4 border-blue-500 py-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-blue-500 mb-0.5">
                                Replying to {replyingTo.senderId === 'me' ? 'Yourself' : 'Sarah Wilson'}
                            </p>
                            <p className={cn("text-xs truncate", themeStyles.textSub)}>
                                {replyingTo.text || 'Media Attachment'}
                            </p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-2">
                            <X size={16} className={themeStyles.textSub} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Media Preview Bar */}
        <AnimatePresence>
            {mediaPreview && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-2 border-t border-gray-100 dark:border-white/5"
                >
                    <div className="relative inline-block">
                        {mediaPreview.type === 'image' && (
                            <img src={mediaPreview.previewUrl} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
                        )}
                        {mediaPreview.type === 'video' && (
                             <video src={mediaPreview.previewUrl} className="h-20 w-auto rounded-lg object-cover" />
                        )}
                        {mediaPreview.type === 'file' && (
                            <div className="h-20 w-20 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
                                <FileText size={24} className="text-gray-500" />
                            </div>
                        )}
                        <button 
                            onClick={() => setMediaPreview(null)}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md hover:bg-gray-800"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        <div className="p-2 pb-6 flex items-end gap-2 relative">
             {/* Attach Button */}
             <div className="relative">
                <button 
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={cn(
                    "p-3 rounded-full transition-colors flex-shrink-0",
                    isDarkMode ? "hover:bg-white/10 text-[#8B8CAD]" : "hover:bg-gray-100 text-gray-500",
                    showAttachMenu && (isDarkMode ? "bg-white/10 text-white" : "bg-gray-100 text-gray-900")
                  )}
                >
                  <Paperclip size={22} />
                </button>
                <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*,application/pdf,.doc,.docx"
                />

                {/* Attach Menu */}
                <AnimatePresence>
                    {showAttachMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={cn(
                                "absolute bottom-full left-0 mb-2 p-2 rounded-2xl shadow-xl border min-w-[200px]",
                                isDarkMode ? "bg-[#1A1A2E] border-white/10" : "bg-white border-gray-200"
                            )}
                        >
                            <button 
                                className={cn(
                                    "flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left", 
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                                )} 
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setShowAttachMenu(false);
                                }}
                            >
                                <div className="p-2 rounded-full bg-purple-500/20 text-purple-500 flex-shrink-0">
                                    <ImageIcon size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-medium", themeStyles.textMain)}>Gallery / Photos</span>
                                    <span className={cn("text-[10px]", isDarkMode ? "text-white/60" : "text-gray-500")}>Choose from photos</span>
                                </div>
                            </button>

                            <button 
                                className={cn(
                                    "flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left", 
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                                )} 
                                onClick={handleCameraAction}
                            >
                                <div className="p-2 rounded-full bg-pink-500/20 text-pink-500 flex-shrink-0">
                                    <Camera size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-medium", themeStyles.textMain)}>Camera</span>
                                    <span className={cn("text-[10px]", isDarkMode ? "text-white/60" : "text-gray-500")}>Take a new photo</span>
                                </div>
                            </button>

                            <button 
                                className={cn(
                                    "flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left", 
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                                )} 
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setShowAttachMenu(false);
                                }}
                            >
                                <div className="p-2 rounded-full bg-blue-500/20 text-blue-500 flex-shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-medium", themeStyles.textMain)}>Files / Documents</span>
                                    <span className={cn("text-[10px]", isDarkMode ? "text-white/60" : "text-gray-500")}>Share documents</span>
                                </div>
                            </button>

                            <button 
                                className={cn(
                                    "flex items-center gap-3 w-full p-3 rounded-xl transition-colors text-left", 
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                                )}
                                onClick={() => setShowAttachMenu(false)}
                            >
                                <div className="p-2 rounded-full bg-green-500/20 text-green-500 flex-shrink-0">
                                    <Users size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-sm font-medium", themeStyles.textMain)}>Contact</span>
                                    <span className={cn("text-[10px]", isDarkMode ? "text-white/60" : "text-gray-500")}>Share contact</span>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             {/* Input Bar */}
             <div className={cn(
                "flex-1 rounded-[24px] min-h-[50px] flex items-center px-2 py-1 transition-all border",
                themeStyles.inputBg,
                isRecording ? "bg-red-500/10 border-red-500/30" : ""
             )}>
                
                {isRecording ? (
                    <div className="flex-1 flex items-center px-2 gap-3">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                         <span className={cn("font-mono text-sm font-medium", isDarkMode ? "text-white" : "text-gray-900")}>
                             {formatDuration(recordingDuration)}
                         </span>
                         <div className="flex-1" />
                         <button onClick={cancelRecording} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500">
                            <Trash2 size={20} />
                         </button>
                         <button onClick={isPaused ? resumeRecording : pauseRecording} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500">
                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                         </button>
                    </div>
                ) : (
                    <>
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message..."
                            className={cn(
                                "flex-1 bg-transparent outline-none text-[15px] resize-none max-h-[120px] py-3 px-2 custom-scrollbar",
                                themeStyles.inputText
                            )}
                            style={{ height: '24px', minHeight: '24px' }}
                            rows={1}
                        />
                         <button 
                            className={cn(
                                "p-2 rounded-full transition-colors flex-shrink-0 self-end mb-1",
                                isDarkMode ? "hover:bg-white/10 text-[#8B8CAD]" : "hover:bg-gray-100 text-gray-500"
                            )}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile size={22} />
                        </button>
                    </>
                )}
             </div>

             {/* Send / Mic Button */}
             <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? stopRecording : (inputText.trim() || mediaPreview ? () => handleSend() : startRecording)}
                className={cn(
                    "w-[50px] h-[50px] rounded-full flex items-center justify-center text-white transition-all flex-shrink-0",
                    (inputText.trim() || mediaPreview || isRecording)
                        ? `bg-gradient-to-br ${themeGradient}`
                        : (isDarkMode ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10")
                )}
             >
                {isRecording ? (
                    <Send size={22} className="ml-0.5" />
                ) : (
                    inputText.trim() || mediaPreview ? (
                        <Send size={22} className="ml-0.5" />
                    ) : (
                        <Mic size={22} className={isDarkMode ? "text-white" : "text-gray-900"} />
                    )
                )}
             </motion.button>
        </div>
        
        {/* Emoji Picker Popover */}
        <AnimatePresence>
            {showEmojiPicker && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className={cn(
                        "absolute bottom-24 left-1/2 -translate-x-1/2 z-40 p-4 rounded-2xl shadow-xl w-72 h-64 overflow-y-auto grid grid-cols-6 gap-2 custom-scrollbar",
                        isDarkMode ? "bg-[#1A1A2E] border border-white/10" : "bg-white border border-gray-200"
                    )}
                >
                    {["😀","😃","😄","😁","😆","😅","😂","🤣","🥲","🥹","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫","🫠","🤥","😶","🫥","😐","❓","👋","👍","👎","👏","🫶","❤️","💔"].map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => addEmoji(emoji)}
                            className="text-2xl hover:bg-white/10 p-1 rounded transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Dialogs */}
      {/* Block Dialog - Crowd Chat Animation Style */}
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
                <AlertDialogTitle className="text-xl">Block Sarah Wilson?</AlertDialogTitle>
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

      {/* Delete Chat Dialog - Crowd Chat Animation Style */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
                    <Trash2 size={32} className="text-[#FF6363]" strokeWidth={2} />
                  </div>
              </motion.div>

              <AlertDialogHeader className="text-center space-y-3">
                <AlertDialogTitle className="text-xl">Delete Chat?</AlertDialogTitle>
                <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                  This will permanently delete the chat history for you. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                 <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                    Cancel
                 </AlertDialogCancel>
                 <AlertDialogAction 
                    onClick={confirmClearChat} 
                    className="bg-[#FF6363] hover:bg-[#FF4545] text-white border-0"
                 >
                    Delete Chat
                 </AlertDialogAction>
              </AlertDialogFooter>
           </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report User Dialog - Crowd Chat Animation Style */}
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

      {/* Report Message Dialog - Crowd Chat Animation Style */}
      <AlertDialog open={reportMessageDialogOpen} onOpenChange={setReportMessageDialogOpen}>
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
                <AlertDialogTitle className="text-xl">Report Message?</AlertDialogTitle>
                <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                  This message will be forwarded to our moderation team for review.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                 <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                    Cancel
                 </AlertDialogCancel>
                 <AlertDialogAction 
                    onClick={confirmReportMessage} 
                    className="bg-[#FFA500] hover:bg-[#FF9500] text-white border-0"
                 >
                    Report Message
                 </AlertDialogAction>
              </AlertDialogFooter>
           </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
