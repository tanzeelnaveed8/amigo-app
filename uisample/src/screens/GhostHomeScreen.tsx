import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, LogOut, PlusCircle, Camera, Users, Clock, AlertTriangle, Ghost, Wallet } from 'lucide-react';
import { useCrowdStore } from '../stores/useCrowdStore';
import { useSessionStore } from '../stores/useSessionStore';
import { useChatStore } from '../stores/useChatStore';
import { Avatar } from '../components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
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

interface GhostHomeScreenProps {
  onCreateCrowd: () => void;
  onScanQr: () => void;
  onOpenChat: (crowdId: string) => void;
  onExit: () => void;
  onOpenSettings: () => void;
}

interface ActionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
  delay?: number;
  testID?: string;
  ariaLabel?: string;
}

const ActionCard = ({ icon: Icon, iconColor, title, description, onPress, delay = 0, testID, ariaLabel }: ActionCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileTap={{ scale: 0.97 }}
    onClick={onPress}
    className="w-full bg-[#141422] rounded-[24px] p-5 border border-[rgba(255,255,255,0.08)] min-h-[140px] flex flex-col justify-center text-left hover:bg-[#1A1A2E] transition-colors"
    data-testid={testID}
    aria-label={ariaLabel}
  >
    <div className="flex flex-row items-center mb-4">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(155,123,255,0.1)] flex items-center justify-center mr-4 shrink-0">
        <Icon size={28} color={iconColor} />
      </div>
      <span className="text-[20px] font-semibold text-white flex-1 leading-tight">
        {title}
      </span>
    </div>
    <p className="text-[14px] text-[#C5C6E3] leading-[20px]">
      {description}
    </p>
  </motion.button>
);

export const GhostHomeScreen = ({ onCreateCrowd, onScanQr, onOpenChat, onExit, onOpenSettings }: GhostHomeScreenProps) => {
  const { crowds, setActiveCrowd, joinCrowd } = useCrowdStore();
  const { ghostName, ghostSessionId } = useSessionStore();
  const addSystemMessage = useChatStore(state => state.addSystemMessage);
  const crowdList = Object.values(crowds);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Auto-join "Midnight Runners" crowd as a member (not admin)
  useEffect(() => {
    const MIDNIGHT_RUNNERS_ID = 'crowd-1';
    const midnightRunners = crowds[MIDNIGHT_RUNNERS_ID];
    
    if (midnightRunners && ghostName && ghostSessionId) {
      // Check if user is not already a member
      const isAlreadyMember = midnightRunners.members.some(
        member => member.ghostSessionId === ghostSessionId
      );
      
      if (!isAlreadyMember) {
        // Join the crowd as a regular member
        const result = joinCrowd(MIDNIGHT_RUNNERS_ID, ghostName, ghostSessionId);
        
        if (result.success) {
          const displayName = result.adjustedName || ghostName;
          addSystemMessage(MIDNIGHT_RUNNERS_ID, `${displayName} joined the crowd.`, 'join');
        }
      }
    }
  }, [ghostName, ghostSessionId]); // Only run when these change

  const handleCrowdPress = (id: string) => {
    setActiveCrowd(id);
    onOpenChat(id);
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    onExit();
    setShowLogoutDialog(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] px-6 pt-12 pb-8"
      aria-label={`Ghost Home. Welcome, ${ghostName}`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onOpenSettings}
          className="p-2 -ml-2 text-[#8B8CAD] hover:text-white transition-colors rounded-full active:bg-white/5"
          aria-label="Open ghost mode settings"
        >
          <Settings size={24} />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2 -mr-2 text-[#8B8CAD] hover:text-[#FF6363] transition-colors rounded-full active:bg-[#FF6363]/10"
          aria-label="Exit ghost mode"
        >
          <LogOut size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-5"
          >
            <Avatar 
              name={ghostName || 'Ghost'} 
              size="xl" 
              showStatus={false}
              className="shadow-[0_0_30px_rgba(155,123,255,0.2)]"
            />
          </motion.div>
          <h1 className="text-[28px] font-bold text-white text-center mb-2">
            Welcome, {ghostName} 👻
          </h1>
          <p className="text-[16px] text-[#C5C6E3] text-center max-w-xs">
            Create or join a temporary crowd to start chatting.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col gap-4 mb-8">
          <ActionCard 
            icon={PlusCircle}
            iconColor="#9B7BFF"
            title="Create Crowd"
            description="Start a new temporary crowd and invite others"
            onPress={onCreateCrowd}
            delay={0.1}
            testID="create-crowd-card"
            ariaLabel="Create a new crowd"
          />
          <ActionCard 
            icon={Camera}
            iconColor="#B88DFF"
            title="Join Crowd"
            description="Scan a QR code to join an existing crowd"
            onPress={onScanQr}
            delay={0.2}
            testID="join-crowd-card"
            ariaLabel="Scan QR code to join a crowd"
          />
        </div>

        {/* Active Crowds (Optional/Secondary) */}
        {crowdList.length > 0 && (
          <div className="mt-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-[13px] font-semibold text-[#8B8CAD] uppercase tracking-wider mb-3 ml-1">Active Crowds</h3>
            <div className="overflow-y-auto -mx-2 px-2 pb-4 space-y-3 custom-scrollbar">
              {crowdList.map((crowd, idx) => (
                <motion.div
                  key={crowd.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.05) }}
                  onClick={() => handleCrowdPress(crowd.id)}
                  className="bg-[#141422]/50 border border-[rgba(255,255,255,0.05)] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-[#1A1A2E] active:scale-[0.99] transition-all"
                >
                  <div>
                    <h4 className="font-medium text-white text-sm">{crowd.name}</h4>
                    <div className="flex items-center text-xs text-[#8B8CAD] mt-1 gap-3">
                      <span className="flex items-center"><Users size={10} className="mr-1"/> {crowd.memberCount}</span>
                      <span className="flex items-center"><Clock size={10} className="mr-1"/> {crowd.durationDays}d</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-1 rounded-full font-medium",
                    crowd.expiresAt.getTime() - Date.now() < 3600000 
                      ? "bg-[#FF6363]/20 text-[#FF6363]" 
                      : "bg-[#25263A] text-[#C5C6E3]"
                  )}>
                    {formatDistanceToNow(crowd.expiresAt, { addSuffix: true })}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4">
        <p className="text-[12px] text-[#5E607E] text-center">
          Remember: Crowds are temporary and fully anonymous.
        </p>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-[#0A0A14] border-[rgba(255,255,255,0.1)] text-white max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Ghost Icon */}
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
                <Ghost size={32} className="text-[#9B7BFF]" strokeWidth={2} />
              </div>
            </motion.div>

            <AlertDialogHeader className="text-center space-y-3">
              <AlertDialogTitle className="text-white text-xl font-bold mb-2">
                Are you sure you want to log out from Ghost Mode?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#8B8CAD]">
                Your ghost identity will be lost if there is no active crowd.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full mt-6 flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel className="bg-[#141422] text-white border-[rgba(255,255,255,0.1)] hover:bg-[#1A1A2E] hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmLogout}
                className="bg-[#9B7BFF] text-white hover:bg-[#8B6BEF]"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};