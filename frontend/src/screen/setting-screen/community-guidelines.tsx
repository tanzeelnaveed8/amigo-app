import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  SafeAreaView,
  Linking,
  Animated,
} from 'react-native';
import {
  ArrowLeft,
  Shield,
  Heart,
  Users,
  AlertTriangle,
  Ban,
  Eye,
  ExternalLink,
} from 'lucide-react-native';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import useTopEnterAnim from '../../hooks/useTopEnterAnim';

const GUIDELINES = [
  {
    icon: Heart,
    title: 'Be Respectful',
    description:
      'Treat everyone with kindness and respect. No harassment, bullying, or hate speech of any kind.',
    color: '#4ADE80',
  },
  {
    icon: Shield,
    title: 'Stay Safe',
    description:
      'Never share personal information like phone numbers, addresses, or financial details in crowds.',
    color: '#3B82F6',
  },
  {
    icon: Ban,
    title: 'No Spam or Scams',
    description:
      "Don't send unwanted promotional content, scams, or fraudulent schemes. Respect others' time.",
    color: '#FF6363',
  },
  {
    icon: Users,
    title: 'Keep it Anonymous',
    description:
      "Ghost Mode is designed for anonymity. Don't pressure others to reveal their identity.",
    color: '#9B7BFF',
  },
  {
    icon: AlertTriangle,
    title: 'Report Issues',
    description:
      'If you see something inappropriate, report it. Help us keep the community safe for everyone.',
    color: '#FBBF24',
  },
  {
    icon: Eye,
    title: 'Child Safety',
    description:
      'Ghost Mode is for users 13+. Any content exploiting minors will result in immediate action.',
    color: '#FF6363',
  },
];

const VIOLATIONS = [
  'Warning from admins',
  'Temporary mute (1-24 hours)',
  'Permanent ban from crowd',
  'Account suspension (for severe violations)',
];

const CommunityGuidelinesScreen = () => {
  const navigation = useNavigationHook();
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const isDark =
    colors.bgColor === '#0A0A14' ||
    (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors.accentColor ?? '#9B7BFF';

  const bg = isDark ? '#0A0A14' : '#F5F5F7';
  const card = isDark ? '#141422' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#FFFFFF' : '#111111';
  const textSecondary = isDark ? '#C5C6E3' : '#6B6B8A';
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Animated.View style={[{ flex: 1 }, enterStyle]}>
        {/* Header */}
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <ArrowLeft size={24} color={isDark ? '#8B8CAD' : '#6B6B8A'} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Hero */}
        <View style={s.heroWrap}>
          <View
            style={[
              s.heroIcon,
              {
                backgroundColor: card,
                borderColor: 'rgba(155,123,255,0.3)',
              },
            ]}
          >
            <Shield size={32} color="#9B7BFF" />
          </View>
          <Text style={[s.heroTitle, { color: textPrimary }]}>
            Community Guidelines
          </Text>
          <Text style={[s.heroDesc, { color: textSecondary }]}>
            Amigo is built on trust and respect. Follow these guidelines to keep
            our community safe and welcoming.
          </Text>
        </View>

        {/* Guidelines cards */}
        <View style={s.cardsWrap}>
          {GUIDELINES.map((g, i) => {
            const Icon = g.icon;
            return (
              <View
                key={i}
                style={[
                  s.guideCard,
                  { backgroundColor: card, borderColor: cardBorder },
                ]}
              >
                <View
                  style={[
                    s.guideIcon,
                    {
                      backgroundColor: `${g.color}15`,
                      borderColor: `${g.color}40`,
                    },
                  ]}
                >
                  <Icon size={22} color={g.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[s.guideTitle, { color: textPrimary }]}
                  >
                    {g.title}
                  </Text>
                  <Text style={[s.guideDesc, { color: textSecondary }]}>
                    {g.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Enforcement */}
        <View style={s.enforcementCard}>
          <AlertTriangle
            size={20}
            color="#FF6363"
            style={{ marginTop: 2, flexShrink: 0 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={[s.enforcementTitle, { color: textPrimary }]}>
              Enforcement
            </Text>
            <Text style={[s.enforcementSub, { color: textSecondary }]}>
              Violations may result in:
            </Text>
            {VIOLATIONS.map((v, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>•</Text>
                <Text style={[s.bulletText, { color: textSecondary }]}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Full policy link */}
        <Pressable
          onPress={() =>
            Linking.openURL('https://example.com/community-guidelines')
          }
          style={({ pressed }) => [
            s.linkCard,
            {
              backgroundColor: card,
              borderColor: isDark
                ? 'rgba(155,123,255,0.2)'
                : 'rgba(0,0,0,0.06)',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <ExternalLink size={18} color={accent} />
          <Text style={[s.linkText, { color: textPrimary }]}>
            View Full Community Guidelines
          </Text>
        </Pressable>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CommunityGuidelinesScreen;

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#9B7BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  cardsWrap: {
    gap: 12,
    marginBottom: 20,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  enforcementCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'rgba(255,99,99,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,99,99,0.25)',
    marginBottom: 20,
  },
  enforcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  enforcementSub: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  bullet: {
    color: '#FF6363',
    fontSize: 14,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 13,
    flex: 1,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
