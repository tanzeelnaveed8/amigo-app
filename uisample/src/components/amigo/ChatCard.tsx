import React from 'react';
import { motion } from 'motion/react';
import { Avatar } from '../ui/avatar';
import { Check, CheckCheck } from 'lucide-react';

interface ChatCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  isRead?: boolean;
  type: 'dm' | 'group' | 'signal';
  onClick?: () => void;
  isDarkMode?: boolean;
}

export const ChatCard = ({
  id,
  name,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  isRead = false,
  type,
  onClick,
  isDarkMode = true,
}: ChatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative flex items-center gap-4 px-5 py-4 cursor-pointer 
        transition-all duration-200
        ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}
        ${unreadCount > 0 ? (isDarkMode ? 'bg-white/[0.01]' : 'bg-blue-50/30') : ''}
      `}
    >
      {/* Unread Indicator Line */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-[#3B82F6] to-[#60A5FA] rounded-r-full"
        />
      )}

      {/* Avatar with Online Indicator */}
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <Avatar 
            name={name} 
            size="md"
            src={avatarUrl}
          />
          {isOnline && type === 'dm' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute bottom-0 right-0 w-[15px] h-[15px] rounded-full border-[3px] bg-[#10B981]"
              style={{
                borderColor: isDarkMode ? '#0C0E16' : '#FFFFFF',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className={`
            text-[16px] truncate transition-colors
            ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}
            ${isDarkMode ? 'text-white' : 'text-gray-900'}
          `}>
            {name}
          </h3>
          <span className={`
            text-[12px] font-medium flex-shrink-0 ml-3
            ${isDarkMode ? 'text-white/50' : 'text-gray-500'}
          `}>
            {timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className={`
            text-[14px] truncate transition-colors
            ${unreadCount > 0 ? 'font-medium' : 'font-normal'}
            ${isDarkMode ? (unreadCount > 0 ? 'text-white/80' : 'text-white/50') : (unreadCount > 0 ? 'text-gray-700' : 'text-gray-500')}
          `}>
            {lastMessage}
          </p>

          {/* Right indicators */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isRead && unreadCount === 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <CheckCheck size={16} className="text-[#3B82F6]" strokeWidth={2.5} />
              </motion.div>
            )}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="min-w-[22px] h-[22px] px-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <span className="text-white text-[11px] font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};