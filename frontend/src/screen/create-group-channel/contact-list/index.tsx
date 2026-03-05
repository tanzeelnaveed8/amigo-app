import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import {
  ArrowLeft,
  Search,
  X,
  MessageCircle,
  User,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import { useQuery, useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { PermissionsAndroid } from 'react-native';
import Context from '../../../context';
import useNavigationHook from '../../../hooks/use_navigation';
import { ReCheckContactList, getAllContact } from '../../../apis/contacts';
import Contacts from '../../../utils/contactsCompat';
import { FAKE_CONTACTS_0320 } from '../../../constants/fakeContacts';

export interface ContactItem {
  id: string;
  name: string;
  desc?: string;
  profileImage?: string;
  blockUser?: any;
  conversationId?: string;
  displayName?: string;
  userName?: string;
}

const getInitials = (name?: string, desc?: string) => {
  if (desc?.trim()) return desc.trim().slice(0, 2).toUpperCase();
  if (name?.trim()) return name.trim().slice(0, 2).toUpperCase();
  return '?';
};

const AVATAR_COLORS = ['#155DFC', '#9B7BFF', '#FF6363', '#10B981', '#F59E0B', '#EC4899'];

const getAvatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const ContactListScreen = () => {
  const navigation = useNavigationHook();
  const { setLoader, setConatctList, colors } = useContext(Context);
  const userData: any = useSelector((state: any) => state.loginData);
  const isDark = colors?.bgColor === '#0A0A14' || (colors?.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors?.accentColor ?? '#9B7BFF';

  const token = userData?.data?.token ?? userData?.token;

  const [data, setData] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { isFetching, refetch } = useQuery(
    ['get-allcontact', token],
    () => getAllContact(token),
    {
      enabled: !!token,
      onSuccess: (response: any) => {
        setFetchError(null);
        const arr: ContactItem[] = [];
        const details = response?.data?.contactDetails || [];
        for (let i = 0; i < details.length; i++) {
          const d = details[i];
          const displayName = d.firstName || d.userName || 'User';
          arr.push({
            id: d._id,
            name: d.userName,
            desc: d.firstName,
            profileImage: d.userProfile,
            blockUser: d.blockUser,
            conversationId: d.conversationId,
            displayName,
            userName: d.userName,
          });
        }
        const filter = arr.filter((r) => r.id !== userData?.data?._id);
        setData([...FAKE_CONTACTS_0320, ...filter]);
        setConatctList?.([...FAKE_CONTACTS_0320, ...filter]);
        setLoader?.(false);
      },
      onError: (err: any) => {
        setLoader?.(false);
        setFetchError(err?.message || 'Could not load contacts. Please try again.');
      },
    }
  );

  const { mutate } = useMutation(ReCheckContactList, {
    onSuccess: () => {
      refetch();
      setLoader?.(false);
    },
    onError: () => setLoader?.(false),
  });

  const getContact = async () => {
    try {
      const contactList = await Contacts.getAll();
      const sorted = contactList.sort((a: any, b: any) => {
        const aName = (a.displayName || a.givenName || '').toLowerCase();
        const bName = (b.displayName || b.givenName || '').toLowerCase();
        return aName.localeCompare(bName);
      });
      mutate({ contact: sorted });
    } catch (_) {}
  };

  const requestContactsPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) getContact();
      } else {
        getContact();
      }
    } catch (_) {}
  };

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (c) =>
        (c.displayName || c.name || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const grouped = useMemo(() => {
    const sorted = [...filteredContacts].sort((a, b) =>
      (a.displayName || a.name || '').localeCompare(b.displayName || b.name || '')
    );
    const groups: { letter: string; contacts: ContactItem[] }[] = [];
    let current = '';
    sorted.forEach((c) => {
      const letter = (c.displayName || c.name || '?')[0].toUpperCase();
      if (letter !== current) {
        current = letter;
        groups.push({ letter, contacts: [] });
      }
      groups[groups.length - 1].contacts.push(c);
    });
    return groups;
  }, [filteredContacts]);

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: isDark ? '#0A0A14' : '#FAFAFA' },
    container: { flex: 1 },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 16 : 20,
      paddingBottom: 16,
      backgroundColor: isDark ? '#0A0A14' : '#FAFAFA',
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
    titleMain: { fontSize: 32, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', marginBottom: 4 },
    titleAccent: { fontSize: 32, fontWeight: '700', color: accent },
    subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
    subtitle: { fontSize: 15, color: isDark ? '#8B8CAD' : '#6B7280' },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: `${accent}18`,
    },
    badgeText: { fontSize: 10, fontWeight: '700', color: accent },
    searchWrap: {
      marginTop: 20,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#141422' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
      paddingHorizontal: 14,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 10,
      fontSize: 15,
      color: isDark ? '#FFFFFF' : '#111827',
      paddingRight: 40,
    },
    searchClear: { position: 'absolute', right: 12, padding: 4 },
    scroll: { flex: 1, paddingBottom: 24 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 8,
      gap: 10,
      backgroundColor: isDark ? 'rgba(10,10,20,0.9)' : 'rgba(250,250,250,0.9)',
    },
    sectionLetter: { fontSize: 13, fontWeight: '700', color: accent },
    sectionLine: { flex: 1, height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)' },
    sectionCount: { fontSize: 10, fontWeight: '500', color: isDark ? '#3A3A50' : '#9CA3AF' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 12,
      borderRadius: 16,
      gap: 14,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    rowBody: { flex: 1, minWidth: 0 },
    rowName: { fontSize: 15, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: 2 },
    rowMeta: { fontSize: 12, color: isDark ? '#5E607E' : '#6B7280' },
    emptyWrap: { paddingVertical: 48, alignItems: 'center', paddingHorizontal: 24 },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#13132A' : '#FFFFFF',
      marginBottom: 16,
    },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', marginBottom: 4 },
    emptySub: { fontSize: 13, color: isDark ? '#5E607E' : '#6B7280', textAlign: 'center' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 40,
      backgroundColor: isDark ? '#141422' : '#FFFFFF',
    },
    handle: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
      alignSelf: 'center',
      marginBottom: 24,
    },
    sheetAvatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignSelf: 'center',
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    sheetName: { fontSize: 22, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827', textAlign: 'center', marginBottom: 4 },
    sheetUsername: { fontSize: 15, color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280', textAlign: 'center', marginBottom: 24 },
    sheetCard: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: isDark ? 'rgba(28,28,46,0.5)' : '#F9FAFB',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 16,
    },
    sheetRowIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${accent}20`,
    },
    sheetRowBody: { flex: 1 },
    sheetRowTitle: { fontSize: 16, fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
    sheetRowSub: { fontSize: 12, color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280', marginTop: 2 },
    sheetDivider: { height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' },
    cancelBtn: {
      paddingVertical: 16,
      borderRadius: 20,
      backgroundColor: isDark ? '#2D2D3F' : '#E5E5EA',
      alignItems: 'center',
      marginTop: 8,
    },
    cancelText: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : '#111827' },
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={isDark ? '#FFFFFF' : '#111827'} />
        </Pressable>
        <Text style={styles.titleMain}>Your</Text>
        <Text style={styles.titleAccent}>Contacts</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>All in one place on Amigo</Text>
          <View style={styles.badge}>
            <Users size={10} color={accent} />
            <Text style={styles.badgeText}>{data.length}</Text>
          </View>
        </View>
        <View style={styles.searchWrap}>
          <Search size={17} color={isDark ? '#5E607E' : '#9CA3AF'} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={isDark ? '#5E607E' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable style={styles.searchClear} onPress={() => setSearchQuery('')}>
              <X size={14} color={isDark ? 'rgba(255,255,255,0.7)' : '#6B7280'} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!token ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <User size={24} color={isDark ? '#4A4A6A' : '#D0D0D0'} />
            </View>
            <Text style={styles.emptyTitle}>Login required</Text>
            <Text style={styles.emptySub}>Please log in to see your contacts.</Text>
          </View>
        ) : isFetching ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={accent} />
          </View>
        ) : fetchError ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Search size={24} color={isDark ? '#4A4A6A' : '#D0D0D0'} />
            </View>
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptySub}>{fetchError}</Text>
            <Pressable
              style={[styles.cancelBtn, { marginTop: 16 }]}
              onPress={() => { setFetchError(null); refetch(); }}
            >
              <Text style={styles.cancelText}>Retry</Text>
            </Pressable>
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Search size={24} color={isDark ? '#4A4A6A' : '#D0D0D0'} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? `No contacts match "${searchQuery}"` : 'No contacts yet'}
            </Text>
            {!searchQuery && (
              <Text style={[styles.emptySub, { marginTop: 8 }]}>
                If empty, sync your phone contacts to find friends on Amigo.
              </Text>
            )}
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.letter}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLetter}>{group.letter}</Text>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionCount}>{group.contacts.length}</Text>
              </View>
              {group.contacts.map((contact) => (
                <Pressable
                  key={contact.id}
                  style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => setSelectedContact(contact)}
                >
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(contact.id) }]}>
                    {contact.profileImage ? (
                      <FastImage source={{ uri: contact.profileImage }} style={{ width: 48, height: 48 }} contentFit="cover" />
                    ) : (
                      <Text style={styles.avatarText}>{getInitials(contact.name, contact.desc)}</Text>
                    )}
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {contact.displayName || contact.desc || contact.name || '—'}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {contact.name ? `@${contact.name}` : '—'}
                    </Text>
                  </View>
                  <ChevronRight size={16} color={isDark ? '#3A3A50' : '#D0D0D0'} />
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedContact} transparent animationType="slide" onRequestClose={() => setSelectedContact(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedContact(null)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            {selectedContact && (
              <>
                <View style={[styles.sheetAvatar, { backgroundColor: getAvatarColor(selectedContact.id) }]}>
                  {selectedContact.profileImage ? (
                    <FastImage source={{ uri: selectedContact.profileImage }} style={{ width: 88, height: 88 }} contentFit="cover" />
                  ) : (
                    <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF' }}>
                      {getInitials(selectedContact.name, selectedContact.desc)}
                    </Text>
                  )}
                </View>
                <Text style={styles.sheetName}>{selectedContact.displayName || selectedContact.desc || selectedContact.name}</Text>
                <Text style={styles.sheetUsername}>{selectedContact.name ? `@${selectedContact.name}` : ''}</Text>

                <View style={styles.sheetCard}>
                  <Pressable
                    style={styles.sheetRow}
                    onPress={() => {
                      setSelectedContact(null);
                      navigation.navigate('DmChatScreen', { itemData: selectedContact } as any);
                    }}
                  >
                    <View style={styles.sheetRowIcon}>
                      <MessageCircle size={18} color={accent} strokeWidth={2.5} />
                    </View>
                    <View style={styles.sheetRowBody}>
                      <Text style={styles.sheetRowTitle}>Send Message</Text>
                      <Text style={styles.sheetRowSub}>Start a conversation</Text>
                    </View>
                    <ChevronRight size={18} color={isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF'} />
                  </Pressable>
                  <View style={styles.sheetDivider} />
                  <Pressable
                    style={styles.sheetRow}
                    onPress={() => {
                      setSelectedContact(null);
                      navigation.navigate('DmProfileScreen', { itemData: selectedContact } as any);
                    }}
                  >
                    <View style={[styles.sheetRowIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                      <User size={18} color={isDark ? 'rgba(255,255,255,0.7)' : '#6B7280'} strokeWidth={2.5} />
                    </View>
                    <View style={styles.sheetRowBody}>
                      <Text style={styles.sheetRowTitle}>View Profile</Text>
                      <Text style={styles.sheetRowSub}>See details & media</Text>
                    </View>
                    <ChevronRight size={18} color={isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF'} />
                  </Pressable>
                </View>

                <Pressable style={styles.cancelBtn} onPress={() => setSelectedContact(null)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ContactListScreen;
