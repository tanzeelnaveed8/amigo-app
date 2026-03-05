import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { Image as FastImage } from 'expo-image';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import socketServics from '../../utils/socket';
import { useSelector } from 'react-redux';

const AVATAR_COLORS = ['#7C3AED', '#2563EB', '#4F46E5', '#DB2777', '#0D9488', '#0891B2'];

const getColor = (name?: string) => {
  if (!name) return AVATAR_COLORS[0];
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?';
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
};

const BlockedUsersScreen = () => {
  const navigation = useNavigationHook();
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const isDark =
    colors.bgColor === '#0A0A14' ||
    (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors.accentColor ?? '#9B7BFF';
  const userData: any = useSelector((state: any) => state.loginData);

  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    socketServics.on('blocked-users-list', (data: any) => {
      if (Array.isArray(data)) setBlockedUsers(data);
    });
    socketServics.emit('get-blocked-users', { userId: userData?.data?._id });
    return () => {
      socketServics.removeListener('blocked-users-list');
    };
  }, []);

  const handleUnblock = useCallback(
    (userId: string) => {
      socketServics.emit('unblock-user', {
        userId: userData?.data?._id,
        blockedUserId: userId,
      });
      setBlockedUsers((prev) => prev.filter((u) => (u._id ?? u.id) !== userId));
    },
    [userData?.data?._id],
  );

  const bg = isDark ? '#0A0A14' : '#F5F5F7';
  const card = isDark ? '#141422' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#FFFFFF' : '#111111';
  const textSecondary = isDark ? '#8B8CAD' : '#6B6B8A';

  const renderItem = ({ item }: { item: any }) => {
    const name = item.name || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'User';
    const id = item._id ?? item.id;
    const avatar = item.userProfile || item.profileImage || item.image;
    const blockedDate = item.blockedAt
      ? new Date(item.blockedAt).toLocaleDateString()
      : '';

    return (
      <View style={[s.userCard, { backgroundColor: card, borderColor: cardBorder }]}>
        <View style={s.userLeft}>
          {avatar ? (
            <FastImage source={{ uri: avatar }} style={s.avatar} contentFit="cover" />
          ) : (
            <View style={[s.avatar, s.avatarFallback, { backgroundColor: getColor(name) }]}>
              <Text style={s.avatarText}>{getInitials(name)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[s.userName, { color: textPrimary }]} numberOfLines={1}>
              {name}
            </Text>
            {blockedDate ? (
              <Text style={[s.userMeta, { color: textSecondary }]}>
                Blocked on {blockedDate}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={() => handleUnblock(id)}
          style={({ pressed }) => [
            s.unblockBtn,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[s.unblockText, { color: textPrimary }]}>Unblock</Text>
        </Pressable>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={s.emptyWrap}>
      <View
        style={[
          s.emptyIcon,
          { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F5' },
        ]}
      >
        <Shield size={32} color={isDark ? '#5E607E' : '#9CA3AF'} />
      </View>
      <Text style={[s.emptyTitle, { color: textPrimary }]}>No blocked users</Text>
      <Text style={[s.emptyDesc, { color: textSecondary }]}>
        You haven't blocked anyone yet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft size={24} color={textSecondary} />
        </Pressable>
        <Text style={[s.headerTitle, { color: textPrimary }]}>Blocked Users</Text>
      </View>

      {/* Description */}
      <View style={s.descWrap}>
        <Text style={[s.descText, { color: textSecondary }]}>
          Blocked users cannot send you messages or see your profile updates.
          They will not be notified when you block them.
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={blockedUsers}
        keyExtractor={(item, i) => `${item._id ?? item.id ?? i}`}
        renderItem={renderItem}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default BlockedUsersScreen;

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  descWrap: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  descText: {
    fontSize: 14,
    lineHeight: 21,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  unblockText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 200,
  },
});
