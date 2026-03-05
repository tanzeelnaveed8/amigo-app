import React from 'react';
import { motion } from 'motion/react';
import { Avatar } from '../ui/avatar';

interface OnlineUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface OnlineUsersProps {
  users: OnlineUser[];
  onUserClick?: (userId: string) => void;
  isDarkMode?: boolean;
}

export const OnlineUsers = ({ users, onUserClick, isDarkMode = true }: OnlineUsersProps) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-5 px-5 py-2">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.06,
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUserClick?.(user.id)}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group"
          >
            <div className="relative">
              {/* Glow Effect */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] blur-md opacity-40"
              />
              
              {/* Avatar Container */}
              <div className="relative">
                <div className="p-[2px] rounded-full bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#3B82F6] shadow-lg shadow-blue-500/30">
                  <div className={`rounded-full p-[2px] ${isDarkMode ? 'bg-[#0B3A6B]' : 'bg-white'}`}>
                    <Avatar name={user.name} size="md" src={user.avatarUrl} />
                  </div>
                </div>
                
                {/* Enhanced Online Indicator */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(16, 185, 129, 0.4)',
                      '0 0 0 4px rgba(16, 185, 129, 0)',
                      '0 0 0 0 rgba(16, 185, 129, 0)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-0 right-0 w-[16px] h-[16px] rounded-full border-[3px] bg-[#10B981]"
                  style={{
                    borderColor: isDarkMode ? '#0B3A6B' : '#60A5FA'
                  }}
                />
              </div>
            </div>
            
            {/* Name with enhanced styling */}
            <motion.span 
              className={`
                text-[11px] font-bold max-w-[60px] truncate
                transition-all duration-200
                ${isDarkMode ? 'text-white/90 group-hover:text-white' : 'text-gray-900'}
              `}
              whileHover={{ scale: 1.05 }}
            >
              {user.name}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};