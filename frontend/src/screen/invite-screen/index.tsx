import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, UserPlus, Copy, Check, Ticket, Sparkles } from 'lucide-react-native';
import Context from '../../context';
import useNavigationHook from '../../hooks/use_navigation';
import { GetInviteCode } from '../../apis/auth';

const MAX_INVITES = 3;

const InviteScreen = () => {
  const navigation = useNavigationHook();
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const setToastMsg = ctx?.setToastMsg;

  const isDark = colors.bgColor === '#0A0A14' || (colors.bgColor && String(colors.bgColor).includes('0A0A'));
  const themeColor = colors.accentColor ?? '#9B7BFF';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [canInvite, setCanInvite] = useState(false);
  const [invitesRemaining, setInvitesRemaining] = useState(0);
  const [invitesUsed, setInvitesUsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchInvite = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await GetInviteCode();
      if (res?.status === 200 && res?.data) {
        setInviteCode(res.data.inviteCode ?? null);
        setCanInvite(res.canInvite ?? false);
        setInvitesRemaining(res.data.invitesRemaining ?? 0);
        setInvitesUsed(res.data.invitesUsed ?? 0);
      } else {
        setError(res?.message || 'Could not load invite code');
        setCanInvite(false);
        setInvitesRemaining(0);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Something went wrong';
      setError(msg);
      setCanInvite(false);
      setInvitesRemaining(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
  }, []);

  const copyToClipboard = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      setCopied(true);
      setToastMsg?.('Invite code copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMsg?.('Copy failed');
    }
  };

  const progress = MAX_INVITES ? Math.min(1, (invitesUsed || 0) / MAX_INVITES) : 0;
  const remaining = invitesRemaining ?? 0;

  // Uisample: modal card styles - same padding, radii, colors
  const cardBorderRadius = 32;
  const contentPadding = 32;

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: isDark ? '#0A0A14' : '#F5F5F7' },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 12 : 0, paddingBottom: 40 },
    // Back button row (we use screen so back instead of X)
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Modal-style card container (uisample: rounded-[40px], gradient, shadow)
    modalCard: {
      borderRadius: cardBorderRadius,
      overflow: 'hidden' as const,
      paddingTop: contentPadding,
      paddingBottom: contentPadding,
      paddingHorizontal: contentPadding,
      ...(isDark
        ? {
            backgroundColor: '#141422',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
            elevation: 12,
          }
        : {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.6)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.1,
            shadowRadius: 24,
            elevation: 12,
          }),
    },
    // Decorative blur area (uisample: top right glow)
    decorativeBlur: {
      position: 'absolute' as const,
      top: -80,
      right: -80,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: themeColor,
      opacity: 0.2,
    },
    // Header row: icon + title block
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themeColor,
      shadowColor: themeColor,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },
    titleBlock: {},
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? '#FFFFFF' : '#111827',
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
      letterSpacing: 0.2,
    },
    // Progress bar (uisample: h-[6px], rounded-full)
    progressWrap: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      overflow: 'hidden' as const,
      marginBottom: 0,
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
    },
    // Content area (p-8 pt-4)
    contentArea: { paddingTop: 16 },
    description: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 32,
      paddingHorizontal: 4,
      fontWeight: '500',
      color: isDark ? 'rgba(255,255,255,0.7)' : '#6B7280',
    },
    // Codes list - space-y-4
    codesList: { marginBottom: 32, minHeight: 10 },
    codeCard: {
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      ...(isDark
        ? { backgroundColor: 'rgba(28,28,46,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
        : {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 2,
          }),
    },
    codeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 },
    codeIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    codeText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    singleUseLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
      marginTop: 2,
    },
    copyBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyBtnDefault: {
      backgroundColor: 'rgba(255,255,255,0.05)' as const,
    },
    copyBtnCopied: {
      backgroundColor: 'rgba(16,185,129,0.15)' as const,
    },
    copyBtnLight: {
      backgroundColor: 'rgba(0,0,0,0.04)' as const,
    },
    // Generate button (uisample: full width py-4 rounded-2xl)
    generateBtn: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      ...(remaining > 0
        ? {
            backgroundColor: themeColor,
            shadowColor: themeColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }
        : {
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          }),
    },
    generateBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: remaining > 0 ? '#FFFFFF' : (isDark ? '#5E607E' : '#B0B0B0'),
    },
    cannotInvite: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      marginBottom: 24,
    },
    cannotInviteText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.secondaryText ?? '#8B8CAD',
      textAlign: 'center',
      lineHeight: 22,
    },
    centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <ArrowLeft size={24} color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} />
          </Pressable>
        </View>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={themeColor} />
          <Text style={[styles.subtitle, { marginTop: 16 }]}>Loading invite...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <ArrowLeft size={24} color={isDark ? 'rgba(255,255,255,0.6)' : '#6B7280'} />
          </Pressable>
        </View>

        {/* Modal card - uisample same layout */}
        <View style={styles.modalCard}>
          <View style={styles.decorativeBlur} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <UserPlus size={26} color="#FFFFFF" />
              </View>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>Invite Friends</Text>
                <Text style={styles.subtitle}>
                  {remaining} invite{remaining !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: progress >= 1 ? '#EF4444' : themeColor,
                },
              ]}
            />
          </View>

          <View style={styles.contentArea}>
            <Text style={styles.description}>
              Who's your favorite? 🌟 Send a code to someone who matters most. These invites are single-use, so save them for the real ones!
            </Text>

            {error && !canInvite && !inviteCode && (
              <View style={styles.cannotInvite}>
                <Text style={styles.cannotInviteText}>{error}</Text>
              </View>
            )}

            <View style={styles.codesList}>
              {inviteCode && (
                <View style={styles.codeCard}>
                  <View style={styles.codeCardLeft}>
                    <View style={styles.codeIconWrap}>
                      <Ticket size={18} color={themeColor} style={{ opacity: 0.9 }} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.codeText} numberOfLines={1}>
                        {inviteCode}
                      </Text>
                      <Text style={styles.singleUseLabel}>Single-use invite</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={copyToClipboard}
                    style={[
                      styles.copyBtn,
                      copied ? styles.copyBtnCopied : isDark ? styles.copyBtnDefault : styles.copyBtnLight,
                    ]}
                  >
                    {copied ? (
                      <Check size={18} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <Copy size={18} color={isDark ? 'rgba(255,255,255,0.8)' : '#4B5563'} strokeWidth={2.5} />
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {/* Generate Code button - uisample same */}
            <Pressable
              onPress={() => remaining > 0 && fetchInvite()}
              disabled={remaining === 0}
              style={styles.generateBtn}
            >
              {remaining === 0 ? (
                <Text style={styles.generateBtnText}>Limit Reached</Text>
              ) : (
                <>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>Generate Code</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InviteScreen;
