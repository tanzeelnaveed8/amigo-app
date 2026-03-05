import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { Darkcolors, Lightcolors, PurpleThemeColors } from '../constants/color';
import Context from '../context';
import { RootStackParamList } from '../hooks/use_navigation';
import AccountTypeScreen from '../screen/account-creation/account-type';
import AccessRequiredScreen from '../screen/account-creation/auth/access-required';
import EnterVerifyCodeScreen from '../screen/account-creation/auth/enter-verify-code';
import OtpScreen from '../screen/account-creation/auth/otp-screen';
import PremiumAccessPassScreen from '../screen/account-creation/auth/premium-access-pass';
import RegisterScreen from '../screen/account-creation/auth/register-screen';
import RegisterUserScreen from '../screen/account-creation/auth/register-user-screen';
import VerifyOtpScreen from '../screen/account-creation/auth/verify-otp-screen';
import ContactSyncPermission from '../screen/account-creation/contact-sync-permission';
import UserDetailScreen from '../screen/account-creation/user-detail';
import ChanelChatScreen from '../screens/Chanel/ChanelChatScreen';
import DmChatScreen from '../screens/DM/DmChatScreen';
import ChatScreen from '../screens/Group/GroupChatScreen';
import ComingSoonScreen from '../screen/comming-soon';
import AddMemberScreen from '../screen/create-group-channel/add-member';
import ContactListScreen from '../screen/create-group-channel/contact-list';
import CreateNewScreen from '../screen/create-new-screen';
import CreateRoomSignalFormScreen from '../screen/create-room-signal-form';
import AddGroupDetailsScreen from '../screen/create-group-channel/group-details-add';
import GroupTypeScreen from '../screen/create-group-channel/group-type';
import ChanelProfileScreen from '../screen/profile/chanel-profile-screen';
import ChanelProfileSettingScreen from '../screen/profile/chanel-profile-screen/profile-setting';
import DmProfileScreen from '../screen/profile/dm-profile-screen';
import ProfileQRScreen from '../screen/profile/ProfileQRScreen';
import ProfileScreen from '../screen/profile/group-profile-screen';
import RoomMembersScreen from '../screen/profile/group-profile-screen/members-view-all';
import ProfileSettingScreen from '../screen/profile/group-profile-screen/profile-setting';
import EditFlowMemberList from '../screen/profile/member-list';
import InviteScreen from '../screen/invite-screen';
import SettingScreen from '../screen/setting-screen';
import SecurityDataScreen from '../screen/setting-screen/security-data';
import CommunityGuidelinesScreen from '../screen/setting-screen/community-guidelines';
import BlockedUsersScreen from '../screen/setting-screen/blocked-users';
import WalletScreen from '../screen/wallet-screen';
import ShareItScreen from '../screen/shareit-screen';
import AnimatedSplashScreen from '../screens/AnimatedSplashScreen';
import ChooseGhostNameScreen from '../screens/Ghost/ChooseGhostNameScreen';
import ChooseModeScreen from '../screens/Ghost/ChooseModeScreen';
import CreateCrowdScreen from '../screens/Ghost/CreateCrowdScreen';
import CrowdChatScreen from '../screens/Ghost/CrowdChatScreen';
import CrowdCreatedScreen from '../screens/Ghost/CrowdCreatedScreen';
import CrowdMembersScreen from '../screens/Ghost/CrowdMembersScreen';
import GhostModeHomeScreen from '../screens/Ghost/GhostModeHomeScreen';
import GhostModeSplashScreen from '../screens/Ghost/GhostModeSplashScreen';
import GhostSettingsScreen from '../screens/Ghost/GhostSettingsScreen';
import InitializeCameraScreen from '../screens/Ghost/InitializeCameraScreen';
import QRScannerScreen from '../screens/Ghost/QRScannerScreen';
import TermsAgreementScreen from '../screens/Ghost/TermsAgreementScreen';
import ViewQRCodeScreen from '../screens/Ghost/ViewQRCodeScreen';
import WelcomeToGhostMode from '../screens/Ghost/WelcomeToGhostMode';
import socketServics from '../utils/socket';
import { setupAxiosInterceptors } from '../utils/apiInterceptor';
import { NotificationListener, removeNotificationListeners, requestUserPermission } from '../utils/notification';
import MyDrawer from './drawer-navigation';

