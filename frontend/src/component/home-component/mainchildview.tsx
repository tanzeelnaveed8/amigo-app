import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  Platform,
  StyleSheet,
  Keyboard,
} from 'react-native';
import React, { memo, useContext } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import useNavigationHook from '../../hooks/use_navigation';
import RNText from '../atoms/text';
import fontWeight from '../../constants/font-weight';
import fontSize from '../../constants/font-size';
import Context from '../../context';
import { AlignJustify, Search, X, Moon, Ghost } from 'lucide-react-native';

interface MainChildrenViewProps {
  username?: string;
  totalmessages?: number;
  onRightIconPress?: () => void;
  onlineuserData?: any;
  dmCount?: number;
  groupCount?: number;
  channelCount?: number;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const MainChildrenView = (props: MainChildrenViewProps) => {
  const navigation = useNavigationHook();
  const {
    username,
    searchValue = '',
    onSearchChange,
    totalmessages = 0,
  } = props;
  const ctx = useContext(Context);
  const themeColors = ctx?.colors ?? {};
  const themeMode = ctx?.themeMode ?? 'dark';
  const setThemeMode = ctx?.setThemeMode;
  const isDark = themeColors.bgColor === '#0A0A14' || (themeColors.bgColor && String(themeColors.bgColor).includes('0A0A'));
  const accent = themeColors.accentColor ?? '#9B7BFF';
  const accentLight = themeColors.accentLight ?? '#7C5FD4';

  const handleDrawerPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const cycleTheme = () => {
    if (themeMode === 'day') setThemeMode?.('dark');
    else if (themeMode === 'dark') setThemeMode?.('ghost');
    else setThemeMode?.('day');
  };

  const displayName = username || 'There';
  const initial = displayName.trim()[0]?.toUpperCase() || 'U';

  return (
    <View style={[styles.container, { backgroundColor: themeColors.bgColor ?? '#0A0A14' }]}>
      {/* Top row: Menu + Theme */}
      <View style={styles.topRow}>
        <Pressable
          onPress={handleDrawerPress}
          style={({ pressed }) => [
            styles.iconBtn,
            isDark ? styles.iconBtnDark : styles.iconBtnLight,
            pressed && styles.iconBtnPressed,
          ]}
          hitSlop={12}
        >
          <AlignJustify size={24} color={themeColors.secondaryText ?? '#8B8CAD'} />
        </Pressable>
        <Pressable
          onPress={cycleTheme}
          style={({ pressed }) => [
            styles.iconBtn,
            isDark ? styles.iconBtnDark : styles.iconBtnLight,
            pressed && styles.iconBtnPressed,
          ]}
          hitSlop={12}
        >
          {themeMode === 'day' ? (
            <Moon size={22} color={accent} />
          ) : (
            <Ghost size={22} color={accent} />
          )}
        </Pressable>
      </View>

      {/* Header: Greeting + Name + Profile avatar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <RNText
            label={getGreeting()}
            fontSize={fontSize._15}
            fontWeight={fontWeight._500}
            color={themeColors.secondaryText ?? '#8B8CAD'}
            style={styles.greeting}
          />
          <Text style={[styles.nameText, { color: accent }]}>
            {displayName}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={({ pressed }) => [
            styles.avatarWrap,
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={[accent, accentLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: themeColors.cardBg ?? themeColors.inputBGColor ?? '#141422', borderColor: themeColors.inputBorderColor ?? 'rgba(255,255,255,0.08)' }]}>
        <Search size={17} color={themeColors.secondaryText ?? '#5E607E'} style={styles.searchIcon} />
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Search conversations..."
          placeholderTextColor={themeColors.secondaryText ?? '#5E607E'}
          style={[styles.searchInput, { color: themeColors.textColor }]}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchValue.length > 0 && (
          <Pressable
            onPress={() => onSearchChange?.('')}
            style={[styles.clearBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
            hitSlop={8}
          >
            <X size={12} color={themeColors.secondaryText ?? '#8B8CAD'} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default memo(MainChildrenView);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDark: {
    backgroundColor: 'transparent',
  },
  iconBtnLight: {
    backgroundColor: 'transparent',
  },
  iconBtnPressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    marginBottom: 4,
  },
  nameText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  avatarWrap: {
    marginLeft: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
