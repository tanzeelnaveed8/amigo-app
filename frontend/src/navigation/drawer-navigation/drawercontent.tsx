import React, { useContext, useRef, useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import { useDispatch, useSelector } from 'react-redux';
import { DrawerActions } from '@react-navigation/native';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import { loginAction } from '../../redux/actions';
import socketServics from '../../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPlus, ScanLine, Wallet, Settings, LogOut, X } from 'lucide-react-native';
import { InviteCodeModal } from '../../components/InviteCodeModal';
import { ScanQRModal } from '../../components/ScanQRModal';

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim()?.[0]?.toUpperCase() || '';
  const last = lastName?.trim()?.[0]?.toUpperCase() || '';
  if (first && last) return `${first}${last}`;
  if (first) return first;
  return 'U';
};

const AVATAR_COLORS = ['#155DFC', '#9B7BFF', '#FF6363', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

const getAvatarColor = (name?: string) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Uisample order: Contacts, Invite (popup), Scan QR (popup), Wallet, Settings
const MENU_ITEMS = [
  { id: '1', name: 'Contacts', screen: 'ContactListScreen' as const, icon: User },
  { id: '2', name: 'Invite', action: 'invite' as const, icon: UserPlus },
  { id: '3', name: 'Scan QR', action: 'scanQr' as const, icon: ScanLine },
  { id: '4', name: 'Wallet', screen: 'WalletScreen' as const, icon: Wallet },
  { id: '5', name: 'Settings', screen: 'SettingScreen' as const, icon: Settings },
];

const DraweContent = (props: any) => {
  const dispatch = useDispatch();
  const rootNavigation = useNavigationHook();
  const { navigation: drawerNavigation } = props;
  const navigation = rootNavigation;
  const userData: any = useSelector((state: any) => state.loginData);
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const setLoader = ctx?.setLoader;
  const setToastMsg = ctx?.setToastMsg;
  const accent = colors.accentColor ?? '#9B7BFF';
  const isDark = colors.bgColor === '#0A0A14' || (colors.bgColor && String(colors.bgColor).includes('0A0A'));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 200, friction: 25, useNativeDriver: true }),
    ]).start();
  }, []);

  const initials = getInitials(userData?.data?.firstName, userData?.data?.lastName);
  const avatarColor = getAvatarColor(userData?.data?.firstName);
  const hasProfileImage = !!userData?.data?.userProfile;
  const displayName = [userData?.data?.firstName, userData?.data?.lastName].filter(Boolean).join(' ') || 'User';
  const userName = userData?.data?.userName ? `@${userData.data.userName}` : '';

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showScanQRModal, setShowScanQRModal] = useState(false);

  const closeDrawer = () => {
    if (drawerNavigation?.dispatch) {
      drawerNavigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  const onLogOut = () => {
    AsyncStorage.removeItem('persist:root').catch(() => {});
    try {
      socketServics.fullCleanup();
    } catch (_) {}
    try {
      (navigation as any).navigate('ChooseModeScreen');
    } catch (_) {}
    setTimeout(() => {
      try {
        dispatch(loginAction({}));
      } catch (_) {}
    }, 500);
  };

  const onMenuItemPress = (item: (typeof MENU_ITEMS)[0]) => {
    if ('action' in item && item.action === 'invite') {
      setShowInviteModal(true);
      return;
    }
    if ('action' in item && item.action === 'scanQr') {
      setShowScanQRModal(true);
      return;
    }
    closeDrawer();
    if ('screen' in item) {
      if (item.screen === 'ProfileQRScreen') {
        navigation.navigate('ProfileQRScreen', {
          type: 'dm',
          id: userData?.data?._id ?? '',
          name: displayName,
        });
      } else {
        (navigation as any).navigate(item.screen);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgColor ?? (isDark ? '#0A0A14' : '#F5F5F7'),
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      overflow: 'hidden',
      maxWidth: 320,
    },
    safeArea: { flex: 1 },
    inner: {
      flex: 1,
      paddingTop: Platform.OS === 'android' ? 20 : 12,
    },
    // Uisample: header block
    headerBlock: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      backgroundColor: colors.cardBg ?? (isDark ? '#141422' : '#FFFFFF'),
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatarCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accent,
      shadowColor: accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    profileTextWrap: { flex: 1, minWidth: 0 },
    profileName: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? (colors.textColor ?? '#FFFFFF') : (colors.textColor ?? '#111111'),
      marginBottom: 2,
    },
    profileUsername: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? (colors.secondaryText ?? '#8B8CAD') : (colors.secondaryText ?? '#6B6B8A'),
    },
    menuSection: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 8,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 2,
    },
    menuIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      backgroundColor: isDark ? 'rgba(155, 123, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)',
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? (colors.textColor ?? '#FFFFFF') : (colors.textColor ?? '#111111'),
    },
    logoutSection: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: isDark ? (colors.cardBg ?? 'rgba(255,255,255,0.05)') : 'rgba(0,0,0,0.06)',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#EF4444',
      marginLeft: 12,
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          {/* Header with close + profile (uisample) */}
          <View style={styles.headerBlock}>
            <Pressable onPress={closeDrawer} style={styles.closeBtn} hitSlop={12}>
              <X size={24} color={isDark ? (colors.secondaryText ?? '#8B8CAD') : (colors.secondaryText ?? '#6B6B8A')} />
            </Pressable>
            <View style={styles.profileRow}>
              {hasProfileImage ? (
                <FastImage
                  source={{ uri: userData.data.userProfile }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
              <View style={styles.profileTextWrap}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.profileUsername} numberOfLines={1}>
                  {userName || '@user'}
                </Text>
              </View>
            </View>
          </View>

          {/* Menu options (uisample style) */}
          <ScrollView style={styles.menuSection} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onMenuItemPress(item)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor: pressed
                        ? (isDark ? (colors.cardBg ?? '#141422') : 'rgba(0,0,0,0.06)')
                        : 'transparent',
                    },
                  ]}
                >
                  <View style={styles.menuIconCircle}>
                    <Icon size={20} color={accent} strokeWidth={2} />
                  </View>
                  <Text style={styles.menuLabel}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Logout at bottom (uisample) */}
          <View style={styles.logoutSection}>
            <Pressable
              onPress={() => {
                closeDrawer();
                onLogOut();
              }}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && { opacity: 0.9 },
              ]}
            >
              <LogOut size={20} color="#EF4444" strokeWidth={2} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>

      <InviteCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        isDarkMode={isDark}
        themeColor={accent}
        setToastMsg={setToastMsg}
      />
      <ScanQRModal
        isOpen={showScanQRModal}
        onClose={() => setShowScanQRModal(false)}
        isDarkMode={isDark}
        themeColor={accent}
        userData={userData?.data ?? null}
        setToastMsg={setToastMsg}
      />
    </View>
  );
};

export default DraweContent;
