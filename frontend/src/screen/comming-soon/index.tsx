import React, {useContext, useState} from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from 'lucide-react-native';
import {FontFamily} from '../../../GlobalStyles';
import useNavigationHook from '../../hooks/use_navigation';
import {Image as FastImage} from 'expo-image';
import Context from '../../context';

const TABS = ['All', 'Missed'];

const ComingSoonScreen = () => {
  const navigation = useNavigationHook();
  const { colors } = useContext(Context);
  const [activeTab, setActiveTab] = useState(0);
  const [callHistory] = useState<any[]>([]);

  const filteredCalls =
    activeTab === 1
      ? callHistory.filter((c: any) => c.type === 'missed')
      : callHistory;

  const getCallIcon = (type: string) => {
    const size = 18;
    if (type === 'missed') return <PhoneMissed size={size} color="#FF4D4D" />;
    if (type === 'incoming') return <PhoneIncoming size={size} color="#22C55E" />;
    return <PhoneOutgoing size={size} color="#9B7BFF" />;
  };

  const renderCallItem = ({item}: any) => (
    <View style={[styles.callItem, { backgroundColor: colors.cardBg }]}>
      <View style={styles.avatarContainer}>
        {item.image ? (
          <FastImage source={{uri: item.image}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, {backgroundColor: item.color || '#9B7BFF'}]}>
            <Text style={styles.avatarText}>
              {(item.name || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.callInfo}>
        <Text style={[styles.callName, { color: colors.textColor }, item.type === 'missed' && {color: '#FF4D4D'}]}>
          {item.name}
        </Text>
        <View style={styles.callMeta}>
          {getCallIcon(item.type)}
          <Text style={[styles.callTime, { color: colors.lightText }]}>{item.time}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.callButton}>
        {item.isVideo ? (
          <Video size={20} color="#9B7BFF" />
        ) : (
          <Phone size={20} color="#9B7BFF" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconBox, { backgroundColor: colors.cardBg }]}>
        <Phone size={36} color="#9B7BFF" />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textColor }]}>No calls yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>
        Your call history will appear here.{'\n'}Start a conversation and make your first call!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgColor }]}>
      <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textColor }]}>Calls</Text>
          <View style={{width: 40}} />
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.cardBg }]}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(index)}
              style={[styles.tab, activeTab === index && styles.tabActive]}>
              <Text style={[styles.tabText, { color: colors.lightText }, activeTab === index && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call List */}
        <FlatList
          data={filteredCalls}
          keyExtractor={(_, idx) => `call-${idx}`}
          renderItem={renderCallItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredCalls.length === 0 ? {flex: 1} : {paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default ComingSoonScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 15 : 5,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#141422',
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#9B7BFF',
  },
  tabText: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#C5C6E3',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#141422',
  },
  avatarContainer: {
    marginRight: 14,
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
    fontFamily: FontFamily.robotoBold,
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callTime: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 13,
    color: '#C5C6E3',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(155, 123, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#141422',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 15,
    color: '#C5C6E3',
    textAlign: 'center',
    lineHeight: 22,
  },
});
