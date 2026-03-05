import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {MessageSquarePlus, Sparkles} from 'lucide-react-native';
import useNavigationHook from '../../../hooks/use_navigation';
import Context from '../../../context';
import {FontFamily} from '../../../../GlobalStyles';

const ChatListEmptyComponent = ({isLoading}: {isLoading?: boolean}) => {
  const navigation = useNavigationHook();
  const [load, setLoad] = useState<any>(isLoading);
  const {colors} = useContext(Context);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLoad(isLoading);
  }, [isLoading, load]);

  useEffect(() => {
    if (load) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();

      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [load]);

  return load ? (
    <Animated.View
      style={[
        styles.container,
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
      ]}>
      <Animated.View
        style={[styles.iconOuter, {transform: [{scale: pulseAnim}]}]}>
        <View style={styles.iconInner}>
          <MessageSquarePlus size={38} color="#9B7BFF" strokeWidth={1.8} />
        </View>
      </Animated.View>

      <Text style={[styles.title, { color: colors.textColor }]}>No messages yet</Text>
      <Text style={[styles.subtitle, { color: colors.lightText }]}>
        Start a conversation with your contacts{'\n'}and your chats will appear here
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={() => navigation.navigate('ContactListScreen')}>
        <Sparkles size={18} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.buttonText}>Start Chatting</Text>
      </TouchableOpacity>
    </Animated.View>
  ) : null;
};

export default ChatListEmptyComponent;

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'android' ? '95%' : '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(155, 123, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(155, 123, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9B7BFF',
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 26,
    gap: 10,
    shadowColor: '#9B7BFF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
