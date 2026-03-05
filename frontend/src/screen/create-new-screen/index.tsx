import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { ArrowLeft, Users, Radio, AlertCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import useNavigationHook from '../../hooks/use_navigation';
import Context from '../../context';
import { getRoomsCreatedToday, getRoomsLeftToday } from '../../utils/roomsCreatedToday';
import { getChanel } from '../../apis/channel';

const CreateNewScreen = () => {
  const navigation = useNavigationHook();
  const userData: any = useSelector((state: any) => state.loginData);
  const userId = userData?.data?._id ?? userData?.data?.id;
  const { colors, setConversationType, setGroupType } = useContext(Context);
  const isDark = colors?.bgColor === '#0A0A14' || (colors?.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors?.accentColor ?? '#9B7BFF';

  const [roomsCreatedToday, setRoomsCreatedToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getRoomsCreatedToday().then(setRoomsCreatedToday);
    }, [])
  );

  const { data: chanelsData } = useQuery(
    ['get-chanel-list', userId],
    () => getChanel(userId),
    { enabled: !!userId }
  );
  const chanelsList = chanelsData?.data ?? (Array.isArray(chanelsData) ? chanelsData : []);
  const hasSignal = (chanelsList?.length ?? 0) > 0;
  const roomsLeft = getRoomsLeftToday(roomsCreatedToday);
  const canCreateRoom = roomsLeft > 0;

  const cardBg = isDark ? '#141422' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#8B8CAD' : '#6B7280';
  const dotColor = accent;

  const handleRoom = () => {
    if (!canCreateRoom) return;
    setConversationType?.('GROUP');
    setGroupType?.('Public Group');
    navigation.navigate('CreateRoomSignalFormScreen');
  };

  const handleSignal = () => {
    if (hasSignal) return;
    setConversationType?.('CHANEL');
    setGroupType?.('Public Chanel');
    navigation.navigate('CreateRoomSignalFormScreen');
  };

  const Card = ({
    onPress,
    Icon,
    title,
    subtitle,
    bullets,
    badge,
    badgeError,
    disabled,
  }: {
    onPress: () => void;
    Icon: typeof Users;
    title: string;
    subtitle: string;
    bullets: string[];
    badge?: string;
    badgeError?: boolean;
    disabled?: boolean;
  }) => (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          opacity: disabled ? 0.5 : pressed ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${accent}20` }]}>
            <Icon size={28} color={accent} strokeWidth={2.5} />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>{title}</Text>
            <Text style={[styles.cardSubtitle, { color: textSecondary }]}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.bullets}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: dotColor }]} />
              <Text style={[styles.bulletText, { color: textSecondary }]}>{b}</Text>
            </View>
          ))}
        </View>
        {badge ? (
          <View style={[styles.badge, badgeError ? styles.badgeError : { backgroundColor: `${accent}18` }]}>
            {badgeError && <AlertCircle size={12} color="#EF4444" style={{ marginRight: 4 }} />}
            <Text style={[styles.badgeText, { color: badgeError ? '#EF4444' : accent }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#0A0A14' : '#FAFAFA' }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <ArrowLeft size={21} color={isDark ? '#FFFFFF' : '#111827'} />
          </Pressable>

          <Text style={[styles.titleLine, { color: textPrimary }]}>Create</Text>
          <Text style={[styles.titleAccent, { color: accent }]}>New</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Choose what you want to create
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card
            onPress={handleRoom}
            Icon={Users}
            title="Room"
            subtitle="Private group conversations"
            bullets={[
              'Add multiple members',
              'Group conversations & media',
              'Full two-way communication',
            ]}
            badge={canCreateRoom ? `${roomsLeft} LEFT TODAY` : 'DAILY LIMIT (3/3)'}
            badgeError={!canCreateRoom}
            disabled={!canCreateRoom}
          />
          <Card
            onPress={handleSignal}
            Icon={Radio}
            title="Signal"
            subtitle="Your broadcast channel"
            bullets={[
              'Broadcast to unlimited subscribers',
              'Share updates & announcements',
              'One-way communication channel',
            ]}
            badge={hasSignal ? 'ALREADY CREATED' : 'ONE PER ACCOUNT'}
            badgeError={hasSignal}
            disabled={hasSignal}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreateNewScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  header: {
    paddingBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    marginBottom: 20,
  },
  titleLine: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 2,
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    marginBottom: 12,
  },
  cardInner: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  bullets: {
    marginBottom: 16,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bulletText: {
    fontSize: 13,
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
