import React, { useState } from 'react';
import { ArrowLeft, Search, Shield, UserMinus, Star, Ban, X, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { cn } from '../lib/utils';
import { useSessionStore } from '../stores/useSessionStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

interface AmigoRoomMembersScreenProps {
  onBack: () => void;
}

const MEMBERS = [
  { id: '1', name: 'Sarah Miller', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', isOnline: true, status: 'At the gym 🏋️‍♀️' },
  { id: '2', name: 'Mike Chen', role: 'Member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isOnline: false, status: 'Coding 💻' },
  { id: '3', name: 'Alex Johnson', role: 'Member', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80', isOnline: true, status: 'In a meeting' },
  { id: '4', name: 'Emily Davis', role: 'Member', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', isOnline: false, status: 'Sleeping 😴' },
  { id: '5', name: 'David Wilson', role: 'Member', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', isOnline: true, status: 'Available' },
  { id: '6', name: 'Jessica Lee', role: 'Member', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', isOnline: false, status: 'On vacation 🌴' },
  { id: '7', name: 'Tom Brown', role: 'Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', isOnline: true, status: 'Gaming 🎮' },
  { id: '8', name: 'Lisa Taylor', role: 'Member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isOnline: false, status: 'Busy' },
];

export const AmigoRoomMembersScreen = ({ onBack }: AmigoRoomMembersScreenProps) => {
  const { amigoThemeMode: themeMode } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [selectedMember, setSelectedMember] = useState<typeof MEMBERS[0] | null>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  
  const isDarkMode = themeMode !== 'day';
  const themeColor = themeMode === 'ghost' ? '#9B7BFF' : themeMode === 'day' ? '#2563EB' : '#3B82F6';

  const themeClasses = {
    bg: isDarkMode ? 'bg-[#0A0A14]' : 'bg-[#F5F5F7]',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-[#8B8CAD]' : 'text-gray-500',
    headerBg: isDarkMode ? 'bg-[#0A0A14]/90' : 'bg-[#F5F5F7]/90',
    hover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100',
    inputBg: isDarkMode ? 'bg-[#141422] border-white/5' : 'bg-white border-gray-200',
  };

  const filteredMembers = MEMBERS.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (member: typeof MEMBERS[0], action: 'admin' | 'remove' | 'ban') => {
    setSelectedMember(member);
    if (action === 'admin') setShowAdminDialog(true);
    if (action === 'remove') setShowRemoveDialog(true);
    if (action === 'ban') setShowBanDialog(true);
  };

  return (
    <div className={cn("flex flex-col h-full w-full overflow-hidden relative transition-colors duration-300", themeClasses.bg)}>
      {/* Header */}
      <div className={cn("flex-none px-5 pt-4 pb-2 z-10 sticky top-0 backdrop-blur-md border-b", isDarkMode ? "border-white/5" : "border-gray-200/50", themeClasses.headerBg)}>
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
          <div className="flex flex-col items-center">
            <span className={cn("font-bold text-lg", themeClasses.text)}>Members</span>
            <span className={cn("text-xs font-medium", themeClasses.subtext)}>{MEMBERS.length} people</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input 
                type="text" 
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all",
                    themeClasses.inputBg,
                    themeClasses.text
                )}
            />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2">
         {filteredMembers.map((member, i) => (
             <DropdownMenu key={member.id}>
                <DropdownMenuTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-colors group outline-none",
                            themeClasses.hover
                        )}
                    >
                        <div className="relative">
                            <Avatar className="w-12 h-12 border-2" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            {member.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[2px]" style={{ borderColor: isDarkMode ? '#0A0A14' : '#F5F5F7' }} />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className={cn("font-semibold text-[15px] truncate", themeClasses.text)}>
                                    {member.name}
                                </h3>
                                {member.role === 'Admin' && (
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider", isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600")}>
                                        Admin
                                    </span>
                                )}
                            </div>
                            <p className={cn("text-xs truncate opacity-70", themeClasses.subtext)}>
                                {member.status}
                            </p>
                        </div>
                    </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={isDarkMode ? "bg-[#1A1A2E] border-white/10 text-white" : "bg-white border-gray-200"}>
                    <DropdownMenuItem 
                        onClick={() => handleAction(member, 'admin')}
                        className="cursor-pointer"
                    >
                        <Star className="w-4 h-4 mr-2" /> Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={() => handleAction(member, 'remove')}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                        <UserMinus className="w-4 h-4 mr-2" /> Remove
                    </DropdownMenuItem>
                        <DropdownMenuItem 
                        onClick={() => handleAction(member, 'ban')}
                        className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                        <Shield className="w-4 h-4 mr-2" /> Ban
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
         ))}
         
         {filteredMembers.length === 0 && (
             <div className="flex flex-col items-center justify-center py-10 opacity-50">
                 <Search size={48} className="mb-4 opacity-50" />
                 <p className="text-sm">No members found</p>
             </div>
         )}
      </div>

      {/* Make Admin Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
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
                            className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
                        />
                        {/* Icon container */}
                        <div className="relative bg-blue-500/20 p-4 rounded-full border-2 border-blue-500/30">
                            <Star size={32} className="text-blue-500" strokeWidth={2} />
                        </div>
                    </motion.div>

                    <AlertDialogHeader className="text-center space-y-3">
                        <AlertDialogTitle className="text-xl">Make {selectedMember?.name} an Admin?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            They will be able to manage members, edit room settings, and moderate messages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => setShowAdminDialog(false)} 
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                        >
                            Confirm Admin
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
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
                            className="absolute inset-0 bg-orange-500 rounded-full blur-xl"
                        />
                        {/* Icon container */}
                        <div className="relative bg-orange-500/20 p-4 rounded-full border-2 border-orange-500/30">
                            <UserMinus size={32} className="text-orange-500" strokeWidth={2} />
                        </div>
                    </motion.div>

                    <AlertDialogHeader className="text-center space-y-3">
                        <AlertDialogTitle className="text-xl">Remove {selectedMember?.name}?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            They will be removed from the room but can rejoin using an invite link.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => setShowRemoveDialog(false)} 
                            className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
      </AlertDialog>

      {/* Ban Member Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
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
                        <AlertDialogTitle className="text-xl">Ban {selectedMember?.name}?</AlertDialogTitle>
                        <AlertDialogDescription className={isDarkMode ? "text-[#8B8CAD]" : "text-gray-500"}>
                            They will be permanently removed and blocked from rejoining this room.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className={isDarkMode ? "bg-[#141422] text-white border-white/10 hover:bg-[#1A1A2E] hover:text-white" : ""}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => setShowBanDialog(false)} 
                            className="bg-[#FF6363] hover:bg-[#FF4545] text-white border-0"
                        >
                            Ban User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};
