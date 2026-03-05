import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, MoreVertical, Paperclip, Send, Moon, Ghost, Smile, Mic, Eye, CheckCircle2, Loader2, AlertCircle, FileText, Download, Clock, Trash2, Play, Pause, X, Image as ImageIcon, Ban, Shield, UserMinus, AlertTriangle, Flag, Copy, Reply, Radio, Bell, Search, Megaphone, Share2, Info, LogOut, Camera, Music, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '../components/ui/avatar';
import { useSessionStore } from '../stores/useSessionStore';
import { AmigoSignalProfileScreen } from './AmigoSignalProfileScreen';
import { SignalQrScreen } from './SignalQrScreen';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
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

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: Date;
  status: 'sending' | 'delivered' | 'seen' | 'failed';
  type: 'text' | 'image' | 'file' | 'audio';
  mediaUrl?: string;
  fileName?: string;
  duration?: number;
  views?: number;
  reactions?: { emoji: string, count: number }[];
  userReaction?: string;
  replyToId?: string;
}

interface AmigoChannelChatScreenProps {
  chatId: string;
  onBack: () => void;
}

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const MOCK_CHANNEL_MESSAGES: Message[] = [
  {
    id: '1',
    text: '🚀 New Feature Alert! We just launched Dark Mode for everyone.',
    senderId: 'channel',
    senderName: 'Tech News Daily',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'seen',
    type: 'text',
    views: 1250,
    reactions: [{ emoji: '👍', count: 45 }, { emoji: '👎', count: 2 }]
  },
  {
    id: 'img1',
    text: 'Check out the new design system.',
    senderId: 'channel',
    senderName: 'Tech News Daily',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
    status: 'seen',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    views: 1100,
    reactions: [{ emoji: '👍', count: 80 }, { emoji: '😕', count: 12 }]
  },
  {
    id: '2',
    text: 'Maintenance scheduled for tonight at 2 AM UTC. Expect minor downtime.',
    senderId: 'channel',
    senderName: 'Tech News Daily',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'seen',
    type: 'text',
    views: 850,
    reactions: [{ emoji: '👎', count: 20 }, { emoji: '😕', count: 45 }]
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
  { top: '55%', left: '50%', size: 40, rotate: 0, delay: 3, opacity: 0.03 },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AmigoChannelChatScreen = ({ chatId, onBack }: AmigoChannelChatScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  const [messages, setMessages] = useState<Message[]>(MOCK_CHANNEL_MESSAGES.map(m => ({
    ...m,
    userReaction: m.id === '1' ? '👍' : undefined // Simulate one vote for demo
  })));
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Rich Input State
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  
  const [mediaPreview, setMediaPreview] = useState<{ file: File; type: 'image' | 'video' | 'file'; previewUrl: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Dialog States
  const [leaveChannelDialogOpen, setLeaveChannelDialogOpen] = useState(false);
  const [showSignalQr, setShowSignalQr] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------------------------------------------------------------------
  // Theme Logic
  // ---------------------------------------------------------------------------
  
  const isDarkMode = themeMode !== 'day';
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
    
    bubbleChannel: isDarkMode 
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

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
  };

  const cancelRecording = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
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

  const sendMedia = () => {
    if (!mediaPreview) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      senderId: 'me',
      timestamp: new Date(),
      status: 'sending',
      type: mediaPreview.type as any,
      mediaUrl: mediaPreview.previewUrl,
      fileName: mediaPreview.file.name,
      replyToId: replyingTo?.id,
      views: 0
    };

    setMessages(prev => [...prev, newMessage]);
    setMediaPreview(null);
    setInputText('');
    setReplyingTo(null);

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
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
      replyToId: replyingTo?.id,
      views: 0
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyingTo(null);
    
    if (inputRef.current) inputRef.current.style.height = '24px';
    
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m));
    }, 1000);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        // Find existing reaction count for this emoji
        const existingCount = m.reactions?.find(r => r.emoji === emoji)?.count || 0;
        
        // If user already reacted with THIS emoji, toggle it off
        if (m.userReaction === emoji) {
           return {
             ...m,
             userReaction: undefined,
             reactions: m.reactions?.map(r => 
               r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1) } : r
             ) || []
           };
        }
        
        // If user is changing vote or voting for first time
        let newReactions = m.reactions ? [...m.reactions] : [];
        
        // 1. Remove old vote if exists
        if (m.userReaction) {
           const oldIdx = newReactions.findIndex(r => r.emoji === m.userReaction);
           if (oldIdx !== -1) {
              newReactions[oldIdx] = { ...newReactions[oldIdx], count: Math.max(0, newReactions[oldIdx].count - 1) };
           }
        }
        
        // 2. Add new vote
        const newIdx = newReactions.findIndex(r => r.emoji === emoji);
        if (newIdx !== -1) {
           newReactions[newIdx] = { ...newReactions[newIdx], count: newReactions[newIdx].count + 1 };
        } else {
           newReactions.push({ emoji, count: 1 });
        }
        
        return {
          ...m,
          userReaction: emoji,
          reactions: newReactions
        };
      }
      return m;
    }));
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:opacity-80 break-words"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (showProfile) {
    return (
      <AmigoSignalProfileScreen 
        onBack={() => setShowProfile(false)}
        chatId={chatId}
        name="Tech News Daily"
        avatar={undefined} // Or a specific URL if you have one
        description="Your daily dose of the latest technology news, breakthroughs, and insights. 🚀"
        subscribersCount="12.5K"
      />
    );
  }

  if (showSignalQr) {
    return (
      <SignalQrScreen 
        signalName="Tech News Daily"
        signalId={chatId}
        subscriberCount={12500}
        onBack={() => setShowSignalQr(false)}
        isDarkMode={isDarkMode}
        themeColor={themeColor}
        themeMode={themeMode}
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

      {/* Header */}
      <div className="flex-none px-5 pt-4 pb-2 z-20 shadow-sm z-10">
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
                   <Info className="w-4 h-4 mr-2" /> Signal Info
                </DropdownMenuItem>
                
                <DropdownMenuItem className="cursor-pointer" onClick={() => setShowSignalQr(true)}>
                   <Radio className="w-4 h-4 mr-2" /> Send Signal
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDarkMode ? "bg-white/10" : "bg-gray-200"} />
                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={() => setLeaveChannelDialogOpen(true)}>
                   <LogOut className="w-4 h-4 mr-2" /> Leave Channel
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
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              12.5K Subscribers
            </motion.p>
            <motion.h1 
              className={`text-[30px] font-bold leading-tight bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent pb-1`}
              initial={{ opacity: 0, x: -30, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Tech News Daily
            </motion.h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mt-2"
            onClick={() => setShowProfile(true)}
          >
             <div className="relative">
                <Avatar name="Tech News" size="md" className="w-[54px] h-[54px]" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-[#10B981]",
                  isDarkMode ? "border-[#050509]" : "border-white"
                )}>
                    <Megaphone size={12} className="text-white" />
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar relative z-10">
        <div className="space-y-4 pb-4">
            
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const showDateHeader = index === 0 || messages[index - 1].timestamp.toDateString() !== msg.timestamp.toDateString();

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col items-center"
                >
                  {showDateHeader && (
                     <div className="flex justify-center my-6 opacity-60">
                       <span className={cn("text-xs font-medium px-3 py-1 rounded-full", isDarkMode ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500")}>
                         {formatMessageDate(msg.timestamp)}
                       </span>
                     </div>
                  )}

                  {/* Channel Post Card */}
                  <div className={cn(
                      "w-full max-w-md rounded-2xl overflow-hidden shadow-sm border relative",
                      isDarkMode ? "bg-[#1A1A2E] border-white/5" : "bg-white border-gray-100"
                  )}>
                      {/* Media: Image */}
                      {msg.type === 'image' && msg.mediaUrl && (
                          <div className="w-full aspect-video">
                              <img src={msg.mediaUrl} className="w-full h-full object-cover" />
                          </div>
                      )}

                      {/* Media: Audio */}
                      {msg.type === 'audio' && (
                        <div className="px-4 pt-4">
                           <div className={cn("flex flex-col gap-1 p-3 pl-4 pr-3 min-w-[230px] rounded-xl border shadow-sm", isDarkMode ? "bg-black/20 border-white/5 text-white" : "bg-gray-100 border-gray-200 text-gray-900")}>
                                <div className="flex items-center gap-3">
                                    <button 
                                        className={cn(
                                            "p-2.5 rounded-full transition-colors shrink-0 flex items-center justify-center",
                                            isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-900"
                                        )}
                                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                    >
                                        {playingAudioId === msg.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                                    </button>
                                    <div className="flex-1 flex items-center gap-0.5 h-8 mx-1">
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
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-medium opacity-80 ml-[50px]">{formatDuration(msg.duration || 0)}</span>
                                </div>
                            </div>
                        </div>
                      )}

                      {/* Media: File */}
                      {msg.type === 'file' && (
                        <div className="px-4 pt-4">
                           <div className={cn("flex items-center gap-3 p-3 rounded-xl", isDarkMode ? "bg-white/5" : "bg-gray-100")}>
                                <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/10" : "bg-white shadow-sm")}>
                                    <FileText size={20} className={isDarkMode ? "text-white" : "text-gray-500"} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white" : "text-gray-900")}>{msg.fileName || 'Attachment'}</p>
                                </div>
                                <button className={cn("p-2 rounded-full", isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-200 text-gray-600")}><Download size={16} /></button>
                           </div>
                        </div>
                      )}

                      <div className="p-4">
                          {/* Text */}
                          {msg.text && (
                             <p className={cn(
                                "text-[16px] leading-relaxed whitespace-pre-wrap mb-3",
                                isDarkMode ? "text-white" : "text-gray-900"
                             )}>
                                {renderTextWithLinks(msg.text)}
                             </p>
                          )}

                          {/* Footer: Views & Time */}
                          <div className={cn("flex items-center justify-between text-xs opacity-60", isDarkMode ? "text-white" : "text-gray-600")}>
                              <div className="flex items-center gap-1">
                                  <Eye size={14} />
                                  <span>{msg.views ? (msg.views > 1000 ? (msg.views/1000).toFixed(1) + 'K' : msg.views) : 0}</span>
                              </div>
                              <span>
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                          </div>
                      </div>

                      {/* Reactions Bar - Interactive Poll Design */}
                      <div className={cn(
                          "px-3 pb-3 pt-2",
                          isDarkMode ? "border-t border-white/5" : "border-t border-gray-100"
                      )}>
                          {/* Helper Text */}
                          <div className="flex justify-between items-center mb-2 px-1">
                              <span className={cn("text-[10px] font-medium uppercase tracking-wider opacity-50", isDarkMode ? "text-white" : "text-gray-500")}>
                                  {msg.userReaction ? 'Poll Results' : 'Rate this update'}
                              </span>
                              {msg.userReaction && (
                                  <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className={cn("text-[10px] font-medium opacity-50", isDarkMode ? "text-white" : "text-gray-500")}
                                  >
                                      {msg.reactions?.reduce((a, b) => a + b.count, 0) || 0} votes
                                  </motion.span>
                              )}
                          </div>

                          <div className="flex items-center gap-2 h-10">
                              {['👍', '👎', '😕'].map((emoji) => {
                                  const reaction = msg.reactions?.find(r => r.emoji === emoji);
                                  const count = reaction?.count || 0;
                                  const totalVotes = msg.reactions?.reduce((a, b) => a + b.count, 0) || 0;
                                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                  const isSelected = msg.userReaction === emoji;
                                  const hasVoted = !!msg.userReaction;
                                  
                                  const colorClass = emoji === '👍' ? "text-emerald-500" : emoji === '👎' ? "text-rose-500" : "text-amber-500";
                                  const bgClass = emoji === '👍' ? "bg-emerald-500" : emoji === '👎' ? "bg-rose-500" : "bg-amber-500";
                                  
                                  return (
                                      <button 
                                          key={emoji}
                                          onClick={() => handleReaction(msg.id, emoji)}
                                          className={cn(
                                              "relative flex-1 h-full rounded-xl flex items-center justify-center transition-all overflow-hidden border",
                                              isSelected ? "border-transparent bg-white/5" : (isDarkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50")
                                          )}
                                      >
                                          {/* Progress Bar Background */}
                                          <AnimatePresence>
                                              {hasVoted && (
                                                  <motion.div 
                                                      initial={{ width: 0, opacity: 0 }}
                                                      animate={{ 
                                                          width: `${percentage}%`,
                                                          opacity: isSelected ? 0.25 : 0.1
                                                      }}
                                                      className={cn("absolute inset-y-0 left-0 h-full", bgClass)}
                                                      transition={{ duration: 0.8, ease: "circOut" }}
                                                  />
                                              )}
                                          </AnimatePresence>
                                          
                                          {/* Content Container */}
                                          <div className="absolute inset-0 flex items-center justify-center px-2 z-10">
                                              <div className={cn(
                                                  "flex items-center gap-2 transition-transform duration-300",
                                                  hasVoted && !isSelected && "opacity-50 scale-90",
                                                  isSelected && "scale-105 font-semibold"
                                              )}>
                                                  <motion.span 
                                                    className="text-lg leading-none"
                                                    whileTap={{ scale: 1.4, rotate: emoji === '👎' ? -15 : 15 }}
                                                  >
                                                      {emoji}
                                                  </motion.span>
                                                  
                                                  {hasVoted && (
                                                      <motion.div 
                                                          initial={{ opacity: 0, width: 0 }}
                                                          animate={{ opacity: 1, width: 'auto' }}
                                                          className="flex flex-col items-start leading-none overflow-hidden"
                                                      >
                                                          <span className={cn("text-xs", isSelected ? colorClass : (isDarkMode ? "text-white/70" : "text-gray-600"))}>
                                                              {percentage}%
                                                          </span>
                                                      </motion.div>
                                                  )}
                                              </div>
                                          </div>
                                          
                                          {/* Active Border */}
                                          {isSelected && (
                                              <motion.div 
                                                  layoutId={`active-glow-${msg.id}`}
                                                  className={cn(
                                                      "absolute inset-0 border-2 rounded-xl pointer-events-none opacity-50",
                                                      emoji === '👍' ? "border-emerald-500" : emoji === '👎' ? "border-rose-500" : "border-amber-500"
                                                  )}
                                                  initial={{ opacity: 0 }}
                                                  animate={{ opacity: 0.5 }}
                                              />
                                          )}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
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
                                Replying to {replyingTo.senderName || 'Channel'}
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
                                onClick={() => {
                                    // Handle camera action if needed
                                    setShowAttachMenu(false);
                                }}
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

      {/* Leave Channel Dialog */}
      <AlertDialog open={leaveChannelDialogOpen} onOpenChange={setLeaveChannelDialogOpen}>
        <AlertDialogContent className={isDarkMode ? "bg-[#0A0A14] border-white/10 text-white max-w-md" : "bg-white text-gray-900 max-w-md"}>
          <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: "spring", duration: 0.5 }}
             className="flex flex-col items-center"
          >
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-4 relative"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-red-500 rounded-full blur-xl"
              />
              <div className="relative bg-red-500/20 p-4 rounded-full border-2 border-red-500/30">
                <LogOut size={32} className="text-red-500" strokeWidth={2} />
              </div>
            </motion.div>
            
            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl">Leave Channel?</AlertDialogTitle>
              <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                You will no longer receive updates from this channel.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onBack} className="bg-red-500 hover:bg-red-600 text-white border-0">
                Leave Channel
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};