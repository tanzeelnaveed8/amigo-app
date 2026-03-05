import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Lock,
  Copy,
  Check,
  AtSign,
  AlertCircle,
  Ban,
  Ghost,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import RNText from '../../../component/atoms/text';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';
import useNavigationHook from '../../../hooks/use_navigation';
import { Image as FastImage } from 'expo-image';
import { useMutation } from 'react-query';
import { getUploadedImage } from '../../../apis/auth';
import { useSelector } from 'react-redux';
import socketServics from '../../../utils/socket';
import Context from '../../../context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const buildTheme = (colors: any) => ({
  bg: colors.bgColor ?? '#0A0A14',
  card: colors.cardBg ?? '#141422',
  cardBorder: colors.borderColor ?? 'rgba(255,255,255,0.05)',
  text: colors.textColor ?? '#FFFFFF',
  subtext: colors.secondaryText ?? '#8B8CAD',
  accent: colors.accentColor ?? '#9B7BFF',
  accentEnd: colors.accentLight ?? '#7C5FD4',
  online: '#10B981',
  red: colors.red ?? '#FF6363',
  orange: '#FFA500',
});

// Uisample GHOST_POSITIONS – numeric for RN
const GHOST_POSITIONS = [
  { top: SCREEN_HEIGHT * 0.1, left: SCREEN_WIDTH * 0.1, size: 24, opacity: 0.06 },
  { top: SCREEN_HEIGHT * 0.3, right: SCREEN_WIDTH * 0.15, size: 32, opacity: 0.08 },
  { top: SCREEN_HEIGHT * 0.6, left: SCREEN_WIDTH * 0.2, size: 28, opacity: 0.07 },
  { top: SCREEN_HEIGHT * 0.8, right: SCREEN_WIDTH * 0.1, size: 20, opacity: 0.05 },
  { top: SCREEN_HEIGHT * 0.15, left: SCREEN_WIDTH * 0.4, size: 18, opacity: 0.06 },
];

const DmProfileScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>().params;
  const itemData = route?.itemData || {};
  const userData: any = useSelector((state: any) => state.loginData);
  const ctx = useContext(Context);
  const { setToastMsg, colors: ctxColors } = ctx;
  const THEME = useMemo(() => buildTheme(ctxColors ?? {}), [ctxColors]);
  const styles = useMemo(() => getStyles(THEME), [THEME]);

  const [copied, setCopied] = useState(false);
  const [encryptionModal, setEncryptionModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [blockModal, setBlockModal] = useState(false);
  const [sharedMedia, setSharedMedia] = useState<{ url: string; mediaType?: string }[]>([]);

  const { mutate: getMedia } = useMutation(getUploadedImage, {
    onSuccess: (res: any) => {
      const arr = Array.isArray(res?.data) ? res.data : [];
      const items = arr.map((m: any) => ({
        url: m.mediaurl || m.url,
        mediaType: m.mediaType,
      })).filter((m: any) => m.url);
      setSharedMedia(items);
    },
  });

  useEffect(() => {
    const conversationId = itemData?.conversationId;
    if (!conversationId || !userData?.data?._id) return;
    getMedia({
      mediaType: 'image',
      sender: userData.data._id,
      conversationId,
    });
  }, [itemData?.conversationId, userData?.data?._id]);

  const name =
    itemData.name ||
    [itemData.firstName, itemData.lastName].filter(Boolean).join(' ') ||
    'User';
  const username = itemData.userName ? `@${itemData.userName}` : itemData.desc || '@username';
  const avatar = itemData.profileImage || itemData.userProfile || itemData.image;
  const bio = itemData.bio || itemData.desc || '';

  const handleCopyUsername = () => {
    Clipboard.setStringAsync(username.replace('@', '')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMessage = () => {
    navigation.goBack();
  };

  const handleReport = () => {
    setReportModal(false);
    setToastMsg('Report submitted. Thank you for your feedback.');
  };

  const handleBlock = async () => {
    const conversationId = itemData?.conversationId;
    const userToBlockId = itemData?.id ?? itemData?._id;
    if (!conversationId || !userToBlockId) {
      setBlockModal(false);
      setToastMsg('Start a chat with this user first, then you can block them.');
      return;
    }
    const convIdStr = String(conversationId);
    const userIdStr = String(userToBlockId);
    setBlockModal(false);
    socketServics.ensureConnection?.();
    const connected = await socketServics.waitForConnection?.(4000) ?? false;
    if (connected) {
      socketServics.emit('blocked-user', { conversationId: convIdStr, userId: userIdStr });
    } else {
      socketServics.emit('blocked-user', { conversationId: convIdStr, userId: userIdStr });
    }
    navigation.goBack();
  };

  const handleViewAllMedia = () => {
    navigation.navigate('ShareItScreen', { isMedia: true, itemData });
  };

  return (
    <View style={styles.container}>
      {/* Ghost background – uisample same positions */}
      {/* Ghost background – uisample same positions */}
      {/* Ghost background – uisample same positions */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {GHOST_POSITIONS.map((pos, i) => (
          <View
            key={i}
            style={[
              styles.ghostPos,
              {
                top: pos.top,
                left: pos.left,
                right: pos.right,
                opacity: pos.opacity,
              },
            ]}
          >
            <Ghost size={pos.size} color={THEME.accent} />
          </View>
        ))}
      </View>

      <SafeAreaView style={styles.safe} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header – uisample: px-5 pt-4 pb-2, flex items-center justify-between mb-6 */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <ChevronLeft size={24} color={THEME.subtext} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Signature Header – uisample: flex items-start justify-between mt-1 mb-7 */}
        <View style={styles.profileRow}>
          <View style={styles.titleBlock}>
            <RNText label="Profile" fontSize={34} fontWeight={fontWeight._700} color={THEME.text} />
            <RNText
              label={name}
              fontSize={34}
              fontWeight={fontWeight._700}
              color={THEME.accent}
              style={styles.nameLine}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            />
          </View>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarGlowBg} />
            {avatar ? (
              <FastImage source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[THEME.accent, THEME.accentEnd]}
                style={[styles.avatar, styles.avatarPlaceholder]}
              >
                <RNText
                  label={name.trim().slice(0, 2).toUpperCase()}
                  fontSize={fontSize._24}
                  fontWeight={fontWeight._700}
                  color="#FFFFFF"
                />
              </LinearGradient>
            )}
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* Content – uisample: space-y-6 = 24 */}
        <View style={styles.contentWrap}>
          {/* Bio – uisample: pl-4 border-l-[3px] py-1 text-sm italic opacity-90 */}
          {bio ? (
            <View style={styles.bioWrap}>
              <RNText
                label={`"${bio}"`}
                fontSize={fontSize._14}
                fontWeight={fontWeight._400}
                color={THEME.text}
                style={styles.bioText}
              />
            </View>
          ) : null}

          {/* Username pill – uisample: p-4 rounded-[16px], gap-3, icon p-2.5 rounded-lg */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleCopyUsername} style={styles.usernameCard}>
            <View style={styles.usernameLeft}>
              <View style={styles.usernameIconWrap}>
                <AtSign size={18} color={THEME.accent} strokeWidth={2} />
              </View>
              <View>
                <RNText
                  label="USERNAME"
                  fontSize={fontSize._11}
                  fontWeight={fontWeight._600}
                  color={THEME.subtext}
                  style={styles.usernameLabel}
                />
                <RNText label={username} fontSize={fontSize._15} fontWeight={fontWeight._600} color={THEME.text} />
              </View>
            </View>
            {copied ? (
              <Check size={18} color="#22C55E" />
            ) : (
              <Copy size={18} color={THEME.subtext} />
            )}
          </TouchableOpacity>

          {/* Message button – uisample: py-4 rounded-[20px] gap-2.5 */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleMessage}>
            <LinearGradient
              colors={[THEME.accent, THEME.accentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.messageBtn}
            >
              <MessageCircle size={20} color="rgba(255,255,255,0.9)" strokeWidth={2} />
              <RNText label="Message" fontSize={fontSize._16} fontWeight={fontWeight._700} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Shared Media – only when real media exists */}
          {sharedMedia.length > 0 && (
            <View style={styles.mediaSection}>
              <View style={styles.mediaHeader}>
                <RNText label="Shared Media" fontSize={fontSize._15} fontWeight={fontWeight._700} color={THEME.text} />
                <TouchableOpacity onPress={handleViewAllMedia}>
                  <RNText
                    label="VIEW ALL"
                    fontSize={fontSize._11}
                    fontWeight={fontWeight._700}
                    color={THEME.text}
                    style={styles.viewAllText}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaScroll}
              >
                {sharedMedia.map((item, i) => (
                  <TouchableOpacity key={i} onPress={handleViewAllMedia} style={styles.mediaThumb} activeOpacity={0.9}>
                    <FastImage source={{ uri: item.url }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Security & Danger card – uisample AmigoUserProfileScreen */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardRowFirst}
              onPress={() => setEncryptionModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconWrap, styles.cardIconEncryption]}>
                  <Lock size={18} color={THEME.accent} strokeWidth={2} />
                </View>
                <RNText label="Encryption" fontSize={fontSize._15} fontWeight={fontWeight._500} color={THEME.text} />
              </View>
              <ChevronRight size={18} color={THEME.subtext} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardRow, styles.cardRowBorder]}
              onPress={() => setReportModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconWrap, styles.cardIconReport]}>
                  <AlertCircle size={18} color={THEME.orange} strokeWidth={2} />
                </View>
                <RNText label="Report User" fontSize={fontSize._15} fontWeight={fontWeight._500} color={THEME.text} />
              </View>
              <ChevronRight size={18} color={THEME.subtext} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cardRow, styles.cardRowBorder]}
              onPress={() => setBlockModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconWrap, styles.cardIconBlock]}>
                  <Ban size={18} color={THEME.red} strokeWidth={2} />
                </View>
                <RNText label="Block User" fontSize={fontSize._15} fontWeight={fontWeight._500} color={THEME.red} />
              </View>
              <ChevronRight size={18} color={THEME.subtext} strokeWidth={2} />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* Encryption Modal – uisample Dialog */}
      <Modal
        visible={encryptionModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setEncryptionModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEncryptionModal(false)}>
          <Pressable style={[styles.modalBox, styles.modalBoxEncryption]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, styles.modalIconEncryption]}>
              <Lock size={18} color={THEME.accent} strokeWidth={2} />
            </View>
            <RNText
              label="End-to-End Encrypted"
              fontSize={fontSize._16}
              fontWeight={fontWeight._700}
              color={THEME.text}
              style={styles.modalTitle}
            />
            <RNText
              label={`Messages and calls in this chat are secured with end-to-end encryption. Only you and ${name} can read or listen to them, not even Amigo.`}
              fontSize={fontSize._13}
              fontWeight={fontWeight._400}
              color={THEME.subtext}
              style={styles.modalDesc}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setEncryptionModal(false)}
              style={styles.modalBtnWrap}
            >
              <LinearGradient
                colors={[THEME.accent, THEME.accentEnd]}
                style={[styles.modalBtn, styles.modalBtnInner]}
              >
                <RNText label="Got it" fontSize={fontSize._13} fontWeight={fontWeight._700} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report Modal – uisample AlertDialog */}
      <Modal
        visible={reportModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setReportModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setReportModal(false)}>
          <Pressable style={[styles.modalBox, styles.modalBoxAlert]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, styles.modalIconReport]}>
              <AlertCircle size={18} color={THEME.orange} strokeWidth={2} />
            </View>
            <RNText label="Report User?" fontSize={fontSize._16} fontWeight={fontWeight._700} color={THEME.text} style={styles.modalTitle} />
            <RNText
              label="Report this user for spam or inappropriate content. The last 5 messages will be forwarded to our team."
              fontSize={fontSize._13}
              fontWeight={fontWeight._400}
              color={THEME.subtext}
              style={styles.modalDesc}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setReportModal(false)}
                activeOpacity={0.8}
              >
                <RNText label="Cancel" fontSize={fontSize._13} fontWeight={fontWeight._600} color={THEME.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalReportBtn}
                onPress={handleReport}
                activeOpacity={0.8}
              >
                <RNText label="Report" fontSize={fontSize._13} fontWeight={fontWeight._700} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Block Modal – uisample AlertDialog */}
      <Modal
        visible={blockModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setBlockModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setBlockModal(false)}>
          <Pressable style={[styles.modalBox, styles.modalBoxAlert]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, styles.modalIconBlock]}>
              <Ban size={18} color={THEME.red} strokeWidth={2} />
            </View>
            <RNText label={`Block ${name}?`} fontSize={fontSize._16} fontWeight={fontWeight._700} color={THEME.text} style={styles.modalTitle} />
            <RNText
              label="Blocked contacts will no longer be able to send you messages. You can unblock them anytime from Settings."
              fontSize={fontSize._13}
              fontWeight={fontWeight._400}
              color={THEME.subtext}
              style={styles.modalDesc}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBlockModal(false)}
                activeOpacity={0.8}
              >
                <RNText label="Cancel" fontSize={fontSize._13} fontWeight={fontWeight._600} color={THEME.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBlockBtn}
                onPress={handleBlock}
                activeOpacity={0.8}
              >
                <RNText label="Block" fontSize={fontSize._13} fontWeight={fontWeight._700} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default DmProfileScreen;

