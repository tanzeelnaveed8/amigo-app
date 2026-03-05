import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react-native';
import RNText from '../text';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';
import Context from '../../../context';

// Uisample AmigoChatScreen header: "Online now", 34px gradient name, 54px avatar + green dot
const HEADER_FALLBACK = {
  bg: 'rgba(5,5,9,0.8)',
  borderBottom: 'rgba(255,255,255,0.08)',
  subtitleColor: '#8B8CAD',
  subtitleSize: 15,
  nameSize: 34,
  nameGradient: ['#9B7BFF', '#7C5FD4'] as const,
  iconColor: '#8B8CAD',
  avatarSize: 54,
  onlineDotSize: 14,
  onlineDotBg: '#10B981',
  onlineDotBorder: 'rgba(5,5,9,1)',
};

interface ChatHeaderProps {
  name?: string;
  image?: string;
  onPressBack?: () => void;
  onPressSetting?: () => void;
  onMsgMoreOption?: () => void;
  onProfilePress?: () => void;
  onCallPress?: () => void;
  onVideoPress?: () => void;
  isSearch?: boolean;
  searchPlaceholder?: string;
  onValue?: (v: string) => void;
  onDeleteMsg?: () => void;
  onShareMsg?: () => void;
  onCopyMsg?: () => void;
  onClose?: () => void;
}

const ChatHeader = (props: ChatHeaderProps) => {
  const {
    name,
    image,
    onPressBack,
    onPressSetting,
    onMsgMoreOption,
    onProfilePress,
    onCallPress,
    onVideoPress,
  } = props;

  const colors = useContext(Context)?.colors ?? {};
  const accent = colors.accentColor ?? HEADER_FALLBACK.nameGradient[0];
  const accentLight = colors.accentLight ?? HEADER_FALLBACK.nameGradient[1];
  const iconColor = colors.secondaryText ?? HEADER_FALLBACK.iconColor;
  const headerBg = colors.navBarBg ?? HEADER_FALLBACK.bg;
  const borderBottom = colors.borderColor ?? HEADER_FALLBACK.borderBottom;
  const isDark = colors.bgColor === '#0A0A14' || (String(colors.bgColor || '').includes('0A0A'));
  const nameColor = accent;
  const subtitleColor = isDark ? HEADER_FALLBACK.subtitleColor : (colors.secondaryText ?? '#6B6B8A');
  const onlineDotBorder = isDark ? HEADER_FALLBACK.onlineDotBorder : (colors.bgColor ?? '#F5F5F7');

  const displayName = name?.trim() || 'Chat';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: headerBg, borderBottomColor: borderBottom }]}>
      {/* Row 1: Back + More – uisample */}
      <View style={styles.row1}>
        <TouchableOpacity
          onPress={onPressBack}
          style={styles.iconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft size={24} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={onMsgMoreOption ?? onPressSetting}
          style={styles.iconBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MoreVertical size={24} color={iconColor} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Row 2: "Online now" + big name (left) | 54px avatar + green dot (right) – uisample */}
      <TouchableOpacity
        style={styles.row2}
        onPress={onProfilePress}
        activeOpacity={0.9}
      >
        <View style={styles.leftBlock}>
          <RNText
            label="Online now"
            fontSize={HEADER_FALLBACK.subtitleSize}
            fontWeight={fontWeight._500}
            color={subtitleColor}
            style={styles.onlineLabel}
          />
          <RNText
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            label={displayName}
            fontSize={HEADER_FALLBACK.nameSize}
            fontWeight={fontWeight._700}
            color={nameColor}
            style={styles.bigName}
          />
        </View>
        <View style={styles.avatarWrap}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={[accent, accentLight]}
              style={[styles.avatar, styles.avatarPlaceholder]}
            >
              <RNText
                label={initials}
                fontSize={fontSize._20}
                fontWeight={fontWeight._700}
                color="#FFFFFF"
              />
            </LinearGradient>
          )}
          <View style={[styles.onlineDot, { backgroundColor: HEADER_FALLBACK.onlineDotBg, borderColor: onlineDotBorder }]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  spacer: {
    flex: 1,
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftBlock: {
    flex: 1,
    minWidth: 0,
  },
  onlineLabel: {
    marginBottom: 4,
  },
  bigName: {
    lineHeight: 38,
  },
  avatarWrap: {
    position: 'relative',
    marginLeft: 12,
  },
  avatar: {
    width: HEADER_FALLBACK.avatarSize,
    height: HEADER_FALLBACK.avatarSize,
    borderRadius: HEADER_FALLBACK.avatarSize / 2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: HEADER_FALLBACK.onlineDotSize,
    height: HEADER_FALLBACK.onlineDotSize,
    borderRadius: HEADER_FALLBACK.onlineDotSize / 2,
    borderWidth: 2.5,
  },
});
