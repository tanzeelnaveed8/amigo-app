import {NavigationProp, useNavigation} from '@react-navigation/native';

export type RootStackParamList = {
  AnimatedSplashScreen: undefined;
  GhostModeSplashScreen: undefined;
  WelcomeToGhostMode: undefined;
  TermsAgreementScreen: {ghostName?: string; avatarBgColor?: string};
  ChooseModeScreen: undefined;
  ChooseGhostNameScreen: undefined;
  GhostModeHomeScreen: {ghostName: string; avatarBgColor: string};
  CreateCrowdScreen: {ghostName?: string; avatarBgColor?: string};
  CrowdCreatedScreen: {
    crowdName: string;
    duration: number;
    qrCodeData?: string;
    ghostName?: string;
    avatarBgColor?: string;
  };
  CrowdChatScreen: {
    crowdName: string;
    ghostName?: string;
    avatarBgColor?: string;
    isCreator?: boolean;
    duration?: number;
    qrCodeData?: string;
  };
  CrowdMembersScreen: {
    crowdName: string;
    ghostName?: string;
    avatarBgColor?: string;
    isCreator?: boolean;
  };
  ViewQRCodeScreen: {
    crowdName: string;
    duration?: number;
    qrCodeData?: string;
    ghostName?: string;
    avatarBgColor?: string;
    isCreator?: boolean;
    expiresAt?: string;
  };
  InitializeCameraScreen: {ghostName?: string; avatarBgColor?: string};
  QRScannerScreen: {ghostName?: string; avatarBgColor?: string};
  GhostSettingsScreen: undefined;
  RegisterScreen: undefined;
  RegisterUserScreen: {
    phone?: string;
    inviteCode?: string;
    inviteData?: any;
    userData?: any;
  };
  OtpScreen: {
    confirmation: any;
    phone: string;
    email: string;
    flowType: string;
  };
  AccessRequiredScreen: {phone?: string} | undefined;
  PremiumAccessPassScreen: undefined;
  EnterVerifyCodeScreen: {phone?: string} | undefined;
  VerifyOtpScreen:
    | {
        inviteCode?: string;
        inviteData?: any;
        phone?: string;
        flowType?: string;
        email?: string;
        userId?: string;
      }
    | undefined;
  UserDetailScreen:
    | {userData?: any; inviteCode?: string; inviteData?: any; phone?: string}
    | undefined;
  AccountTypeScreen: undefined;
  MyDrawer: {isSocketRefetch: any} | undefined;
  ContactSyncPermission: undefined;
  HomeScreen: undefined;
  ChatScreen: {itemData: any} | {conversationId: any} | undefined;
  GroupTypeScreen: {isPrivecy: any} | undefined;
  AddMemberScreen: {admin: any} | {member: any} | undefined;
  AddGroupDetailsScreen:
    | {itemData: any}
    | {isEdit: any}
    | {selectedUser?: any}
    | undefined;
  ContactListScreen: {msgData?: any} | undefined;
  CreateNewScreen: undefined;
  CreateRoomSignalFormScreen: undefined;
  InviteScreen: undefined;
  SettingScreen: undefined;
  ShareItScreen: {isMedia: any} | {itemData: any} | undefined;
  ComingSoonScreen: undefined;
  ProfileScreen: {itemData: any} | undefined;
  ProfileSettingScreen: {profileData: any} | undefined;
  ChanelProfileScreen: {itemData: any} | undefined;
  ChanelProfileSettingScreen: {profileData: any} | undefined;
  EditFlowMemberList: {admin: any} | {member: any} | undefined;
  DmChatScreen: {itemData?: any} | {conversationId?: any} | undefined;
  ChanelChatScreen: {itemData?: any} | {conversationId?: any} | undefined;
  DmProfileScreen: {itemData?: any} | {conversationId?: any} | undefined;
  SecurityDataScreen: undefined;
  CommunityGuidelinesScreen: undefined;
  BlockedUsersScreen: undefined;
  WalletScreen: undefined;
  ProfileQRScreen: { type: 'dm' | 'group' | 'channel'; id: string; name?: string } | undefined;
  RoomMembersScreen: { itemData?: any; title?: string } | undefined;
};

const useNavigationHook = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return navigation;
};
export default useNavigationHook;
