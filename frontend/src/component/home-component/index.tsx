import {
  ActivityIndicator,
  View,
  SectionList,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useNavigationHook from '../../hooks/use_navigation';
import { FlatList } from 'react-native-gesture-handler';
import fontWeight from '../../constants/font-weight';
import fontSize from '../../constants/font-size';
import { getHeightInPercentage } from '../../utils/dimensions';
import RNText from '../atoms/text';
import { DATA, HomeProps } from './data';
import BackgroundContainer from '../atoms/bg-container';
import ChatListItem from '../atoms/chat-list';
import styles from './styles';
import { useSelector } from 'react-redux';
import MainChildrenView from './mainchildview';
import { _isEmpty, searchData } from '../../utils/helper';
import Context from '../../context';
import { Plus } from 'lucide-react-native';
import socketServics from '../../utils/socket';

type TabType = 'dm' | 'group' | 'chanel';

const HomeScreenComponent = (props: HomeProps) => {
  const { onClickItem, refetch, onLablePress, Data, listEmptyComponent, isLoading } = props;
  const navigation = useNavigationHook();
  const labelRef = useRef<FlatList>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userData: any = useSelector((state: any) => state.loginData);
  const ctx = useContext(Context);
  const colors = ctx?.colors ?? {};
  const contactList = ctx?.contactList ?? [];
  const accent = colors.accentColor ?? '#9B7BFF';
  const isDark = colors.bgColor === '#0A0A14' || (colors.bgColor && String(colors.bgColor).includes('0A0A'));

  const dataSorting = useCallback(
    (index: number) => {
      const type = DATA[index]?.type;
      const allItems = Data?.[0]?.data ?? [];
      const filtered = type ? allItems.filter((r: any) => r?.type === type) : allItems;
      setData(_isEmpty(filtered) ? [] : filtered);
    },
    [Data],
  );

  useEffect(() => {
    dataSorting(activeTabIndex);
  }, [Data, activeTabIndex, dataSorting]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return searchData(data, searchQuery, 'name');
  }, [data, searchQuery]);

  const unreadChats = useMemo(
    () => filteredBySearch.filter((c: any) => (c?.unseenMsg ?? 0) > 0),
    [filteredBySearch],
  );
  const readChats = useMemo(
    () => filteredBySearch.filter((c: any) => (c?.unseenMsg ?? 0) === 0),
    [filteredBySearch],
  );

  const sections = useMemo(() => {
    const s: { title: string; data: any[]; isUnread?: boolean }[] = [];
    if (unreadChats.length > 0) {
      s.push({ title: `Unread \u2022 ${unreadChats.length}`, data: unreadChats, isUnread: true });
    }
    if (readChats.length > 0) {
      s.push({ title: 'Recent', data: readChats, isUnread: false });
    }
    return s;
  }, [unreadChats, readChats]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    const currentUserId = userData?.data?._id;
    if (!currentUserId) return;
    unreadChats.forEach((chat: any) => {
      const conversationId = chat.conversationId ?? chat.id;
      if (conversationId) {
        socketServics.emit('seen', {
          conversationId,
          userId: currentUserId,
          msgByUserId: currentUserId,
        });
      }
    });
  }, [unreadChats, userData?.data?._id]);

  const getTabUnread = (type: TabType) => {
    const list = Data?.[0]?.data ?? [];
    return list
      .filter((r: any) => r?.type === type)
      .reduce((sum: number, c: any) => sum + (c?.unseenMsg ?? 0), 0);
  };

  const renderTab = ({ item, index }: { item: (typeof DATA)[0]; index: number }) => {
    const isActive = index === activeTabIndex;
    const unread = getTabUnread(item.type as TabType);
    return (
      <Pressable
        style={[
          tabStyles.pill,
          isActive
            ? { backgroundColor: accent }
            : {},
        ]}
        onPress={() => {
          labelRef.current?.scrollToIndex({ index, animated: true });
          setActiveTabIndex(index);
          dataSorting(index);
          onLablePress(item.lable);
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: isActive ? '#FFFFFF' : (isDark ? '#8B8CAD' : '#6B7280'),
          }}
        >
          {item.lable}
        </Text>
        {unread > 0 && (
          <View style={[tabStyles.badge, { backgroundColor: '#EF4444' }]}>
            <Text style={tabStyles.badgeText}>
              {unread >= 10 ? '9+' : String(unread)}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; data: any[]; isUnread?: boolean };
  }) => (
    <View style={[shStyles.row, !section.isUnread && sections.length > 1 ? { marginTop: 24 } : {}]}>
      <Text style={[shStyles.title, { color: isDark ? '#5E607E' : '#9CA3AF' }]}>
        {section.title.toUpperCase()}
      </Text>
      <View style={{ flex: 1 }} />
      {section.isUnread && (
        <Pressable onPress={handleMarkAllRead} hitSlop={8}>
          <Text style={[shStyles.action, { color: accent }]}>
            MARK ALL READ
          </Text>
        </Pressable>
      )}
    </View>
  );

  const openChat = (item: any) => {
    onClickItem(item._id);
    const convId = item.conversationId ?? item.id;
    if (item.type === 'dm') {
      navigation.navigate('DmChatScreen', { itemData: item, conversationId: convId });
    } else if (item.chanelAdmin !== undefined) {
      navigation.navigate('ChanelChatScreen', { itemData: item, conversationId: convId });
    } else {
      navigation.navigate('ChatScreen', { itemData: item, conversationId: convId });
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOnline = item?.type === 'dm' && contactList?.some((c: any) => c.id === item?.id && c.isOnline);
    const hasUnread = (item?.unseenMsg ?? 0) > 0 && !item?.sender;
    return (
      <Pressable
        onPress={() => openChat(item)}
        style={({ pressed }) => [
          rowStyles.wrapper,
          pressed && { backgroundColor: isDark ? '#141422' : '#F9FAFB' },
        ]}
      >
        {hasUnread && (
          <View style={[rowStyles.unreadBar, { backgroundColor: accent }]} />
        )}
        <ChatListItem
          image={item.profileImage}
          name={item.name}
          time={item.time}
          lastmsg={item.lastmsg}
          unseenMsg={item?.unseenMsg}
          sender={item.sender}
          accentColor={accent}
          isDark={isDark}
          isOnline={isOnline}
        />
      </Pressable>
    );
  };

  const TabsRow = () => (
    <View style={[tabStyles.container, {
      backgroundColor: isDark ? (colors.cardBg ?? '#141422') : '#FFFFFF',
      borderColor: isDark ? 'transparent' : 'rgba(0,0,0,0.06)',
    }]}>
      <FlatList
        ref={labelRef}
        data={DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderTab}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => labelRef.current?.scrollToIndex({ index: info.index, animated: true }), 100);
        }}
      />
    </View>
  );

  return (
    <BackgroundContainer
      Whitebgwidth="100%"
      Whitebgheight={getHeightInPercentage(71)}
      paddingVertical={0}
      mainchildren={
        <MainChildrenView
          username={userData?.data?.firstName}
          totalmessages={Data?.[0]?.data?.reduce((t: number, g: any) => t + (g?.unseenMsg ?? 0), 0)}
          dmCount={Data?.[0]?.data?.filter((r: any) => r?.type === 'dm')?.length ?? 0}
          groupCount={Data?.[0]?.data?.filter((r: any) => r?.type === 'group')?.length ?? 0}
          channelCount={Data?.[0]?.data?.filter((r: any) => r?.type === 'chanel')?.length ?? 0}
          searchValue={searchQuery}
          onSearchChange={handleSearch}
        />
      }
      children={
        <View style={styles.secondcontainer}>
          <View style={styles.tabsRow}>
            <TabsRow />
          </View>

          {isLoading ? (
            <View style={loadingStyles.centered}>
              <ActivityIndicator size="large" color={accent} />
            </View>
          ) : (
            <>
              {sections.length === 0 ? (
                <View style={loadingStyles.centeredFlex} />
              ) : (
                <View style={listStyles.listWrapper}>
                  <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => `chat_${item.id ?? item.conversationId ?? item.name ?? index}`}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={listStyles.content}
                    style={listStyles.list}
                    onRefresh={refetch}
                    refreshing={false}
                  />
                </View>
              )}
            </>
          )}

          <Pressable
            onPress={() => navigation.navigate('CreateNewScreen')}
            style={({ pressed }) => [
              styles.addicon,
              {
                backgroundColor: accent,
                width: 58,
                height: 58,
                borderRadius: 29,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      }
    />
  );
};

export default HomeScreenComponent;

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: 4,
    marginLeft: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 1,
    overflow: 'visible',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

const shStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  action: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

const rowStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});

const listStyles = StyleSheet.create({
  listWrapper: {
    flex: 1,
    width: '100%',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingBottom: 100,
    paddingTop: 4,
  },
});

const loadingStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredFlex: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
