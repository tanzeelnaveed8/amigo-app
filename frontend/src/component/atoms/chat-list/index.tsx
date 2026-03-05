import { StyleSheet, Text, View } from 'react-native';
import React, { memo, useContext } from 'react';
import DobleTickIcon from '../../../assets/svg/dobletick.icon';
import Context from '../../../context';
import { Image as FastImage } from 'expo-image';

const AVATAR_COLORS = [
  '#7C3AED', '#2563EB', '#4F46E5', '#DB2777', '#0D9488', '#0891B2',
];

const getColorForName = (name?: string) => {
  if (!name) return AVATAR_COLORS[0];
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return name.trim().slice(0, 2).toUpperCase();
};

interface ChatListItemProps {
  name: string;
  time: string;
  lastmsg: string;
  image: string;
  unseenMsg?: number | string;
  sender?: boolean;
  accentColor?: string;
  isDark?: boolean;
  isOnline?: boolean;
}

const ChatListItem = (props: ChatListItemProps) => {
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const darkMode = ctx?.darkMode;
  const {
    lastmsg,
    name,
    time,
    image,
    unseenMsg,
    sender,
    accentColor = colors.accentColor ?? '#9B7BFF',
    isDark = darkMode,
    isOnline = false,
  } = props;

  const unreadCount = typeof unseenMsg === 'string' ? parseInt(unseenMsg, 10) || 0 : (unseenMsg ?? 0);
  const hasUnread = unreadCount > 0 && !sender;
  const hasValidImage = !!(
    image &&
    typeof image === 'string' &&
    !image.includes('motorcycle-bike-detailed-silhouette')
  );

  const dotBorderColor = isDark ? '#0A0A14' : '#F5F5F7';
  const avatarBg = getColorForName(name);

  return (
    <View style={s.row}>
      {/* Avatar */}
      <View style={s.avatarWrap}>
        {hasValidImage ? (
          <FastImage source={{ uri: image }} style={s.avatar} contentFit="cover" />
        ) : (
          <View style={[s.avatar, s.avatarFallback, { backgroundColor: avatarBg }]}>
            <Text style={s.avatarText}>{getInitials(name)}</Text>
          </View>
        )}
        {isOnline && (
          <View style={[s.onlineDot, { borderColor: dotBorderColor }]} />
        )}
      </View>

      {/* Content */}
      <View style={s.content}>
        {/* Name + Time */}
        <View style={s.topRow}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: hasUnread ? '800' : '700',
              color: colors.textColor ?? (isDark ? '#FFFFFF' : '#111827'),
              flex: 1,
              marginRight: 8,
            }}
          >
            {name ?? 'Amigo'}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              fontWeight: hasUnread ? '700' : '500',
              color: hasUnread ? accentColor : (isDark ? '#5E607E' : '#9CA3AF'),
              flexShrink: 0,
              marginLeft: 4,
            }}
          >
            {time ?? ''}
          </Text>
        </View>

        {/* LastMsg + Badge */}
        <View style={s.bottomRow}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              fontWeight: hasUnread ? '500' : '400',
              color: isDark
                ? (hasUnread ? 'rgba(255,255,255,0.8)' : '#8B8CAD')
                : (hasUnread ? '#374151' : '#6B7280'),
              flex: 1,
              marginRight: 12,
            }}
          >
            {lastmsg ?? 'Hey, there!!'}
          </Text>
          {hasUnread ? (
            <View style={[s.badge, { backgroundColor: accentColor }]}>
              <Text style={s.badgeText}>
                {unreadCount > 99 ? '99+' : String(unreadCount)}
              </Text>
            </View>
          ) : sender ? (
            <DobleTickIcon />
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default memo(ChatListItem);

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
