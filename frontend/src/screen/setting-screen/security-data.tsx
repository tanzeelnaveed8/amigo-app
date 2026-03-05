import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  SafeAreaView,
  Modal,
  TextInput,
  Animated,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  ArrowLeft,
  HardDrive,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Info,
  X,
} from 'lucide-react-native';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import { useSelector } from 'react-redux';

const formatStorage = (mb: number) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
};

const SecurityDataScreen = () => {
  const navigation = useNavigationHook();
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const isDark =
    colors.bgColor === '#0A0A14' ||
    (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors.accentColor ?? '#9B7BFF';
  const userData: any = useSelector((state: any) => state.loginData);

  const [emailVerified, setEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const totalStorage = 5120;
  const storageBarWidth = useRef(new Animated.Value(0)).current;
  const [storageUsed, setStorageUsed] = useState(0);
  const targetStorage = 2458;
  const storagePercentage = (storageUsed / totalStorage) * 100;

  useEffect(() => {
    const steps = 40;
    const inc = targetStorage / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= targetStorage) {
        setStorageUsed(targetStorage);
        clearInterval(t);
      } else {
        setStorageUsed(Math.floor(cur));
      }
    }, 25);
    Animated.timing(storageBarWidth, {
      toValue: (targetStorage / totalStorage) * 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => clearInterval(t);
  }, []);

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    setUserEmail(newEmail.trim());
    setNewEmail('');
    setShowAddEmail(false);
    setTimeout(() => setShowOTP(true), 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError(false);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpBackspace = (index: number) => {
    if (otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
    }
  };

  const handleVerify = () => {
    if (otp.join('').length !== 6) {
      setOtpError(true);
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setEmailVerified(true);
      setTimeout(() => {
        setShowOTP(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError(false);
      }, 1500);
    }, 1500);
  };

  const bg = isDark ? '#0A0A14' : '#F5F5F7';
  const card = isDark ? '#141422' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const textPrimary = isDark ? '#FFFFFF' : '#111111';
  const textSecondary = isDark ? '#8B8CAD' : '#6B6B8A';

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: bg },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 12 : 16,
      paddingBottom: 24,
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', marginBottom: 20 },
    titleLarge: { fontSize: 34, fontWeight: '700', color: textPrimary, lineHeight: 40 },
    titleAccent: { fontSize: 34, fontWeight: '700', color: accent, lineHeight: 40 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
    card: {
      borderRadius: 24,
      padding: 20,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    cardSmall: {
      borderRadius: 20,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: cardBorder,
      overflow: 'hidden',
    },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    iconCircleSm: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    storageBarBg: {
      width: '100%',
      height: 10,
      borderRadius: 5,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
      marginTop: 14,
      overflow: 'hidden',
    },
    storageBarFill: {
      height: 10,
      borderRadius: 5,
      backgroundColor: accent,
    },
    badge: {
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: `${accent}1A`,
    },
    badgeText: { fontSize: 12, fontWeight: '700', color: accent },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: textPrimary, paddingHorizontal: 4, marginBottom: -8 },
    infoBanner: {
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      backgroundColor: isDark ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.06)',
      borderColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
      flexDirection: 'row',
      gap: 12,
    },
    emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    emailBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
    },
    emailBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
    verifiedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: 'rgba(16,185,129,0.15)',
      marginLeft: 8,
    },
    verifiedBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: 24,
    },
    modalBox: {
      borderRadius: 20,
      padding: 24,
      backgroundColor: isDark ? '#0A0A14' : '#FFFFFF',
      borderWidth: 1,
      borderColor: cardBorder,
    },
    modalIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 14,
      borderWidth: 1.5,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: textPrimary, textAlign: 'center', marginBottom: 6 },
    modalDesc: { fontSize: 13, color: textSecondary, textAlign: 'center', lineHeight: 19, marginBottom: 16 },
    input: {
      backgroundColor: isDark ? '#141422' : '#F5F5F7',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: textPrimary,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
    modalCancelBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: card,
      borderWidth: 1,
      borderColor: cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
    },
    modalActionBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: accent,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
    },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
    otpInput: {
      width: 44,
      height: 48,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: cardBorder,
      backgroundColor: isDark ? '#141422' : '#F5F5F7',
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: textPrimary,
    },
    otpInputError: { borderColor: '#FF6363', backgroundColor: 'rgba(255,99,99,0.05)' },
    linkText: { fontSize: 13, fontWeight: '600', color: accent, textAlign: 'center', marginTop: 4 },
  });

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft size={24} color={textSecondary} />
        </Pressable>
        <Text style={s.titleLarge}>Security</Text>
        <Text style={s.titleAccent}>& Data</Text>
      </View>

      {/* Content */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Storage Card */}
        <View style={s.card}>
          <View style={s.rowCenter}>
            <View style={[s.iconCircle, { backgroundColor: `${accent}1A` }]}>
              <HardDrive size={24} color={accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: textPrimary }}>Device Storage</Text>
              <Text style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>
                {formatStorage(storageUsed)} of {formatStorage(totalStorage)} used
              </Text>
            </View>
          </View>
          <View style={s.storageBarBg}>
            <Animated.View
              style={[
                s.storageBarFill,
                {
                  width: storageBarWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>{storagePercentage.toFixed(1)}% Used</Text>
          </View>
        </View>

        {/* Account Security */}
        <Text style={s.sectionTitle}>Account Security</Text>

        {/* Info Banner */}
        <View style={s.infoBanner}>
          <Info size={20} color="#3B82F6" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#93C5FD' : '#1D4ED8', marginBottom: 3 }}>
              Why verify your email?
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: isDark ? 'rgba(147,197,253,0.8)' : 'rgba(37,99,235,0.7)' }}>
              Email verification is necessary to secure your account, enable account recovery, and protect your data.
            </Text>
          </View>
        </View>

        {/* Email Verification Card */}
        <Pressable
          style={s.cardSmall}
          onPress={() => {
            if (emailVerified) setShowManage(true);
            else if (userEmail) setShowOTP(true);
            else setShowAddEmail(true);
          }}
        >
          <View style={s.emailRow}>
            <View style={[s.rowCenter, { flex: 1 }]}>
              <View
                style={[
                  s.iconCircleSm,
                  {
                    backgroundColor: emailVerified
                      ? 'rgba(16,185,129,0.15)'
                      : userEmail
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(255,99,99,0.15)',
                  },
                ]}
              >
                {emailVerified ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : userEmail ? (
                  <AlertCircle size={20} color="#F59E0B" />
                ) : (
                  <Mail size={20} color="#FF6363" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}>Email Verification</Text>
                  {emailVerified && (
                    <View style={s.verifiedBadge}>
                      <Text style={s.verifiedBadgeText}>VERIFIED</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: textSecondary, marginTop: 2 }} numberOfLines={1}>
                  {emailVerified
                    ? userEmail
                    : userEmail
                      ? `${userEmail} - Not verified`
                      : 'No email added yet'}
                </Text>
              </View>
            </View>
            <View style={[s.emailBtn, { backgroundColor: emailVerified ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)') : accent }]}>
              <Text style={[s.emailBtnText, emailVerified && { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' }]}>
                {emailVerified ? 'Manage' : userEmail ? 'Verify' : 'Add Email'}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* E2E Info Card */}
        <View style={[s.card, { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 20 }]}>
          <View style={[s.iconCircleSm, { marginRight: 0 }]}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${accent}1A`, alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color={accent} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: textPrimary, marginBottom: 6 }}>
              End-to-End Encryption
            </Text>
            <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 19 }}>
              All your messages are protected with end-to-end encryption. Only you and your contacts can read them.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Email Modal */}
      <Modal visible={showAddEmail} transparent animationType="fade" onRequestClose={() => setShowAddEmail(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowAddEmail(false)}>
          <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={[s.modalIconWrap, { backgroundColor: `${accent}20`, borderColor: `${accent}30` }]}>
              <Mail size={24} color={accent} />
            </View>
            <Text style={s.modalTitle}>Add Email Address</Text>
            <Text style={s.modalDesc}>Enter your email to secure your account and enable recovery.</Text>
            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="your.email@example.com"
              placeholderTextColor={textSecondary}
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={s.modalActions}>
              <Pressable style={s.modalCancelBtn} onPress={() => setShowAddEmail(false)}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[s.modalActionBtn, !newEmail.trim() && { opacity: 0.5 }]} onPress={handleAddEmail}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Add Email</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* OTP Modal */}
      <Modal visible={showOTP} transparent animationType="fade" onRequestClose={() => { if (!verifying) { setShowOTP(false); setOtp(['','','','','','']); setOtpError(false); } }}>
        <Pressable style={s.modalOverlay} onPress={() => { if (!verifying && !emailVerified) { setShowOTP(false); setOtp(['','','','','','']); setOtpError(false); } }}>
          <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                s.modalIconWrap,
                {
                  backgroundColor: emailVerified ? 'rgba(16,185,129,0.2)' : `${accent}20`,
                  borderColor: emailVerified ? 'rgba(16,185,129,0.3)' : `${accent}30`,
                },
              ]}
            >
              {emailVerified ? (
                <CheckCircle2 size={24} color="#10B981" />
              ) : (
                <Mail size={24} color={accent} />
              )}
            </View>
            <Text style={s.modalTitle}>
              {emailVerified ? 'Email Verified!' : verifying ? 'Verifying...' : 'Verify Your Email'}
            </Text>
            <Text style={s.modalDesc}>
              {emailVerified
                ? `Your email ${userEmail} has been verified.`
                : verifying
                  ? 'Verifying your email...'
                  : `We've sent a code to ${userEmail}. Enter it below.`}
            </Text>

            {!verifying && !emailVerified && (
              <>
                <Pressable
                  onPress={() => {
                    setShowOTP(false);
                    setOtp(['','','','','','']);
                    setOtpError(false);
                    setTimeout(() => { setNewEmail(userEmail); setUserEmail(''); setShowAddEmail(true); }, 300);
                  }}
                >
                  <Text style={[s.linkText, { marginBottom: 14 }]}>Wrong email? Change it</Text>
                </Pressable>
                <View style={s.otpRow}>
                  {otp.map((d, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => { otpRefs.current[i] = r; }}
                      value={d}
                      onChangeText={(v) => handleOtpChange(i, v)}
                      onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Backspace') handleOtpBackspace(i); }}
                      maxLength={1}
                      keyboardType="number-pad"
                      style={[s.otpInput, otpError && s.otpInputError]}
                    />
                  ))}
                </View>
                {otpError && (
                  <Text style={{ color: '#FF6363', fontSize: 13, fontWeight: '500', textAlign: 'center', marginBottom: 8 }}>
                    Incorrect code. Please try again.
                  </Text>
                )}
                <Pressable onPress={() => { setOtp(['','','','','','']); setOtpError(false); otpRefs.current[0]?.focus(); }}>
                  <Text style={s.linkText}>Resend Code</Text>
                </Pressable>
                <View style={s.modalActions}>
                  <Pressable style={s.modalCancelBtn} onPress={() => { setShowOTP(false); setOtp(['','','','','','']); setOtpError(false); }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[s.modalActionBtn, otp.join('').length !== 6 && { opacity: 0.5 }]} onPress={handleVerify}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Verify</Text>
                  </Pressable>
                </View>
              </>
            )}

            {verifying && (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <ActivityIndicator size="small" color={accent} />
              </View>
            )}

            {emailVerified && !verifying && (
              <Pressable
                style={[s.modalActionBtn, { marginTop: 8 }]}
                onPress={() => { setShowOTP(false); setOtp(['','','','','','']); setOtpError(false); }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Done</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Manage Email Modal */}
      <Modal visible={showManage} transparent animationType="fade" onRequestClose={() => setShowManage(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowManage(false)}>
          <Pressable style={s.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={[s.modalIconWrap, { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: 'rgba(16,185,129,0.3)' }]}>
              <CheckCircle2 size={24} color="#10B981" />
            </View>
            <Text style={s.modalTitle}>Manage Email</Text>
            <Text style={s.modalDesc}>
              Your email <Text style={{ fontWeight: '700', color: accent }}>{userEmail}</Text> is verified and secure.
            </Text>
            <View style={[s.card, { padding: 16, gap: 10 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${accent}1A`, alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: textPrimary, marginBottom: 4 }}>
                    Need to update your email?
                  </Text>
                  <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 18, marginBottom: 8 }}>
                    For security, email changes must be verified through our support team.
                  </Text>
                  <Pressable onPress={() => Linking.openURL(`mailto:support@cryptogram.tech?subject=Email%20Change%20Request&body=Current%20verified%20email:%20${userEmail}`)}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: accent }}>support@cryptogram.tech</Text>
                  </Pressable>
                  <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>
                    Please send from <Text style={{ fontWeight: '600' }}>{userEmail}</Text> for verification.
                  </Text>
                </View>
              </View>
            </View>
            <Pressable style={[s.modalCancelBtn, { marginTop: 16 }]} onPress={() => setShowManage(false)}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SecurityDataScreen;
