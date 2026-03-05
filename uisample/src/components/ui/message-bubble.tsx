import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Avatar } from './avatar';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Copy, Pin, PinOff, Flag, AlertTriangle, Ban, VolumeX } from 'lucide-react@0.487.0';
import { linkifyText } from '../../lib/linkify';

interface MessageBubbleProps {
  text: string;
  isOwn: boolean;
  senderName: string;
  timestamp: Date;
  isSystem?: boolean;
  showAvatar?: boolean;
  mediaType?: 'image' | 'video' | 'file';
  mediaUrl?: string;
  mediaName?: string;
  messageId?: string;
  senderSessionId?: string;
  onCopyMessage?: (text: string) => void;
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  onReportMessage?: (messageId: string) => void;
  onBlockMember?: (sessionId: string, name: string) => void;
  onMuteMember?: (sessionId: string, name: string) => void;
  isAdmin?: boolean;
  isPinned?: boolean;
  isFlagged?: boolean;
}

export const MessageBubble = ({
  text,
  isOwn,
  senderName,
  timestamp,
  isSystem,
  showAvatar = true,
  mediaType,
  mediaUrl,
  mediaName,
  messageId,
  senderSessionId,
  onCopyMessage,
  onPinMessage,
  onUnpinMessage,
  onReportMessage,
  onBlockMember,
  onMuteMember,
  isAdmin,
  isPinned,
  isFlagged,
}: MessageBubbleProps) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Show custom context menu
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleCopy = () => {
    if (onCopyMessage && text) {
      onCopyMessage(text);
    }
    setShowContextMenu(false);
  };

  const handlePin = () => {
    if (messageId && onPinMessage) {
      onPinMessage(messageId);
    }
    setShowContextMenu(false);
  };

  const handleUnpin = () => {
    if (messageId && onUnpinMessage) {
      onUnpinMessage(messageId);
    }
    setShowContextMenu(false);
  };

  const handleReport = () => {
    if (messageId && onReportMessage) {
      onReportMessage(messageId);
    }
    setShowContextMenu(false);
  };

  const handleBlock = () => {
    if (senderSessionId && onBlockMember) {
      onBlockMember(senderSessionId, senderName);
    }
    setShowContextMenu(false);
  };

  const handleMute = () => {
    if (senderSessionId && onMuteMember) {
      onMuteMember(senderSessionId, senderName);
    }
    setShowContextMenu(false);
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showContextMenu]);

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-4 px-8"
      >
        <p className="text-xs text-[#5E607E] text-center bg-[#141422] py-1.5 px-3 rounded-full">
          {text}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-3 px-1",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && showAvatar && (
        <div className="mr-2 flex items-end shrink-0">
          <Avatar name={senderName} size="xs" />
        </div>
      )}
      
      <div className="relative max-w-[85%]">
        {/* Flagged Indicator (Admin only) */}
        {isFlagged && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-6 left-0 flex items-center gap-1 bg-[#FFA500]/20 border border-[#FFA500]/40 rounded-lg px-2 py-1"
          >
            <AlertTriangle size={12} className="text-[#FFA500]" />
            <span className="text-[10px] text-[#FFA500] font-semibold uppercase">
              Flagged
            </span>
          </motion.div>
        )}

        <div
          onContextMenu={handleContextMenu}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed relative group cursor-pointer overflow-hidden",
            isOwn 
              ? "bg-[#7B5CFF] text-white rounded-br-sm" 
              : "bg-[#1F2033] text-white rounded-bl-sm",
            isFlagged && isAdmin ? "ring-1 ring-[#FFA500]/30" : ""
          )}
        >
          {!isOwn && (
            <p className="text-[11px] font-medium text-[#B88DFF] mb-0.5 opacity-90 break-words overflow-wrap-anywhere">
              {senderName}
            </p>
          )}
          
          {/* Media Content */}
          {mediaType && mediaUrl && (
            <div className="mb-2">
              {mediaType === 'image' && (
                <div className="rounded-lg overflow-hidden bg-black/20">
                  <img 
                    src={mediaUrl} 
                    alt={mediaName || 'Shared image'} 
                    className="max-w-full h-auto max-h-64 rounded-lg"
                  />
                </div>
              )}
              {mediaType === 'video' && (
                <div className="rounded-lg overflow-hidden bg-black/20">
                  <video 
                    src={mediaUrl} 
                    controls 
                    className="max-w-full h-auto max-h-64 rounded-lg"
                  />
                </div>
              )}
              {mediaType === 'file' && (
                <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg">
                  <FileText className="w-8 h-8 text-[#9B7BFF] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{mediaName || 'File'}</p>
                    <p className="text-xs text-white/60">Tap to download</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {text && <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap text-left" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{linkifyText(text)}</div>}
          <div 
            className={cn(
              "text-[10px] mt-1 text-right",
              isOwn ? "text-white/60" : "text-[#8B8CAD]"
            )}
          >
            {format(timestamp, 'HH:mm')}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bg-[#1A1A2E] border border-[rgba(255,255,255,0.1)] text-white rounded-lg shadow-2xl z-50 overflow-hidden"
            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          >
            <button
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left"
              onClick={handleCopy}
            >
              <Copy size={16} className="text-[#9B7BFF]" />
              <span className="text-sm">Copy Message</span>
            </button>
            
            {/* Report Message */}
            {!isOwn && senderSessionId && onReportMessage && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left border-t border-[rgba(255,255,255,0.05)]"
                onClick={handleReport}
              >
                <Flag size={16} className="text-[#FBBF24]" />
                <span className="text-sm">Report Message</span>
              </button>
            )}

            {/* Block option (Available to ALL users, not just admins) */}
            {!isOwn && senderSessionId && onBlockMember && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left border-t border-[rgba(255,255,255,0.05)]"
                onClick={handleBlock}
              >
                <Ban size={16} className="text-[#FF6363]" />
                <span className="text-sm">Block User</span>
              </button>
            )}

            {/* Mute option (Admin only) */}
            {isAdmin && !isOwn && senderSessionId && onMuteMember && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left border-t border-[rgba(255,255,255,0.05)]"
                onClick={handleMute}
              >
                <VolumeX size={16} className="text-[#FBBF24]" />
                <span className="text-sm">Mute Member</span>
              </button>
            )}

            {isAdmin && (
              <button
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors w-full text-left border-t border-[rgba(255,255,255,0.05)]"
                onClick={isPinned ? handleUnpin : handlePin}
              >
                {isPinned ? (
                  <>
                    <PinOff size={16} className="text-[#FFA500]" />
                    <span className="text-sm">Unpin Message</span>
                  </>
                ) : (
                  <>
                    <Pin size={16} className="text-[#9B7BFF]" />
                    <span className="text-sm">Pin Message</span>
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};