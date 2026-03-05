import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Switch,
  Platform,
  SafeAreaView,
  Modal,
  TextInput,
  Linking,
  Alert,
  Animated,
  ActivityIndicator,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Image as FastImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  QrCode,
  Sun,
  Moon,
  Ghost,
  Lock,
  Bell,
  ChevronRight,
  Shield,
  BookOpen,
  Ban,
  Trash2,
  Mail,
  FileText,
  ExternalLink,
  X,
  Camera,
  Share2,
  Edit2,
  Check,
  Download,
} from 'lucide-react-native';
import { getQrPayload } from '../../apis/qr';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import { UpdateProfile, UpdateUserPic } from '../../apis/auth';
import { loginAction } from '../../redux/actions';
import { _isEmpty } from '../../utils/helper';
import * as ImagePicker from '../../utils/imagePickerCompat';
import { openCropper as ImageCropPickerOpenCropper } from '../../utils/imagePickerCompat';

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim()?.[0]?.toUpperCase() || '';
  const last = lastName?.trim()?.[0]?.toUpperCase() || '';
  if (first && last) return `${first}${last}`;
  if (first) return first;
  return 'U';
};

const AVATAR_COLORS = ['#155DFC', '#9B7BFF', '#FF6363', '#10B981', '#F59E0B', '#EC4899'];

