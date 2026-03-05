import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { X, UserPlus, Copy, Check, Sparkles, Ticket } from 'lucide-react-native';
import { GetInviteCode } from '../apis/auth';

const MAX_INVITES = 3;

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  themeColor: string;
  setToastMsg?: (msg: string) => void;
}

interface InviteCodeItem {
  id: string;
  code: string;
}

export const InviteCodeModal = ({
  isOpen,
  onClose,
  isDarkMode,
  themeColor,
  setToastMsg,
}: InviteCodeModalProps) => {
  const [inviteCodes, setInviteCodes] = useState<InviteCodeItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInviteCode = async () => {
    // Backend gives one code only; show "Limit Reached" after first generate
    if (inviteCodes.length >= 1) return;
    setGenerating(true);
    setError(null);
    try {
      const res: any = await GetInviteCode();
      if (res?.status === 200 && res?.data?.inviteCode) {
        setInviteCodes([{ id: Date.now().toString(), code: res.data.inviteCode }]);
      } else {
        setError(res?.message || 'Could not get invite code');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopiedId(id);
      setToastMsg?.('Invite code copied');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setToastMsg?.('Copy failed');
    }
  };

  // Uisample: 3 codes max. We have 1 code from API → after generate show "0 remaining" and Limit Reached
  const remainingInvites = inviteCodes.length > 0 ? 0 : MAX_INVITES;
  const progress = inviteCodes.length > 0 ? 1 : 0;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    card: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 32,
      overflow: 'hidden' as const,
      paddingTop: 32,
      paddingBottom: 32,
      paddingHorizontal: 32,
      ...(isDarkMode
        ? {
            backgroundColor: '#141422',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          }
        : {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
          }),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDarkMode ? 0.5 : 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
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
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : '#111827',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6B7280',
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
    progressWrap: {
      height: 6,
      borderRadius: 3,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      overflow: 'hidden' as const,
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
      width: `${progress * 100}%`,
      backgroundColor: progress >= 1 ? '#EF4444' : themeColor,
    },
    contentArea: { paddingTop: 16 },
    description: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 32,
      fontWeight: '500',
      color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#6B7280',
    },
    codesList: { marginBottom: 32, minHeight: 10 },
    codeCard: {
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      ...(isDarkMode
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
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    },
    codeText: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
    },
    singleUseLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: isDarkMode ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
      marginTop: 2,
    },
    copyBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyBtnDefault: { backgroundColor: 'rgba(255,255,255,0.05)' as const },
    copyBtnCopied: { backgroundColor: 'rgba(16,185,129,0.15)' as const },
    copyBtnLight: { backgroundColor: 'rgba(0,0,0,0.04)' as const },
    generateBtn: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      ...(remainingInvites > 0
        ? {
            backgroundColor: themeColor,
            shadowColor: themeColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }
        : {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          }),
    },
    generateBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: remainingInvites > 0 ? '#FFFFFF' : (isDarkMode ? '#5E607E' : '#B0B0B0'),
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      marginBottom: 16,
      textAlign: 'center',
    },
  });

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.decorativeBlur} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <UserPlus size={26} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Invite Friends</Text>
                <Text style={styles.subtitle}>
                  {remainingInvites} invite{remainingInvites !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={isDarkMode ? 'rgba(255,255,255,0.6)' : '#9CA3AF'} />
            </Pressable>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressBar} />
          </View>

          <View style={styles.contentArea}>
            <Text style={styles.description}>
              Who's your favorite? 🌟 Send a code to someone who matters most. These invites are single-use, so save them for the real ones!
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.codesList}>
              {inviteCodes.map((inv) => (
                <View key={inv.id} style={styles.codeCard}>
                  <View style={styles.codeCardLeft}>
                    <View style={styles.codeIconWrap}>
                      <Ticket size={18} color={themeColor} style={{ opacity: 0.9 }} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.codeText} numberOfLines={1}>{inv.code}</Text>
                      <Text style={styles.singleUseLabel}>Single-use invite</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => copyToClipboard(inv.code, inv.id)}
                    style={[
                      styles.copyBtn,
                      copiedId === inv.id ? styles.copyBtnCopied : isDarkMode ? styles.copyBtnDefault : styles.copyBtnLight,
                    ]}
                  >
                    {copiedId === inv.id ? (
                      <Check size={18} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <Copy size={18} color={isDarkMode ? 'rgba(255,255,255,0.8)' : '#4B5563'} strokeWidth={2.5} />
                    )}
                  </Pressable>
                </View>
              ))}
            </View>

            <Pressable
              onPress={generateInviteCode}
              disabled={remainingInvites === 0 || generating}
              style={styles.generateBtn}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : remainingInvites === 0 ? (
                <Text style={styles.generateBtnText}>Limit Reached</Text>
              ) : (
                <>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>Generate Code</Text>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
