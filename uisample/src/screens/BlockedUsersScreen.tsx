import React from 'react';
import { ArrowLeft, User, Search, UserMinus, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSessionStore } from '../stores/useSessionStore';
import { Avatar } from '../components/ui/avatar';

interface BlockedUsersScreenProps {
  onBack: () => void;
}

export const BlockedUsersScreen = ({ onBack }: BlockedUsersScreenProps) => {
  const { 
    blockedUsers, 
    unblockUser, 
    amigoThemeMode: themeMode 
  } = useSessionStore();
  
  const isDarkMode = themeMode !== 'day';
  
  // Theme Color Logic
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';
  
  const themeGradient = themeMode === 'ghost'
    ? 'from-[#9B7BFF] to-[#7C5FD4]' 
    : themeMode === 'day'
    ? 'from-[#2563EB] to-[#1E40AF]'
    : 'from-[#3B82F6] to-[#1D4ED8]';

  return (
    <div className={`flex h-screen w-full flex-col ${isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]'} transition-colors duration-300 font-sans`}>
      {/* Header */}
      <motion.div 
        className="px-5 pt-4 pb-2 flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.button 
          onClick={onBack}
          className={`p-2 -ml-2 rounded-xl transition-all duration-200 ${
            isDarkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-gray-100 active:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} className={isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-600'} />
        </motion.button>
        
        <h1 className={`text-[20px] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Blocked Users
        </h1>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
           <p className={`text-[14px] leading-relaxed ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
             Blocked users cannot send you messages or see your profile updates. They will not be notified when you block them.
           </p>
        </motion.div>

        {blockedUsers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              isDarkMode ? 'bg-[#1A1A2E]' : 'bg-gray-100'
            }`}>
              <Shield size={32} className={isDarkMode ? 'text-[#5E607E]' : 'text-gray-400'} />
            </div>
            <h3 className={`text-[16px] font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No blocked users
            </h3>
            <p className={`text-[14px] max-w-[200px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
              You haven't blocked anyone yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {blockedUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={`flex items-center justify-between p-4 rounded-[20px] ${
                    isDarkMode ? 'bg-[#141422] border border-white/5' : 'bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={user.name} 
                      src={user.avatar} 
                      size="md" 
                      className="w-12 h-12" 
                    />
                    <div>
                      <h3 className={`text-[16px] font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h3>
                      <p className={`text-[12px] ${isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500'}`}>
                        Blocked on {new Date(user.blockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => unblockUser(user.id)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white/5 text-white hover:bg-white/10' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Unblock
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