const getAvatarColor = (name?: string) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const SettingScreen = () => {
  const navigation = useNavigationHook();
  const dispatch = useDispatch();
  const userData: any = useSelector((state: any) => state.loginData);
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const setLoader = ctx?.setLoader;
  const setToastMsg = ctx?.setToastMsg;
  const setThemeMode = ctx?.setThemeMode;
  const themeMode = ctx?.themeMode ?? 'dark';

  const isDark = colors.bgColor === '#0A0A14' || (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors.accentColor ?? '#9B7BFF';

  // Inline editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingField, setEditingField] = useState<'name' | 'username' | 'bio' | null>(null);
  const [tempValue, setTempValue] = useState('');

  // QR Modal
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Pulsing animation for QR center icon
  const glowAnim = useRef(new Animated.Value(0.35)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowAnim, { toValue: 0.65, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowAnim, { toValue: 0.35, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const openQrModal = () => {
    const userId = userData?.data?._id ?? '';
    if (!userId) return;
    setQrPayload(null);
    setQrError(null);
    setQrLoading(true);
    setQrModalVisible(true);
    getQrPayload('dm', userId)
      .then((res) => {
        if (res.success && res.data) {
          setQrPayload(res.data.payload);
        } else {
          setQrError('Failed to load QR code');
        }
      })
      .catch((e) => setQrError(e?.response?.data?.message || 'Failed to load QR code'))
      .finally(() => setQrLoading(false));
  };

  const handleShareQr = async () => {
    if (!qrPayload) return;
    try {
      await Share.share({
        message: `Add me on Amigo: ${qrPayload}`,
        title: `Add ${displayName} on Amigo`,
      });
    } catch { }
  };

  const displayName = [userData?.data?.firstName, userData?.data?.lastName].filter(Boolean).join(' ') || 'User';
  const initials = getInitials(userData?.data?.firstName, userData?.data?.lastName);
  const avatarColor = getAvatarColor(userData?.data?.firstName);
  const hasProfileImage = !!userData?.data?.userProfile;

  const { mutate } = useMutation(UpdateProfile, {
    onSuccess: (res) => {
      dispatch(loginAction({
        ...userData,
        data: {
          ...userData.data,
          firstName: res.data.firstName,
          userName: res.data.userName,
          bio: res.data.bio,
          isPhoneVisible: res.data.isPhoneVisible,
          isNotificationEnable: res.data.isNotificationEnable,
          userNameChangeCount: res.data.userNameChangeCount,
          isDarkMode: res.data.isDarkMode,
          acountPrivacy: res.data.acountPrivacy,
          isPublic: res.data.isPublic,
        },
      }));
      setLoader?.(false);
      setToastMsg?.('Updated successfully');
    },
    onError: () => {
      setLoader?.(false);
      setToastMsg?.('Update failed');
    },
  });

  const { mutate: updateProfilePic } = useMutation(UpdateUserPic, {
    onSuccess: (res) => {
      dispatch(loginAction({
        ...userData,
        data: { ...userData.data, userProfile: res.data.userProfile },
      }));
      setLoader?.(false);
      setToastMsg?.('Profile picture updated');
    },
    onError: () => {
      setLoader?.(false);
      setToastMsg?.('Update failed');
    },
  });

  const handleThemeChange = (mode: 'day' | 'dark' | 'ghost') => {
    setThemeMode?.(mode);
    AsyncStorage.setItem('@themeMode', mode);
  };

  const handleTogglePrivate = () => {
    setLoader?.(true);
    const isPrivate = userData?.data?.acountPrivacy === 'Private Account' || userData?.data?.isPublic === false;
    mutate({
      acountPrivacy: !isPrivate ? 'Private Account' : 'Public Account',
      isPublic: isPrivate,
    });
  };

  const handleToggleNotification = () => {
    setLoader?.(true);
    mutate({ isNotificationEnable: !userData?.data?.isNotificationEnable });
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      if (prev) setEditingField(null);
      return !prev;
    });
  };

  const startEditing = (field: 'name' | 'username' | 'bio') => {
    if (!isEditMode) return;
    let val = '';
    if (field === 'name') val = displayName;
    else if (field === 'username') val = userData?.data?.userName || '';
    else val = userData?.data?.bio || '';
    setEditingField(field);
    setTempValue(val);
  };

  const saveInlineEdit = () => {
    if (_isEmpty(tempValue.trim())) {
      cancelEdit();
      return;
    }
    if (editingField === 'name') {
      setLoader?.(true);
      mutate({ firstName: tempValue.trim() });
    } else if (editingField === 'username') {
      if ((userData?.data?.userNameChangeCount ?? 0) >= 3) {
        setToastMsg?.("You can't update username more than 3 times.");
        cancelEdit();
        return;
      }
      setLoader?.(true);
      mutate({ userName: tempValue.trim() });
    } else if (editingField === 'bio') {
      setLoader?.(true);
      mutate({ bio: tempValue.trim().slice(0, 80) });
    }
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const openGallery = async () => {
    if (!isEditMode) return;
    try {
      await ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
        if (response.didCancel) return;
        const cropped = await ImageCropPickerOpenCropper({
          width: 300,
          height: 400,
          mediaType: 'photo',
          path: `${response?.assets?.[0]?.uri}`,
          freeStyleCropEnabled: true,
          compressImageQuality: 0.7,
          cropperCircleOverlay: true,
          compressImageMaxWidth: 1024,
          compressImageMaxHeight: 1024,
          avoidEmptySpaceAroundImage: true,
          showCropFrame: true,
        });
        setLoader?.(true);
        const formData = new FormData();
        formData.append('userId', userData?.data?._id);
        formData.append('images', { uri: cropped?.path, type: cropped?.mime, name: 'userImage.jpg' } as any);
        updateProfilePic(formData);
      });
    } catch (_) { }
  };

  const isPrivate = userData?.data?.acountPrivacy === 'Private Account' || userData?.data?.isPublic === false;
  const s = getStyles(isDark, accent, colors);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.headerBtn}>
            <ArrowLeft size={24} color={colors.secondaryText ?? '#8B8CAD'} />
          </Pressable>
          <Pressable onPress={openQrModal} style={s.headerBtn}>
            <QrCode size={24} color={accent} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollBottom} showsVerticalScrollIndicator={false}>

          {/* ── Title ── */}
          <View style={s.titleWrap}>
            <Text style={s.title}>Settings</Text>
            <Text style={s.subtitle}>Manage your account & preferences</Text>
          </View>

          {/* ── Profile Card ── */}
          <View style={s.card}>
            <View style={s.cardGlow} />

            {/* Edit toggle button */}
            <TouchableOpacity
              onPress={toggleEditMode}
              style={[
                s.editToggleBtn,
                isEditMode
                  ? { backgroundColor: accent }
                  : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
              ]}
              activeOpacity={0.85}
            >
              {isEditMode
                ? <Check size={16} color="#FFFFFF" />
                : <Edit2 size={16} color={isDark ? 'rgba(255,255,255,0.5)' : '#6B6B8A'} />
              }
            </TouchableOpacity>

            {/* Avatar */}
            <TouchableOpacity onPress={openGallery} style={s.avatarWrap} activeOpacity={0.9}>
              <View style={s.avatarContainer}>
                {hasProfileImage ? (
                  <FastImage source={{ uri: userData?.data?.userProfile }} style={s.avatar} contentFit="cover" />
                ) : (
                  <View style={[s.avatarPlaceholder, { backgroundColor: avatarColor }]}>
                    <Text style={s.avatarText}>{initials}</Text>
                  </View>
                )}
                {isEditMode && (
                  <View style={s.avatarOverlay}>
                    <Camera size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Name */}
            {editingField === 'name' ? (
              <View style={s.inlineRow}>
                <TextInput
                  autoFocus
                  value={tempValue}
                  onChangeText={setTempValue}
                  style={[s.inlineInput, { fontSize: 20, fontWeight: '700', minWidth: 160 }]}
                  textAlign="center"
                />
                <TouchableOpacity onPress={saveInlineEdit} style={s.inlineIconBtn}>
                  <Check size={18} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelEdit} style={s.inlineIconBtn}>
                  <X size={18} color="#FF453A" />
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable onPress={() => startEditing('name')} style={s.nameRow}>
                <Text style={s.profileName}>{displayName}</Text>
                {isEditMode && <Edit2 size={14} color={accent} style={{ marginLeft: 6 }} />}
              </Pressable>
            )}

            {/* Username */}
            {editingField === 'username' ? (
              <View style={[s.inlineRow, { marginBottom: 8 }]}>
                <Text style={[s.profileUsername, { marginBottom: 0 }]}>@</Text>
                <TextInput
                  autoFocus
                  value={tempValue}
                  onChangeText={setTempValue}
                  style={[s.inlineInput, { minWidth: 120 }]}
                  textAlign="center"
                />
                <TouchableOpacity onPress={saveInlineEdit} style={s.inlineIconBtn}>
                  <Check size={14} color="#10B981" />
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable onPress={() => startEditing('username')} style={s.usernameRow}>
                <Text style={[s.profileUsername, isEditMode && { color: accent }]}>
                  @{userData?.data?.userName || 'username'}
                </Text>
                {isEditMode && <Edit2 size={12} color={accent} style={{ marginLeft: 4 }} />}
              </Pressable>
            )}

            {/* Username change warning */}
            {editingField === 'username' && (
              <View style={s.usernameWarning}>
                <Shield size={12} color="#FF453A" />
                <Text style={s.usernameWarningText}>You can only change your username 2 times.</Text>
              </View>
            )}

            {/* Bio */}
            {editingField === 'bio' ? (
              <View style={s.bioEditWrap}>
                <TextInput
                  autoFocus
                  multiline
                  numberOfLines={3}
                  value={tempValue}
                  onChangeText={(t) => { if (t.length <= 80) setTempValue(t); }}
                  style={s.bioInput}
                  textAlign="center"
                  textAlignVertical="top"
                  maxLength={80}
                />
                <View style={s.bioFooter}>
                  <Text style={s.bioCounter}>{tempValue.length}/80</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={cancelEdit} style={s.bioCancelBtn}>
                      <Text style={[s.bioCancelText, { color: colors.secondaryText ?? '#8B8CAD' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveInlineEdit} style={[s.bioSaveBtn, { backgroundColor: accent }]}>
                      <Text style={s.bioSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ position: 'relative', maxWidth: 280, alignItems: 'center' }}>
                <Pressable
                  onPress={() => startEditing('bio')}
                  style={[
                    s.bioPressable,
                    isEditMode && {
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    },
                  ]}
                >
                  <Text style={s.profileBio} numberOfLines={3}>
                    {userData?.data?.bio || 'Add a bio'}
                  </Text>
                </Pressable>
                {isEditMode && (
                  <View style={[s.bioEditDot, { backgroundColor: accent }]}>
                    <Edit2 size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Appearance ── */}
          <Text style={s.sectionTitle}>APPEARANCE</Text>
          <View style={s.appearanceRow}>
            {([
              { id: 'day' as const, icon: Sun, label: 'Day' },
              { id: 'dark' as const, icon: Moon, label: 'Night' },
              { id: 'ghost' as const, icon: Ghost, label: 'Ghost' },
            ] as const).map(({ id, icon: Icon, label }) => (
              <Pressable
                key={id}
                onPress={() => handleThemeChange(id)}
                style={[s.appearancePill, themeMode === id && s.appearancePillActive]}
              >
                <Icon size={20} color={themeMode === id ? accent : (colors.secondaryText ?? '#5E607E')} />
                <Text style={[s.appearanceLabel, themeMode === id && s.appearanceLabelActive]}>{label}</Text>
                {themeMode === id && (
                  <View style={[s.appearanceBorder, { borderColor: accent }]} />
                )}
              </Pressable>
            ))}
          </View>

          {/* ── Account ── */}
          <Text style={s.sectionTitle}>ACCOUNT</Text>
          <View style={s.accountCard}>
            <View style={s.accountRow}>
              <View style={s.accountLeft}>
                <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                  <Lock size={20} color={accent} />
                </View>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={s.accountTitle}>Private Account</Text>
                  <Text style={s.accountSub} numberOfLines={2}>
                    {isPrivate ? 'Only contacts can send you DMs.' : 'Anyone can send you direct messages.'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={handleTogglePrivate}
                trackColor={{ false: colors.inputBGColor ?? '#1A1A2E', true: accent }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[s.accountRow, s.accountRowLast]}>
              <View style={s.accountLeft}>
                <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                  <Bell size={20} color={accent} />
                </View>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={s.accountTitle}>Notification & Sounds</Text>
                  <Text style={s.accountSub} numberOfLines={2}>Pause all notifications</Text>
                </View>
              </View>
              <Switch
                value={userData?.data?.isNotificationEnable !== false}
                onValueChange={handleToggleNotification}
                trackColor={{ false: colors.inputBGColor ?? '#1A1A2E', true: accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ── MORE ── */}
          <Text style={s.sectionTitle}>MORE</Text>
          <TouchableOpacity style={s.rowButton} onPress={() => navigation.navigate('SecurityDataScreen')} activeOpacity={0.7}>
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <Shield size={20} color={accent} />
              </View>
              <Text style={s.accountTitle}>Security & Data</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>
          <TouchableOpacity style={s.rowButton} onPress={() => navigation.navigate('CommunityGuidelinesScreen')} activeOpacity={0.7}>
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <BookOpen size={20} color={accent} />
              </View>
              <Text style={s.accountTitle}>Community Guidelines</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>
          <TouchableOpacity style={s.rowButton} onPress={() => navigation.navigate('BlockedUsersScreen')} activeOpacity={0.7}>
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <Ban size={20} color={accent} />
              </View>
              <Text style={s.accountTitle}>Blocked Users</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.rowButton}
            onPress={() => Alert.alert('Delete Account', 'This feature is coming soon.', [{ text: 'OK' }])}
            activeOpacity={0.7}
          >
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: 'rgba(255,69,58,0.15)' }]}>
                <Trash2 size={20} color="#FF453A" />
              </View>
              <Text style={[s.accountTitle, { color: '#FF453A' }]}>Delete Account</Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>

          {/* ── Support & Safety ── */}
          <Text style={s.sectionTitle}>SUPPORT & SAFETY</Text>
          <TouchableOpacity style={s.rowButton} onPress={() => Linking.openURL('mailto:support@cryptogram.tech')} activeOpacity={0.7}>
            <View style={[s.accountLeft, { flex: 1 }]}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <Mail size={20} color={accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.accountTitle}>Contact Us</Text>
                <Text style={s.accountSub}>Get help or send feedback to our support team</Text>
                <Text style={[s.accountSub, { fontSize: 12, fontWeight: '500' }]}>support@cryptogram.tech</Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.rowButton}
            onPress={() => Linking.openURL('mailto:support@cryptogram.tech?subject=Safety%20Issue%20Report')}
            activeOpacity={0.7}
          >
            <View style={[s.accountLeft, { flex: 1 }]}>
              <View style={[s.iconCircle, { backgroundColor: 'rgba(255,69,58,0.1)' }]}>
                <Shield size={20} color="#FF453A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.accountTitle}>Report Safety Issue</Text>
                <Text style={s.accountSub}>Report abuse, harassment, or safety concerns</Text>
                <Text style={[s.accountSub, { fontSize: 12, fontWeight: '500' }]}>support@cryptogram.tech</Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>

          {/* ── Legal ── */}
          <Text style={s.sectionTitle}>LEGAL</Text>
          <TouchableOpacity style={s.rowButton} onPress={() => Linking.openURL('https://www.cryptogram.tech/privacy')} activeOpacity={0.7}>
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <FileText size={20} color={accent} />
              </View>
              <View>
                <Text style={s.accountTitle}>Privacy Policy</Text>
                <Text style={s.accountSub}>Learn how we protect your data and privacy</Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>
          <TouchableOpacity style={s.rowButton} onPress={() => Linking.openURL('https://www.cryptogram.tech/terms')} activeOpacity={0.7}>
            <View style={s.accountLeft}>
              <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
                <FileText size={20} color={accent} />
              </View>
              <View>
                <Text style={s.accountTitle}>Terms of Service (EULA)</Text>
                <Text style={s.accountSub}>Read our end user license agreement</Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.secondaryText ?? '#5E607E'} />
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={s.footerText}>Amigo v1.0.0 (2026)</Text>
          </View>

        </ScrollView>
      </View>

      {/* ── QR Modal ── */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
        statusBarTranslucent
      >
        <TouchableOpacity style={s.qrBackdrop} activeOpacity={1} onPress={() => setQrModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.qrModalCard, { backgroundColor: isDark ? '#141422' : '#FFFFFF' }]}>

            {/* Gradient Header */}
            <View style={[s.qrHeader, { backgroundColor: accent }]}>
              <TouchableOpacity
                onPress={() => setQrModalVisible(false)}
                style={s.qrHeaderClose}
                activeOpacity={0.8}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
              {/* Avatar overlap */}
              <View style={s.qrAvatarWrap}>
                <View style={[s.qrAvatarBorder, { backgroundColor: isDark ? '#141422' : '#FFFFFF' }]}>
                  {hasProfileImage ? (
                    <FastImage
                      source={{ uri: userData?.data?.userProfile }}
                      style={s.qrAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[s.qrAvatar, { backgroundColor: avatarColor, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={s.qrAvatarInitials}>{initials}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Content */}
            <View style={s.qrContent}>
              <Text style={[s.qrName, { color: colors.textColor ?? '#FFFFFF' }]}>{displayName}</Text>
              <Text style={[s.qrUsername, { color: colors.secondaryText ?? '#8B8CAD' }]}>
                @{userData?.data?.userName || 'username'}
              </Text>
              <Text style={[s.qrScanLabel, { color: accent }]}>SCAN TO ADD ME ON AMIGO</Text>

              {qrLoading ? (
                <ActivityIndicator size="large" color={accent} style={{ marginVertical: 40 }} />
              ) : qrError ? (
                <Text style={[s.qrUsername, { color: '#FF453A', marginVertical: 30 }]}>{qrError}</Text>
              ) : qrPayload ? (
                <>
                  {/* QR Card */}
                  <View style={s.qrCardOuter}>
                    <View style={[s.qrOuterGlow, { backgroundColor: `${accent}28` }]} />
                    <View style={[s.qrCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                      <View style={[s.qrInnerTint, { backgroundColor: `${accent}1A` }]} />
                      <View style={[s.qrWrap, { backgroundColor: isDark ? '#0A0A14' : '#F8F9FA' }]}>
                        <View style={[s.qrWrapTint, { backgroundColor: `${accent}07` }]} />
                        <QRCode value={qrPayload} size={190} color={accent} backgroundColor="transparent" />
                        <View style={s.qrIconOverlay}>
                          <View>
                            <Animated.View style={[s.qrIconGlow, { backgroundColor: accent, opacity: glowAnim, transform: [{ scale: scaleAnim }] }]} />
                            <View style={[s.qrIconBox, { borderColor: accent, backgroundColor: isDark ? '#0A0A14' : '#FFFFFF' }]}>
                              <Ghost size={22} color={accent} strokeWidth={2.5} />
                            </View>
                          </View>
                        </View>
                      </View>
                      {/* Corner decorations */}
                      <View style={[s.cTL, { borderColor: `${accent}66` }]} />
                      <View style={[s.cTR, { borderColor: `${accent}66` }]} />
                      <View style={[s.cBL, { borderColor: `${accent}66` }]} />
                      <View style={[s.cBR, { borderColor: `${accent}66` }]} />
                    </View>
                  </View>

                  {/* Buttons */}
                  <View style={s.qrBtnRow}>
                    <TouchableOpacity
                      onPress={handleShareQr}
                      style={[s.qrBtn, { backgroundColor: isDark ? '#2A2A3E' : '#F0F0F5' }]}
                      activeOpacity={0.85}
                    >
                      <Share2 size={18} color={isDark ? '#FFFFFF' : '#111111'} />
                      <Text style={[s.qrBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleShareQr}
                      style={[s.qrBtn, { backgroundColor: isDark ? '#2A2A3E' : '#F0F0F5' }]}
                      activeOpacity={0.85}
                    >
                      <Download size={18} color={isDark ? '#FFFFFF' : '#111111'} />
                      <Text style={[s.qrBtnText, { color: isDark ? '#FFFFFF' : '#111111' }]}>Save QR</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingScreen;

const getStyles = (isDark: boolean, accent: string, colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: isDark ? '#0A0A14' : '#F5F5F7' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBottom: { paddingBottom: 40 },

  // ── Title
  titleWrap: { paddingHorizontal: 24, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '700', color: accent },
  subtitle: { fontSize: 15, fontWeight: '500', color: colors.secondaryText ?? '#8B8CAD', marginTop: 4 },

  // ── Profile Card
  card: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    padding: 24,
    backgroundColor: isDark ? '#141422' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: accent,
    opacity: 0.2,
  },
  editToggleBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: { marginBottom: 16 },
  avatarContainer: { position: 'relative', width: 96, height: 96 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: accent },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#FFFFFF' },
  avatarOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.textColor ?? '#FFFFFF', textAlign: 'center' },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  profileUsername: { fontSize: 14, fontWeight: '500', color: colors.secondaryText ?? '#8B8CAD', textAlign: 'center' },
  profileBio: { fontSize: 14, color: colors.secondaryText ?? '#8B8CAD', textAlign: 'center', lineHeight: 20 },

  // ── Inline editing
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  inlineInput: {
    fontSize: 14,
    color: colors.textColor ?? '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: accent,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  inlineIconBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  usernameWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,69,58,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  usernameWarningText: { fontSize: 11, color: '#FF453A', fontWeight: '600' },
  bioEditWrap: { width: '100%', maxWidth: 280 },
  bioInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.textColor ?? '#FFFFFF',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    minHeight: 72,
  },
  bioFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingHorizontal: 2 },
  bioCounter: { fontSize: 10, color: colors.secondaryText ?? '#8B8CAD' },
  bioCancelBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  bioCancelText: { fontSize: 12 },
  bioSaveBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  bioSaveText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  bioPressable: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  bioEditDot: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },

  // ── Appearance
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.secondaryText ?? '#5E607E',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4, paddingHorizontal: 20,
  },
  appearanceRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 24,
    padding: 4, borderRadius: 18,
    backgroundColor: isDark ? '#141422' : '#FFFFFF',
    borderWidth: isDark ? 0 : 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  appearancePill: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    position: 'relative',
  },
  appearancePillActive: { backgroundColor: isDark ? '#2A2A3E' : 'rgba(0,0,0,0.06)' },
  appearanceBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14, borderWidth: 2, opacity: 0.2,
  },
  appearanceLabel: { fontSize: 12, fontWeight: '500', color: colors.secondaryText ?? '#5E607E' },
  appearanceLabelActive: { color: colors.textColor ?? '#FFFFFF' },

  // ── Account
  accountCard: {
    marginHorizontal: 20, marginBottom: 24, borderRadius: 20, overflow: 'hidden',
    backgroundColor: isDark ? '#141422' : '#FFFFFF',
    borderWidth: isDark ? 0 : 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  accountRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
    borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
  },
  accountRowLast: { borderBottomWidth: 0 },
  accountLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, flexShrink: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  accountTitle: { fontSize: 15, fontWeight: '500', color: colors.textColor ?? '#FFFFFF' },
  accountSub: { fontSize: 13, color: colors.secondaryText ?? '#8B8CAD', marginTop: 2 },
  rowButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, marginHorizontal: 20, marginBottom: 12, borderRadius: 20,
    backgroundColor: isDark ? '#141422' : '#FFFFFF',
    borderWidth: isDark ? 0 : 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  footer: { paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: colors.secondaryText ?? '#5E607E' },

  // ── QR Modal
  qrBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  qrModalCard: {
    width: '100%', maxWidth: 340, borderRadius: 32, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35, shadowRadius: 30, elevation: 20,
  },
  qrHeader: { height: 120, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
  qrHeaderClose: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  qrAvatarWrap: { position: 'absolute', bottom: -48, alignSelf: 'center' },
  qrAvatarBorder: {
    width: 100, height: 100, borderRadius: 50, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  qrAvatar: { width: '100%', height: '100%', borderRadius: 46 },
  qrAvatarInitials: { fontSize: 30, fontWeight: '700', color: '#FFFFFF' },
  qrContent: { paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  qrName: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  qrUsername: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  qrScanLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 2,
    textAlign: 'center', textTransform: 'uppercase', marginBottom: 16,
  },
  qrCardOuter: { position: 'relative', marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  qrOuterGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  qrCard: { position: 'relative', borderRadius: 32, borderWidth: 1, padding: 20, overflow: 'hidden' },
  qrInnerTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 32, opacity: 0.1 },
  qrWrap: {
    position: 'relative', borderRadius: 24, padding: 16,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  qrWrapTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 24 },
  qrIconOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  qrIconGlow: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  qrIconBox: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cTL: { position: 'absolute', top: 12, left: 12, width: 32, height: 32, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8, opacity: 0.4 },
  cTR: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8, opacity: 0.4 },
  cBL: { position: 'absolute', bottom: 12, left: 12, width: 32, height: 32, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8, opacity: 0.4 },
  cBR: { position: 'absolute', bottom: 12, right: 12, width: 32, height: 32, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8, opacity: 0.4 },
  qrBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  qrBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  qrBtnText: { fontSize: 14, fontWeight: '600' },
});
