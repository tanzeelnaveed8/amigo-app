import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SplashScreen } from './screens/SplashScreen';
import { EntryScreen } from './screens/EntryScreen';
import { TermsAgreementScreen } from './screens/TermsAgreementScreen';
import { GhostNameScreen } from './screens/GhostNameScreen';
import { GhostHomeScreen } from './screens/GhostHomeScreen';
import { CreateCrowdScreen } from './screens/CreateCrowdScreen';
import { CrowdQrScreen } from './screens/CrowdQrScreen';
import { CrowdChatScreen } from './screens/CrowdChatScreen';
import { QrScanScreen } from './screens/QrScanScreen';
import { ViewQrScreen } from './screens/ViewQrScreen';
import { OtpScreen } from './screens/OtpScreen';
import { AccessRequiredScreen } from './screens/AccessRequiredScreen';
import { InviteCodeScreen } from './screens/InviteCodeScreen';
import { PremiumAccessPassScreen } from './screens/PremiumAccessPassScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { AmigoChatScreen } from './screens/AmigoChatScreen';
import { AmigoGroupChatScreen } from './screens/AmigoGroupChatScreen';
import { AmigoChannelChatScreen } from './screens/AmigoChannelChatScreen';
import { AmigoHomeScreen } from './screens/AmigoHomeScreen';
import { GhostSettingsScreen } from './screens/GhostSettingsScreen';
import { WalletScreen } from './screens/WalletScreen';
import { CommunityGuidelinesScreen } from './screens/CommunityGuidelinesScreen';
import { PhoneNumberPopup } from './components/PhoneNumberPopup';
import { useSessionStore } from './stores/useSessionStore';
import { useCrowdStore } from './stores/useCrowdStore';

