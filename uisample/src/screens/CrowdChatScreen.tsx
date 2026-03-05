import React, { useRef, useEffect, useState } from 'react';
import { TopNavBar } from '../components/ui/top-nav-bar';
import { MessageBubble } from '../components/ui/message-bubble';
import { Avatar } from '../components/ui/avatar';
import { useChatStore } from '../stores/useChatStore';
import { useCrowdStore } from '../stores/useCrowdStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useModerationStore } from '../stores/useModerationStore';
import { initializeBotActivity } from '../lib/ghostBots';
import { Send, MoreVertical, Info, Users, Lock, Unlock, UserMinus, QrCode, Shield, AlertCircle, UserPlus, Trash2, Clock, Paperclip, Image as ImageIcon, Camera, FileText, Check, X, Ghost, AlertTriangle, LogOut, DoorOpen, Pin, Flag, Crown, Copy, Ban, VolumeX } from 'lucide-react@0.487.0';
import { motion, AnimatePresence } from 'motion/react';
import { MediaShareSheet } from '../components/MediaShareSheet';
import { ReportMessageModal } from '../components/moderation/ReportMessageModal';
import { ReportCrowdModal } from '../components/moderation/ReportCrowdModal';
import { BanUserModal } from '../components/moderation/BanUserModal';
import { MuteUserModal } from '../components/moderation/MuteUserModal';
import { MutedIndicator } from '../components/moderation/MutedIndicator';
import { SafetyPanel } from '../components/moderation/SafetyPanel';
import { filterMessage, logFlaggedContent } from '../utils/contentFilter';
import { ContentFilterModal } from '../components/moderation/ContentFilterModal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '../components/ui/sheet';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';

import { Message } from '../stores/useChatStore';

const EMPTY_MESSAGES: Message[] = [];

interface CrowdChatScreenProps {
  crowdId: string;
  onBack: () => void;
  onViewQr?: () => void;
}

