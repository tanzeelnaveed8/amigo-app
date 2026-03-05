import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import { Image as FastImage } from 'expo-image';
import { ArrowLeft, Search, X, Check } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { useMutation } from 'react-query';
import useNavigationHook from '../../../hooks/use_navigation';
import Context from '../../../context';
import ListemptyComponent from '../../../component/atoms/listEmptyComponent';
import { _isEmpty } from '../../../utils/helper';
import { CreateGroup, UpdateGroup, UpdateGroupProfilepic } from '../../../apis/group';
import { CreateChanel, UpdateChanel, UpdateChanelProfilepic } from '../../../apis/channel';
import { incrementRoomsCreatedToday } from '../../../utils/roomsCreatedToday';

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return name.trim().slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = ['#155DFC', '#9B7BFF', '#FF6363', '#10B981', '#F59E0B', '#EC4899'];
const getAvatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const AddMemberScreen = () => {
  const route = useRoute<any>().params;
  const {
    contactList,
    setSelectedMembers,
    conversationType,
    colors,
    setLoader,
    setToastMsg,
    groupType,
    setGroupId,
    setChanelId,
  } = useContext(Context);
  const navigation = useNavigationHook();
  const isDark = colors?.bgColor === '#0A0A14' || (colors?.bgColor && String(colors.bgColor).includes('0A0A'));
  const accent = colors?.accentColor ?? '#9B7BFF';

  const [data, setData] = useState<any>(contactList ?? []);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (c: any) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.desc || '').toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const toggleMember = (item: any) => {
    const id = item.id ?? item._id;
    if (members.includes(id)) {
      setMembers(members.filter((mid: any) => mid !== id));
    } else {
      setMembers([...members, id]);
    }
    const arr = [...data];
    const idx = arr.findIndex((c: any) => (c.id ?? c._id) === id);
    if (idx >= 0) arr[idx].isSelected = !arr[idx].isSelected;
    setData(arr);
  };

  const { mutate: updateGroupProfile } = useMutation(UpdateGroupProfilepic, {
    onSuccess: () => {},
    onError: () => {},
  });
  const { mutate: updateChanelProfile } = useMutation(UpdateChanelProfilepic, {
    onSuccess: () => {},
    onError: () => {},
  });

  const { mutate: finalizeGroup } = useMutation(UpdateGroup, {
    onSuccess: (res) => {
      const form = route?.createForm;
      if (form?.imageAsset) {
        const formData = new FormData();
        formData.append('groupId', res.data?._id);
        formData.append('images', {
          uri: form.imageAsset.uri,
          type: form.imageAsset.type,
          name: form.imageAsset.name,
        });
        updateGroupProfile(formData);
      }
      incrementRoomsCreatedToday();
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Room created successfully');
      navigation.navigate('MyDrawer', { isSocketRefetch: true });
    },
    onError: () => {
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Failed to create room');
    },
  });

  const { mutate: finalizeChanel } = useMutation(UpdateChanel, {
    onSuccess: (res) => {
      const form = route?.createForm;
      if (form?.imageAsset) {
        const formData = new FormData();
        formData.append('chanelId', res.data?._id);
        formData.append('images', {
          uri: form.imageAsset.uri,
          type: form.imageAsset.type,
          name: form.imageAsset.name,
        });
        updateChanelProfile(formData);
      }
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Signal created successfully');
      navigation.navigate('MyDrawer', { isSocketRefetch: true });
    },
    onError: () => {
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Failed to create signal');
    },
  });

  const { mutate: createNewGroup } = useMutation(CreateGroup, {
    onSuccess: (res) => {
      const newGroupId = res.data;
      setGroupId?.(newGroupId);
      const form = route?.createForm;
      finalizeGroup({
        groupId: newGroupId,
        bio: form?.bio ?? '',
        title: form?.name ?? '',
        participants: members,
      });
    },
    onError: () => {
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Failed to create room');
    },
  });

  const { mutate: createNewChanel } = useMutation(CreateChanel, {
    onSuccess: (res) => {
      const newChanelId = res.data;
      setChanelId?.(newChanelId);
      const form = route?.createForm;
      finalizeChanel({
        chanelId: newChanelId,
        bio: form?.bio ?? '',
        title: form?.name ?? '',
        ...(form?.username !== undefined && { username: form.username }),
        participants: members,
      });
    },
    onError: () => {
      setIsCreating(false);
      setLoader?.(false);
      setToastMsg?.('Failed to create signal');
    },
  });

  const handleCreateDirect = () => {
    setSelectedMembers(members);
    setLoader?.(true);
    setIsCreating(true);
    if (conversationType === 'GROUP') {
      createNewGroup({ groupType: groupType || 'Public Group' });
    } else {
      createNewChanel({ chanelType: groupType || 'Public Chanel' });
    }
  };

  const onContinue = () => {
    if (route?.admin || route?.member) {
      navigation.goBack();
      return;
    }
    if (route?.fromCreateFlow && route?.createForm) {
      handleCreateDirect();
      return;
    }
    setSelectedMembers(members);
    navigation.navigate('AddGroupDetailsScreen', { selectedUser: members });
  };

  const isRoom = conversationType === 'GROUP';
  const titleSecond = isRoom ? 'Members' : 'Subscribers';
  const headerSubtitle = `${members.length} selected`;

  if (route?.fromCreateFlow) {
    const bg = isDark ? '#0A0A14' : '#FAFAFA';
    const cardBg = isDark ? '#141422' : '#FFFFFF';
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDark ? '#FFFFFF' : '#111827';
    const textSecondary = isDark ? '#8B8CAD' : '#6B7280';

    return (
      <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <ArrowLeft size={21} color={textPrimary} />
          </Pressable>
          <Text style={[s.titleLine, { color: textPrimary }]}>{isRoom ? 'Add' : 'Invite'}</Text>
          <Text style={[s.titleAccent, { color: accent }]}>{titleSecond}</Text>
          <Text style={[s.subtitle, { color: textSecondary }]}>{headerSubtitle}</Text>
        </View>

        <View style={[s.searchWrap, { backgroundColor: cardBg, borderColor: border }]}>
          <Search size={17} color={textSecondary} />
          <TextInput
            style={[s.searchInput, { color: textPrimary }]}
            placeholder="Search contacts..."
            placeholderTextColor={textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery('')} style={s.searchClear}>
              <X size={14} color={textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item: any) => item.id ?? item._id ?? String(Math.random())}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={<ListemptyComponent isLoading={!_isEmpty(contactList) && _isEmpty(filteredData)} />}
          renderItem={({ item }: any) => {
            const id = item.id ?? item._id;
            const isSelected = members.includes(id);
            const name = item.name ?? item.firstName ?? item.userName ?? '—';
            return (
              <Pressable
                onPress={() => toggleMember(item)}
                style={({ pressed }) => [
                  s.row,
                  { backgroundColor: pressed ? (isDark ? '#141422' : 'rgba(0,0,0,0.04)') : 'transparent' },
                ]}
              >
                <View style={s.avatarWrap}>
                  {item.profileImage || item.userProfile || item.image ? (
                    <FastImage
                      source={{ uri: item.profileImage || item.userProfile || item.image }}
                      style={s.avatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[s.avatar, s.avatarInitials, { backgroundColor: getAvatarColor(id) }]}>
                      <Text style={s.avatarText}>{getInitials(name)}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.rowName, { color: textPrimary }]} numberOfLines={1}>
                  {name}
                </Text>
                <View
                  style={[
                    s.checkbox,
                    { borderColor: isSelected ? accent : (isDark ? 'rgba(255,255,255,0.2)' : '#D0D0D0') },
                    isSelected && { backgroundColor: accent },
                  ]}
                >
                  {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
              </Pressable>
            );
          }}
        />

        <View style={[s.footer, { backgroundColor: bg }]}>
          <Pressable
            onPress={onContinue}
            disabled={isCreating}
            style={({ pressed }) => [
              s.continueBtn,
              { backgroundColor: accent },
              (pressed || isCreating) && { opacity: 0.9 },
            ]}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={s.continueBtnText}>
                {isRoom ? 'Create Room' : 'Create Signal'}
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const s2 = StyleSheet.create({
    secondcontainer: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 20,
      paddingVertical: 5,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors?.bgColor }}>
      <View style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 8 : 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ArrowLeft size={24} color={colors?.textColor} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors?.textColor, marginLeft: 8 }}>
            {route?.member ? 'Add Members' : route?.admin ? 'Administration' : 'New Message'}
          </Text>
        </Pressable>
      </View>
      <View style={s2.secondcontainer}>
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any, index: number) => `_${item?.id ?? index}`}
            ListEmptyComponent={<ListemptyComponent isLoading={!_isEmpty(data)} />}
            renderItem={({ item, index }: any) => {
              const id = item.id ?? item._id;
              const isSelected = members.includes(id);
              return (
                <Pressable
                  onPress={() => toggleMember(item)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10 }}
                >
                  <FastImage
                    source={item.profileImage ? { uri: item.profileImage } : require('../../../assets/image/user.png')}
                    style={{ width: 55, height: 55, borderRadius: 28 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors?.textColor }} numberOfLines={1}>
                      {item.name ?? '—'}
                    </Text>
                    {item.desc ? (
                      <Text style={{ fontSize: 16, color: colors?.secondaryText, marginTop: 4 }} numberOfLines={1}>
                        {item.desc}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? accent : (isDark ? 'rgba(255,255,255,0.3)' : '#ccc'),
                      backgroundColor: isSelected ? accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
        <Pressable
          onPress={onContinue}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AddMemberScreen;

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 16,
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
  titleLine: { fontSize: 32, fontWeight: '700', marginBottom: 2 },
  titleAccent: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  searchClear: { padding: 4 },
  listContent: { paddingBottom: 120 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  avatarWrap: { flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarInitials: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  rowName: { fontSize: 15, fontWeight: '600', flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  continueBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