const Navigation = () => {
  const userData: any = useSelector((state: any) => state.loginData);
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const { setColors, setDarkMode, setThemeMode, colors } = useContext(Context);
  const isDark = colors?.bgColor === '#0A0A14' || (colors?.bgColor && String(colors.bgColor).includes('0A0A'));

  const navigationRef = React.useRef<any>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@themeMode');
        if (savedTheme === 'day' || savedTheme === 'ghost' || savedTheme === 'dark') {
          setThemeMode?.(savedTheme);
        } else {
          const legacyDark = await AsyncStorage.getItem('@darkmode');
          if (legacyDark === 'false') setThemeMode?.('day');
          else setThemeMode?.('dark');
        }
      } catch {
        setThemeMode?.('dark');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const headers = {
      Authorization: userData?.data?.token
        ? `Bearer ${userData?.data?.token}`
        : `Bearer ${userData?.token}`,
      'Content-Type': 'application/json',
    };
    axios.defaults.headers.common = {...headers};
  }, [userData]);

  useEffect(() => {
    setupAxiosInterceptors(() => {
      navigationRef.current?.reset({
        index: 0,
        routes: [{name: 'ChooseModeScreen'}],
      });
    });

    requestUserPermission();
    NotificationListener((data: any) => {
      if (data?.chatType && data?.chatId) {
        // Navigate based on notification data
        console.log('Navigate to chat:', data);
      }
    });

    return () => {
      removeNotificationListeners();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && socketServics.getConnectionStatus()) {
        socketServics.emit('Disconnect');
      }
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors?.bgColor ?? '#0A0A14'}
      />
    <Stack.Navigator
      initialRouteName={'AnimatedSplashScreen' as any}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
      }}>
      <Stack.Screen
        name={'AnimatedSplashScreen' as any}
        component={AnimatedSplashScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen
        name="GhostModeSplashScreen"
        component={GhostModeSplashScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen
        name={'WelcomeToGhostMode' as any}
        component={WelcomeToGhostMode}
      />
      <Stack.Screen
        name={'TermsAgreementScreen' as any}
        component={TermsAgreementScreen}
      />
      <Stack.Screen
        name={'ChooseModeScreen' as any}
        component={ChooseModeScreen}
        options={{animation: 'fade'}}
      />
      <Stack.Screen
        name={'ChooseGhostNameScreen' as any}
        component={ChooseGhostNameScreen}
      />
      <Stack.Screen
        name={'GhostModeHomeScreen' as any}
        component={GhostModeHomeScreen}
      />
      <Stack.Screen
        name={'CreateCrowdScreen' as any}
        component={CreateCrowdScreen}
      />
      <Stack.Screen
        name={'CrowdCreatedScreen' as any}
        component={CrowdCreatedScreen}
      />
      <Stack.Screen
        name={'CrowdChatScreen' as any}
        component={CrowdChatScreen}
      />
      <Stack.Screen
        name={'CrowdMembersScreen' as any}
        component={CrowdMembersScreen}
      />
      <Stack.Screen
        name={'ViewQRCodeScreen' as any}
        component={ViewQRCodeScreen}
      />
      <Stack.Screen
        name={'InitializeCameraScreen' as any}
        component={InitializeCameraScreen}
      />
      <Stack.Screen
        name={'QRScannerScreen' as any}
        component={QRScannerScreen}
      />
      <Stack.Screen
        name={'GhostSettingsScreen' as any}
        component={GhostSettingsScreen}
      />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen
        name="RegisterUserScreen"
        component={RegisterUserScreen}
      />
      <Stack.Screen name="OtpScreen" component={OtpScreen} />
      <Stack.Screen name="AccessRequiredScreen" component={AccessRequiredScreen} />
      <Stack.Screen name="PremiumAccessPassScreen" component={PremiumAccessPassScreen} />
      <Stack.Screen name="EnterVerifyCodeScreen" component={EnterVerifyCodeScreen} />
      <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} />
      <Stack.Screen
        name="ContactSyncPermission"
        component={ContactSyncPermission}
      />
      <Stack.Screen name="MyDrawer" component={MyDrawer} />
      <Stack.Screen name="AccountTypeScreen" component={AccountTypeScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="ContactListScreen" component={ContactListScreen} />
      <Stack.Screen name="CreateNewScreen" component={CreateNewScreen} />
      <Stack.Screen name="CreateRoomSignalFormScreen" component={CreateRoomSignalFormScreen} />
      <Stack.Screen name="GroupTypeScreen" component={GroupTypeScreen} />
      <Stack.Screen name="AddMemberScreen" component={AddMemberScreen} />
      <Stack.Screen
        name="AddGroupDetailsScreen"
        component={AddGroupDetailsScreen}
      />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="SecurityDataScreen" component={SecurityDataScreen} />
      <Stack.Screen name="CommunityGuidelinesScreen" component={CommunityGuidelinesScreen} />
      <Stack.Screen name="BlockedUsersScreen" component={BlockedUsersScreen} />
      <Stack.Screen name="InviteScreen" component={InviteScreen} />
      <Stack.Screen name="WalletScreen" component={WalletScreen} />
      <Stack.Screen name="ShareItScreen" component={ShareItScreen} />
      <Stack.Screen name="ComingSoonScreen" component={ComingSoonScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="RoomMembersScreen" component={RoomMembersScreen} />
      <Stack.Screen
        name="ProfileSettingScreen"
        component={ProfileSettingScreen}
      />
      <Stack.Screen
        name="ChanelProfileScreen"
        component={ChanelProfileScreen}
      />
      <Stack.Screen
        name="ChanelProfileSettingScreen"
        component={ChanelProfileSettingScreen}
      />
      <Stack.Screen name="EditFlowMemberList" component={EditFlowMemberList} />
      <Stack.Screen name="DmChatScreen" component={DmChatScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="ChanelChatScreen" component={ChanelChatScreen} options={{animation: 'slide_from_bottom'}} />
      <Stack.Screen name="DmProfileScreen" component={DmProfileScreen} />
      <Stack.Screen name="ProfileQRScreen" component={ProfileQRScreen} />
    </Stack.Navigator>
    </>
  );
};

export default Navigation;