export const CrowdChatScreen = ({ crowdId, onBack, onViewQr }: CrowdChatScreenProps) => {
  const crowd = useCrowdStore(state => state.crowds[crowdId]);
  const messagesFromStore = useChatStore(state => state.messagesByCrowdId[crowdId]);
  const messages = messagesFromStore || EMPTY_MESSAGES;
  const sendMessage = useChatStore(state => state.sendMessage);
  const sendMediaMessage = useChatStore(state => state.sendMediaMessage);
  const addSystemMessage = useChatStore(state => state.addSystemMessage);
  const setTyping = useChatStore(state => state.setTyping);
  const getTypingUsersForCrowd = useChatStore(state => state.getTypingUsersForCrowd);
  const toggleAdminOnlyTalk = useCrowdStore(state => state.toggleAdminOnlyTalk);
  const kickMember = useCrowdStore(state => state.kickMember);
  const promoteMember = useCrowdStore(state => state.promoteMember);
  const demoteMember = useCrowdStore(state => state.demoteMember);
  const deleteCrowd = useCrowdStore(state => state.deleteCrowd);
  const leaveCrowd = useCrowdStore(state => state.leaveCrowd);
  const isUserAdmin = useCrowdStore(state => state.isUserAdmin);
  const isCrowdExpired = useCrowdStore(state => state.isCrowdExpired);
  const getAdminCount = useCrowdStore(state => state.getAdminCount);
  const { ghostName, ghostSessionId, blockUser, isUserBlocked } = useSessionStore();
  
  const [inputText, setInputText] = useState('');
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveCrowdDialog, setShowLeaveCrowdDialog] = useState(false);
  const [showNeedAdminWarning, setShowNeedAdminWarning] = useState(false);
  const [memberToPromote, setMemberToPromote] = useState<{ id: string; name: string } | null>(null);
  const [memberToDemote, setMemberToDemote] = useState<{ id: string; name: string } | null>(null);
  const [memberToKick, setMemberToKick] = useState<{ id: string; name: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Media sharing states
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [mediaFlow, setMediaFlow] = useState<'options' | 'gallery' | 'camera' | 'files' | 'preview' | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video' | 'file'; url: string; name: string} | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');

  // New states for additional features
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyFeedbackText, setCopyFeedbackText] = useState('');
  const pinnedMessageRef = useRef<HTMLDivElement>(null);
  
  // Moderation states
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [showReportMessageModal, setShowReportMessageModal] = useState(false);
  const reportMessage = useModerationStore(state => state.reportMessage);
  const reportCrowd = useModerationStore(state => state.reportCrowd);
  const isMessageFlagged = useModerationStore(state => state.isMessageFlagged);

  // Block and Mute states
  const [memberToBlock, setMemberToBlock] = useState<{ id: string; name: string } | null>(null);
  const [memberToMute, setMemberToMute] = useState<{ id: string; name: string } | null>(null);
  const banUser = useModerationStore(state => state.banUser);
  const muteUser = useModerationStore(state => state.muteUser);
  const isUserMuted = useModerationStore(state => state.isUserMuted);

  // Content filter modal states
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'scam' | 'sexual' | 'hate' | 'violence' | 'drugs' | 'personal_info'>('scam');
  const [filterReason, setFilterReason] = useState<string>('');

  const isAdmin = ghostSessionId ? isUserAdmin(crowdId, ghostSessionId) : false;
  const isCreator = ghostSessionId ? useCrowdStore.getState().isUserCreator(crowdId, ghostSessionId) : false;
  const isExpired = isCrowdExpired(crowdId);
  const typingUsers = getTypingUsersForCrowd(crowdId, ghostSessionId || undefined);
  const setPinnedMessage = useCrowdStore(state => state.setPinnedMessage);
  const pinnedMessageId = crowd?.pinnedMessageId;
  const pinnedMessage = pinnedMessageId ? messages.find(m => m.id === pinnedMessageId) : null;

  // Filter out messages from blocked users (client-side local blocking)
  const filteredMessages = messages.filter(msg => {
    // Always show system messages
    if (msg.isSystem) return true;
    // Show own messages
    if (msg.senderGhostSessionId === ghostSessionId) return true;
    // Hide messages from blocked users
    return !isUserBlocked(msg.senderGhostSessionId);
  });

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  // Auto-add dummy members for testing admin features
  useEffect(() => {
    if (!crowd || !isAdmin || !ghostSessionId) return;
    
    // Only auto-add if there's just the admin (1 member)
    if (crowd.memberCount !== 1) return;
    
    const dummyMembers = [
      { name: 'Ghost_201', id: 'dummy-ghost-201' },
      { name: 'Ghost_202', id: 'dummy-ghost-202' },
      { name: 'Ghost_203', id: 'dummy-ghost-203' },
    ];

    // Add members with staggered delays
    dummyMembers.forEach((member, index) => {
      setTimeout(() => {
        const { joinCrowd } = useCrowdStore.getState();
        const result = joinCrowd(crowdId, member.name, member.id);
        
        if (result.success) {
          const displayName = result.adjustedName || member.name;
          addSystemMessage(crowdId, `${displayName} joined the crowd.`, 'join');
        }
      }, 2000 + (index * 1500)); // 2s, 3.5s, 5s
    });
  }, [crowdId, isAdmin, ghostSessionId, crowd?.memberCount]); // Only run when these change

  // Clear typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Typing indicator
    if (!isTyping && e.target.value.trim() && ghostName && ghostSessionId) {
      setIsTyping(true);
      setTyping(crowdId, ghostName, ghostSessionId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (ghostName && ghostSessionId) {
        setIsTyping(false);
        setTyping(crowdId, ghostName, ghostSessionId, false);
      }
    }, 3000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !ghostName || !ghostSessionId) return;

    // Check admin-only talk restriction
    if (crowd.adminOnlyTalk && !isAdmin) {
      alert('Only admins can send messages right now.');
      return;
    }
    
    // Content filter check
    const filterResult = filterMessage(inputText);
    
    if (filterResult.shouldHide) {
      // Show modal instead of alert
      if (filterResult.category) {
        setFilterCategory(filterResult.category);
        setFilterReason(filterResult.flagReason || 'Contains inappropriate content');
        setFilterModalOpen(true);
      }
      
      // Log the violation
      logFlaggedContent({
        timestamp: new Date().toISOString(),
        userId: ghostSessionId,
        crowdId: crowdId,
        messageId: `blocked-${Date.now()}`,
        originalText: inputText,
        filterResult: filterResult,
      });
      
      setInputText('');
      return;
    }
    
    // If flagged but not hidden, log it but allow sending
    if (filterResult.flagged) {
      logFlaggedContent({
        timestamp: new Date().toISOString(),
        userId: ghostSessionId,
        crowdId: crowdId,
        messageId: `flagged-${Date.now()}`,
        originalText: inputText,
        filterResult: filterResult,
      });
    }
    
    sendMessage(crowdId, inputText, ghostName, ghostSessionId);
    setInputText('');
    
    // Clear typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(crowdId, ghostName, ghostSessionId, false);
  };

  const handleToggleLock = () => {
    toggleAdminOnlyTalk(crowdId);
    const newState = !crowd.adminOnlyTalk;
    addSystemMessage(
      crowdId,
      newState
        ? 'Chat locked. Only admins can send messages.'
        : 'Chat unlocked. Everyone can send messages.',
      newState ? 'adminLock' : 'adminUnlock'
    );
  };

  const handleKickMember = (memberSessionId: string, memberName: string) => {
    setMemberToKick({ id: memberSessionId, name: memberName });
  };

  const handleConfirmKick = () => {
    if (memberToKick) {
      kickMember(crowdId, memberToKick.id);
      addSystemMessage(crowdId, `${memberToKick.name} was removed from the crowd.`, 'kick');
      setMemberToKick(null);
    }
  };

  const handleViewQR = () => {
    if (onViewQr) {
      onViewQr();
    } else {
      alert('QR code viewer not implemented in this demo. The QR code was shown when creating the crowd.');
    }
  };

  const handlePromoteMember = (memberId: string, memberName: string) => {
    setMemberToPromote({ id: memberId, name: memberName });
  };

  const handleConfirmPromote = () => {
    if (memberToPromote) {
      promoteMember(crowdId, memberToPromote.id);
      addSystemMessage(crowdId, `${memberToPromote.name} was promoted to admin.`, 'promote');
      setMemberToPromote(null);
    }
  };

  const handleDemoteMember = (memberId: string, memberName: string) => {
    // Check if this is the only admin
    const adminCount = getAdminCount(crowdId);
    if (adminCount <= 1) {
      alert('Cannot remove admin role. At least one admin is required.');
      return;
    }
    setMemberToDemote({ id: memberId, name: memberName });
  };

  const handleConfirmDemote = () => {
    if (memberToDemote) {
      demoteMember(crowdId, memberToDemote.id);
      addSystemMessage(crowdId, `${memberToDemote.name} is no longer an admin.`, 'demote');
      setMemberToDemote(null);
    }
  };

  const handleDeleteCrowd = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    deleteCrowd(crowdId);
    setShowDeleteDialog(false);
    onBack();
  };

  const handleLeaveCrowd = () => {
    if (!ghostSessionId) return;
    
    // Check if this is an admin trying to leave
    if (isAdmin) {
      const adminCount = getAdminCount(crowdId);
      const memberCount = crowd.memberCount;
      
      // Case: Admin is the only member - will auto-delete
      if (memberCount === 1) {
        setShowLeaveCrowdDialog(true);
        return;
      }
      
      // Case: Admin is the only admin but there are other members
      if (adminCount === 1 && memberCount > 1) {
        setShowNeedAdminWarning(true);
        return;
      }
    }
    
    // Normal member or admin with other admins
    setShowLeaveCrowdDialog(true);
  };

  const handleConfirmLeaveCrowd = () => {
    if (!ghostSessionId || !ghostName) return;
    
    const result = leaveCrowd(crowdId, ghostSessionId);
    
    if (result.canLeave) {
      // If it was just the admin, crowd was deleted
      if (isAdmin && crowd.memberCount === 1) {
        addSystemMessage(crowdId, `${ghostName} left and the crowd was deleted.`, 'leave');
      } else {
        addSystemMessage(crowdId, `${ghostName} left the crowd.`, 'leave');
      }
    }
    
    setShowLeaveCrowdDialog(false);
    onBack();
  };

  const handleMediaUpload = () => {
    if (!isAdmin) {
      return;
    }
    setShowMediaOptions(true);
  };

  const handleSendMedia = (mediaType: 'image' | 'video' | 'file', mediaUrl: string, mediaName: string, caption?: string) => {
    if (!ghostName || !ghostSessionId) return;
    sendMediaMessage(crowdId, mediaType, mediaUrl, mediaName, ghostName, ghostSessionId, caption);
  };

  const handleCopyMessage = (text: string) => {
    // Fallback copy method that doesn't require Clipboard API permissions
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      setCopyFeedbackText('Copied!');
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      textArea.remove();
      setCopyFeedbackText('Copy failed');
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handlePinMessage = (messageId: string) => {
    setPinnedMessage(crowdId, messageId);
    addSystemMessage(crowdId, 'Message pinned by admin.', 'adminLock');
  };

  const handleUnpinMessage = () => {
    setPinnedMessage(crowdId, null);
    addSystemMessage(crowdId, 'Message unpinned by admin.', 'adminUnlock');
  };

  const handleReportMessage = (messageId: string) => {
    setReportingMessageId(messageId);
    setShowReportMessageModal(true);
  };

  const handleSubmitReport = (reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other', details?: string) => {
    if (reportingMessageId && ghostName && ghostSessionId) {
      reportMessage(reportingMessageId, crowdId, ghostSessionId, ghostName, reason, details);
    }
    setReportingMessageId(null);
  };

  const handleSubmitCrowdReport = (reason: 'spam' | 'harassment' | 'hate' | 'sexual' | 'other', details?: string) => {
    if (ghostName && ghostSessionId) {
      reportCrowd(crowdId, ghostSessionId, ghostName, reason, details);
    }
  };

  const handleBlockMember = (memberSessionId: string, memberName: string) => {
    setMemberToBlock({ id: memberSessionId, name: memberName });
  };

  const handleConfirmBlock = () => {
    if (memberToBlock) {
      // Locally block the user (client-side only - hides their messages)
      blockUser(memberToBlock.id, memberToBlock.name);
      
      // Show feedback
      setCopyFeedbackText(`Blocked ${memberToBlock.name}`);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      
      setMemberToBlock(null);
    }
  };

  const handleMuteMember = (memberSessionId: string, memberName: string) => {
    setMemberToMute({ id: memberSessionId, name: memberName });
  };

  const handleConfirmMute = (duration: 'hour' | 'day' | 'permanent') => {
    if (memberToMute && ghostSessionId) {
      // Mute the user
      muteUser(crowdId, memberToMute.id, memberToMute.name, ghostSessionId, duration);
      
      // Add system message
      const durationText = duration === 'hour' ? '1 hour' : duration === 'day' ? '24 hours' : 'permanently';
      addSystemMessage(crowdId, `${memberToMute.name} was muted for ${durationText}.`, 'adminLock');
      
      setMemberToMute(null);
    }
  };

  const scrollToPinnedMessage = () => {
    if (pinnedMessageRef.current) {
      pinnedMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!crowd) return null;

  return (
    <div className="flex h-screen w-full flex-col bg-[#050509]">
      <TopNavBar 
        title={crowd.name}
        subtitle={`${crowd.memberCount} ghosts online`}
        onBack={onBack}
        rightAccessory={
          <div className="flex items-center gap-1">
            {isAdmin && crowd.adminOnlyTalk && (
              <div className="mr-1 text-[#FFA500]" title="Admin-only mode active">
                <Lock size={16} />
              </div>
            )}
            <button 
              onClick={() => setShowMemberSheet(true)}
              className="text-white/80 p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="View members"
            >
              <Users size={20} />
            </button>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white/80 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-white"
                >
                  <DropdownMenuLabel className="text-[#8B8CAD]">
                    <div className="flex items-center gap-2">
                      <Shield size={14} />
                      <span>Admin Controls</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                  <DropdownMenuItem 
                    onClick={handleToggleLock}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    {crowd.adminOnlyTalk ? (
                      <>
                        <Unlock size={16} />
                        <span>Unlock Chat</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Lock Chat</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleViewQR}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <QrCode size={16} />
                    <span>View QR Code</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                  <DropdownMenuItem 
                    onClick={() => setShowMemberSheet(true)}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <UserMinus size={16} />
                    <span>Manage Members</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteCrowd}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>Delete Crowd</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                  <DropdownMenuItem 
                    onClick={handleLeaveCrowd}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <DoorOpen size={16} />
                    <span>Leave Crowd</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* Leave Crowd button for normal members */}
            {!isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-white/80 p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-white"
                >
                  <DropdownMenuItem 
                    onClick={() => setShowReportDialog(true)}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <Flag size={16} />
                    <span>Report Crowd</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                  <DropdownMenuItem 
                    onClick={handleLeaveCrowd}
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                  >
                    <DoorOpen size={16} />
                    <span>Leave Crowd</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Admin-only mode warning banner */}
      {crowd.adminOnlyTalk && !isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFA500]/10 border-b border-[#FFA500]/20 px-4 py-2 flex items-center gap-2 text-[#FFA500] text-sm"
        >
          <AlertCircle size={16} />
          <span>Chat is locked by admins. Only admins can send messages.</span>
        </motion.div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#9B7BFF]/10 border-b border-[#9B7BFF]/20 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#9B7BFF]/15 transition-colors"
          onClick={scrollToPinnedMessage}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pin size={16} className="text-[#9B7BFF] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#9B7BFF] font-medium mb-0.5">Pinned Message</p>
              <p className="text-sm text-white truncate">{pinnedMessage.text}</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUnpinMessage();
              }}
              className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Unpin message"
            >
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}

      {/* Copy Feedback Toast */}
      <AnimatePresence>
        {copyFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#5BE7A9] text-black px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2"
          >
            <Check size={16} />
            <span className="font-medium">{copyFeedbackText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-6">
         {/* Warning Header */}
        {crowd && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center bg-[#181830] px-3 py-1.5 rounded-full text-xs text-[#8B8CAD]">
              <Info size={12} className="mr-2" />
              History disappears in {crowd.durationDays} days
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <Ghost size={48} className="text-[#9B7BFF] mb-3" />
            <p className="text-[#8B8CAD] text-sm">No messages yet</p>
            <p className="text-[#5E607E] text-xs mt-1">Be the first to say something!</p>
          </div>
        )}

        {/* Messages Container */}
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg) => {
              const isPinned = msg.id === pinnedMessageId;
              return (
                <motion.div 
                key={msg.id} 
                ref={isPinned ? pinnedMessageRef : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                  <MessageBubble
                    messageId={msg.id}
                    text={msg.text}
                    senderName={msg.senderGhostName}
                    senderSessionId={msg.senderGhostSessionId}
                  timestamp={msg.createdAt}
                    isOwn={msg.senderGhostSessionId === ghostSessionId}
                    isSystem={msg.isSystem}
                    mediaType={msg.mediaType}
                    mediaUrl={msg.mediaUrl}
                    mediaName={msg.mediaName}
                    onCopyMessage={handleCopyMessage}
                    onPinMessage={handlePinMessage}
                    onUnpinMessage={handleUnpinMessage}
                    onReportMessage={handleReportMessage}
                  onBlockMember={handleBlockMember}
                  onMuteMember={handleMuteMember}
                    isAdmin={isAdmin}
                    isPinned={isPinned}
                    isFlagged={isMessageFlagged(msg.id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-[#8B8CAD] text-sm pt-2 pl-14"
              >
                <div className="flex gap-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-[#9B7BFF] rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-[#9B7BFF] rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-[#9B7BFF] rounded-full"
                  />
                </div>
                <span className="text-xs">
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} ghosts are typing...`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-[#050509] border-t border-[rgba(255,255,255,0.08)]">
        <form 
          onSubmit={handleSend}
          className="flex items-center space-x-2"
        >
          {/* Admin-only media button */}
          {isAdmin && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleMediaUpload}
              className="text-[#9B7BFF] hover:bg-white/10 p-3 rounded-full transition-colors"
              aria-label="Share media (Admin only)"
              title="Share Media (Admin only)"
            >
              <Paperclip size={20} />
            </motion.button>
          )}
          <input
            value={inputText}
            onChange={handleInputChange}
            placeholder={
              crowd.adminOnlyTalk && !isAdmin
                ? "Only admins can send messages or media right now."
                : "Message..."
            }
            disabled={crowd.adminOnlyTalk && !isAdmin}
            className="flex-1 bg-[#141422] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-[#9B7BFF] placeholder:text-[#5E607E] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={!inputText.trim() || (crowd.adminOnlyTalk && !isAdmin)}
            type="submit"
            className="bg-[#9B7BFF] text-white p-3 rounded-full disabled:opacity-50 disabled:bg-[#25263A] transition-colors"
          >
            <Send size={20} />
          </motion.button>
        </form>
      </div>

      {/* Member Sheet */}
      <Sheet open={showMemberSheet} onOpenChange={setShowMemberSheet}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md bg-[#0A0A14] border-l border-[rgba(255,255,255,0.1)] text-white"
        >
          <SheetHeader>
            <SheetTitle className="text-white text-xl">
              Crowd Members
            </SheetTitle>
            <SheetDescription className="text-[#8B8CAD]">
              {crowd.memberCount} {crowd.memberCount === 1 ? 'ghost' : 'ghosts'} in this crowd
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {crowd.members.map((member) => (
              <motion.div
                key={member.ghostSessionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-[#141422] rounded-xl border border-[rgba(255,255,255,0.05)] hover:bg-[#1A1A2E] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={member.ghostName} size="sm" />
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      {member.ghostName}
                      {member.isCreator && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#FFD700]/20 text-[#FFD700] rounded-full flex items-center gap-1">
                          <Crown size={10} />
                          CREATOR
                        </span>
                      )}
                      {member.isAdmin && !member.isCreator && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#9B7BFF]/20 text-[#B88DFF] rounded-full">
                          ADMIN
                        </span>
                      )}
                      {member.ghostSessionId === ghostSessionId && (
                        <span className="text-[10px] px-2 py-0.5 bg-[#4ADE80]/20 text-[#4ADE80] rounded-full">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#8B8CAD]">
                      Joined {new Date(member.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {isAdmin && !member.isAdmin && member.ghostSessionId !== ghostSessionId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePromoteMember(member.ghostSessionId, member.ghostName)}
                      className="text-[#9B7BFF] hover:bg-[#9B7BFF]/10 p-2 rounded-lg transition-colors"
                      aria-label={`Promote ${member.ghostName}`}
                      title="Promote to Admin"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      onClick={() => handleKickMember(member.ghostSessionId, member.ghostName)}
                      className="text-[#FF6363] hover:bg-[#FF6363]/10 p-2 rounded-lg transition-colors"
                      aria-label={`Remove ${member.ghostName}`}
                      title="Remove Member"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                )}
                {isAdmin && member.isAdmin && member.ghostSessionId !== ghostSessionId && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDemoteMember(member.ghostSessionId, member.ghostName)}
                      className="text-[#FF6363] hover:bg-[#FF6363]/10 p-2 rounded-lg transition-colors"
                      aria-label={`Demote ${member.ghostName}`}
                      title="Demote Admin"
                    >
                      <UserMinus size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
            
            {crowd.members.length === 0 && (
              <div className="text-center text-[#8B8CAD] py-8">
                No members yet. Share the QR code to invite others!
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Crowd Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Warning Icon */}
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
                <Ghost size={32} className="text-[#FF6363]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Are you sure you want to delete this crowd?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                This will permanently remove the crowd for all members.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-[#FF6363] text-white hover:bg-[#FF4545]"
              >
                Delete Crowd
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Crowd Dialog */}
      <AlertDialog open={showLeaveCrowdDialog} onOpenChange={setShowLeaveCrowdDialog}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Warning Icon */}
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
                <Ghost size={32} className="text-[#FF6363]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Are you sure you want to leave this crowd?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                This will remove you from the crowd.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmLeaveCrowd}
                className="bg-[#FF6363] text-white hover:bg-[#FF4545]"
              >
                Leave Crowd
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote Member Dialog */}
      <AlertDialog 
        open={memberToPromote !== null} 
        onOpenChange={(open) => !open && setMemberToPromote(null)}
      >
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Success Icon */}
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
                className="absolute inset-0 bg-[#9B7BFF] rounded-full blur-xl"
              />
              {/* Icon container */}
              <div className="relative bg-[#9B7BFF]/20 p-4 rounded-full border-2 border-[#9B7BFF]/30">
                <UserPlus size={32} className="text-[#9B7BFF]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Promote Member
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                {memberToPromote && `Are you sure you want to promote ${memberToPromote.name} to admin?`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmPromote}
                className="bg-[#9B7BFF] text-white hover:bg-[#8B6BEF]"
              >
                Promote
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demote Member Dialog */}
      <AlertDialog 
        open={memberToDemote !== null} 
        onOpenChange={(open) => !open && setMemberToDemote(null)}
      >
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Warning Icon */}
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
                <Shield size={32} className="text-[#FFA500]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Demote Admin
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                {memberToDemote && `Are you sure you want to demote ${memberToDemote.name} from admin?`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDemote}
                className="bg-[#FFA500] text-white hover:bg-[#FF9500]"
              >
                Demote
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kick Member Dialog */}
      <AlertDialog 
        open={memberToKick !== null} 
        onOpenChange={(open) => !open && setMemberToKick(null)}
      >
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Warning Icon */}
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
                <UserMinus size={32} className="text-[#FF6363]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Remove Member
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                {memberToKick && `Are you sure you want to remove ${memberToKick.name} from the crowd?`}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmKick}
                className="bg-[#FF6363] text-white hover:bg-[#FF4545]"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media Share Sheet */}
      <MediaShareSheet
        open={showMediaOptions}
        onOpenChange={setShowMediaOptions}
        onSend={handleSendMedia}
        isAdmin={isAdmin}
      />

      {/* Need Admin Warning Dialog */}
      <AlertDialog open={showNeedAdminWarning} onOpenChange={setShowNeedAdminWarning}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Warning Icon */}
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
                <AlertTriangle size={32} className="text-[#FFA500]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-xl text-white">
                Please assign another admin before leaving
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                You are the only admin in this crowd. Promote someone else to admin before you can leave.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                OK
              </AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Crowd Modal */}
      <ReportCrowdModal
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onSubmit={handleSubmitCrowdReport}
        crowdName={crowd.name}
      />

      {/* Report Message Modal */}
      <ReportMessageModal
        isOpen={showReportMessageModal}
        onClose={() => {
          setShowReportMessageModal(false);
          setReportingMessageId(null);
        }}
        onSubmit={handleSubmitReport}
        messagePreview={reportingMessageId ? messages.find(m => m.id === reportingMessageId)?.text : undefined}
      />

      {/* Block User Modal */}
      <BanUserModal
        isOpen={memberToBlock !== null}
        onClose={() => setMemberToBlock(null)}
        onConfirm={handleConfirmBlock}
        userName={memberToBlock?.name || ''}
      />

      {/* Mute User Modal */}
      <MuteUserModal
        isOpen={memberToMute !== null}
        onClose={() => setMemberToMute(null)}
        onConfirm={handleConfirmMute}
        userName={memberToMute?.name || ''}
      />

      {/* Content Filter Modal */}
      <ContentFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        category={filterCategory}
        flagReason={filterReason}
        context="message"
      />
    </div>
  );
};