const getStyles = (THEME: ReturnType<typeof buildTheme>) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  safe: {
    backgroundColor: 'transparent',
  },
  ghostPos: {
    position: 'absolute',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  backBtn: {
    padding: 10,
    marginLeft: -8,
    borderRadius: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 28,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 16,
  },
  nameLine: {
    marginTop: 4,
    lineHeight: 37,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarGlowBg: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -6,
    left: -6,
    backgroundColor: THEME.accent,
    opacity: 0.25,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: `${THEME.accent}40`,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.online,
    borderWidth: 3,
    borderColor: THEME.bg,
  },
  contentWrap: {
    gap: 24,
  },
  bioWrap: {
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: THEME.accent,
    paddingVertical: 4,
  },
  bioText: {
    fontStyle: 'italic',
    opacity: 0.92,
  },
  usernameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  usernameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  usernameIconWrap: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: `${THEME.accent}18`,
  },
  usernameLabel: {
    marginBottom: 2,
    opacity: 0.6,
    letterSpacing: 1,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 10,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  mediaSection: {
    gap: 12,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  viewAllText: {
    opacity: 0.6,
    letterSpacing: 1,
  },
  mediaScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  mediaThumb: {
    width: 96,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: THEME.card,
  },
  mediaThumbPlaceholder: {
    width: 96,
    height: 128,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: THEME.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    overflow: 'hidden',
    minHeight: 168,
  },
  cardRowFirst: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  cardRowBorder: {
    borderTopWidth: 1,
    borderTopColor: THEME.cardBorder,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconWrap: {
    padding: 8,
    borderRadius: 8,
  },
  cardIconEncryption: {
    backgroundColor: `${THEME.accent}18`,
  },
  cardIconReport: {
    backgroundColor: `${THEME.orange}18`,
  },
  cardIconBlock: {
    backgroundColor: `${THEME.red}18`,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  modalBoxEncryption: {
    backgroundColor: THEME.card,
    borderColor: THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalBoxAlert: {
    backgroundColor: THEME.bg,
    borderColor: THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
  },
  modalIconEncryption: {
    backgroundColor: `${THEME.accent}30`,
    borderColor: `${THEME.accent}50`,
  },
  modalIconReport: {
    backgroundColor: `${THEME.orange}30`,
    borderColor: `${THEME.orange}50`,
  },
  modalIconBlock: {
    backgroundColor: `${THEME.red}30`,
    borderColor: `${THEME.red}50`,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  modalDesc: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  modalBtnWrap: {
    alignSelf: 'stretch',
  },
  modalBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnInner: {
    width: '100%',
    minHeight: 36,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  modalReportBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.orange,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  modalBlockBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.red,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
});