type Screen = 
  | 'splash' 
  | 'entry'
  | 'terms-agreement'
  | 'ghost-name' 
  | 'ghost-home' 
  | 'create-crowd' 
  | 'crowd-qr' 
  | 'scan-qr'
  | 'chat'
  | 'amigo-chat'
  | 'amigo-group-chat'
  | 'amigo-channel-chat'
  | 'view-qr'
  | 'otp'
  | 'access-required'
  | 'invite-code'
  | 'premium-access-pass'
  | 'profile-setup'
  | 'amigo-home'
  | 'ghost-settings'
  | 'wallet'
  | 'community-guidelines';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedCrowdId, setSelectedCrowdId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const { mode, exitGhostMode, ghostSessionId } = useSessionStore();
  const { isUserAdmin } = useCrowdStore();

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handlePhoneVerify = (phone: string) => {
    setPhoneNumber(phone);
    
    // Simulate backend check - then navigate
    // Demo: 9971645229 is an existing user (goes to OTP)
    // All other numbers are new users (go to Access Required)
    const accountExists = phone.includes('9971645229');
    setIsExistingUser(accountExists);
    
    // Close popup
    setShowPhonePopup(false);
    
    // Always navigate to OTP first for verification
    navigate('otp');
  };

  // Screen Rendering Logic
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={() => navigate('entry')} />;
      
      case 'entry':
        return (
          <EntryScreen 
            onSelectGhost={() => {
              // Check if user has accepted terms
              const termsAccepted = localStorage.getItem('ghost_terms_accepted');
              if (termsAccepted === 'true') {
                navigate('ghost-name');
              } else {
                navigate('terms-agreement');
              }
            }}
            onSelectLogin={() => setShowPhonePopup(true)}
          />
        );
      
      case 'terms-agreement':
        return (
          <TermsAgreementScreen 
            onAccept={() => navigate('ghost-name')}
            onBack={() => navigate('entry')}
          />
        );
      
      case 'ghost-name':
        return (
          <GhostNameScreen 
            onContinue={() => navigate('ghost-home')}
            onBack={() => navigate('entry')}
          />
        );
      
      case 'ghost-home':
        return (
          <GhostHomeScreen 
            onCreateCrowd={() => navigate('create-crowd')}
            onScanQr={() => navigate('scan-qr')}
            onOpenChat={(id) => {
              setSelectedCrowdId(id);
              navigate('chat');
            }}
            onExit={() => {
              exitGhostMode();
              navigate('entry');
            }}
            onOpenSettings={() => navigate('ghost-settings')}
          />
        );
      
      case 'create-crowd':
        return (
          <CreateCrowdScreen 
            onSuccess={(id) => {
              setSelectedCrowdId(id);
              navigate('crowd-qr');
            }}
            onBack={() => navigate('ghost-home')}
          />
        );
      
      case 'crowd-qr':
        return (
          <CrowdQrScreen 
            crowdId={selectedCrowdId!} 
            onEnterChat={() => navigate('chat')}
            onBack={() => navigate('ghost-home')}
          />
        );
        
      case 'scan-qr':
        return (
          <QrScanScreen 
            onBack={() => navigate('ghost-home')}
            onJoinSuccess={(id) => {
              setSelectedCrowdId(id);
              navigate('chat');
            }}
          />
        );
      
      case 'chat':
        return (
          <CrowdChatScreen 
            crowdId={selectedCrowdId!} 
            onBack={() => navigate('ghost-home')}
            onViewQr={() => navigate('view-qr')}
          />
        );
        
      case 'view-qr':
        return (
          <ViewQrScreen 
            crowdId={selectedCrowdId!} 
            onBack={() => navigate('chat')}
            isAdmin={selectedCrowdId && ghostSessionId ? isUserAdmin(selectedCrowdId, ghostSessionId) : false}
          />
        );
        
      case 'otp':
        return (
          <OtpScreen 
            phoneNumber={phoneNumber}
            onVerify={() => {
              // Existing users go directly to home
              // New users go to Access Required screen
              if (isExistingUser) {
                navigate('amigo-home');
              } else {
                navigate('access-required');
              }
            }}
            onBack={() => navigate('entry')}
          />
        );
        
      case 'access-required':
        return (
          <AccessRequiredScreen 
            onSelectInviteCode={() => navigate('invite-code')}
            onSelectPremiumPass={() => navigate('premium-access-pass')}
            onBack={() => navigate('entry')}
          />
        );
        
      case 'invite-code':
        return (
          <InviteCodeScreen 
            onVerify={(inviteCode) => {
              // User has already verified phone (OTP), so go to profile setup
              setIsExistingUser(false);
              navigate('profile-setup');
            }}
            onBack={() => navigate('access-required')}
            onSwitchToPremium={() => navigate('premium-access-pass')}
          />
        );
        
      case 'premium-access-pass':
        return (
          <PremiumAccessPassScreen 
            onPurchase={() => {
              // User has already verified phone (OTP), so go to profile setup
              setIsExistingUser(false);
              navigate('profile-setup');
            }}
            onBack={() => navigate('access-required')}
            onSwitchToInvite={() => navigate('invite-code')}
          />
        );
        
      case 'profile-setup':
        return (
          <ProfileSetupScreen 
            onComplete={(profileData) => {
              // In production, save profile data to backend
              console.log('Profile data:', profileData);
              navigate('amigo-home');
            }}
            onBack={() => {
              // If existing user came from OTP, go back to OTP (though this flow shouldn't happen for existing users)
              // If new user came from Access Required flow, go back to Access Required
              if (isExistingUser) {
                navigate('otp');
              } else {
                navigate('access-required'); 
              }
            }}
          />
        );
        
      case 'amigo-chat':
        return (
          <AmigoChatScreen 
            chatId={selectedChatId || 'default'} 
            onBack={() => navigate('amigo-home')}
          />
        );

      case 'amigo-group-chat':
        return (
          <AmigoGroupChatScreen 
            chatId={selectedChatId || 'default'} 
            onBack={() => navigate('amigo-home')}
          />
        );

      case 'amigo-channel-chat':
        return (
          <AmigoChannelChatScreen 
            chatId={selectedChatId || 'default'} 
            onBack={() => navigate('amigo-home')}
          />
        );
        
      case 'amigo-home':
        return (
          <AmigoHomeScreen 
            onLogout={() => navigate('entry')}
            onOpenWallet={() => navigate('wallet')}
            onOpenChat={(id, type) => {
              setSelectedChatId(id);
              if (type === 'group') navigate('amigo-group-chat');
              else if (type === 'channel') navigate('amigo-channel-chat');
              else navigate('amigo-chat');
            }}
          />
        );
        
      case 'ghost-settings':
        return (
          <GhostSettingsScreen 
            onBack={() => navigate('ghost-home')}
          />
        );
        
      case 'wallet':
        return (
            <WalletScreen
                onBack={() => navigate('amigo-home')}
            />
        );
        
      case 'community-guidelines':
        return (
            <CommunityGuidelinesScreen
                onBack={() => navigate('amigo-home')}
            />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-black min-h-screen flex justify-center items-center font-sans antialiased overflow-hidden">
      {/* Mobile container simulation */}
      <div className="w-full max-w-[480px] h-full min-h-screen bg-[#050509] relative shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Phone Number Popup */}
        <PhoneNumberPopup 
          isOpen={showPhonePopup}
          onClose={() => setShowPhonePopup(false)}
          onVerify={handlePhoneVerify}
        />
      </div>
    </div>
  );
}

export default App;