import { useRoute } from '@react-navigation/native';
import { BadgeCheck, Ticket } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontFamily } from '../../../../../GlobalStyles';
import BackArrow from '../../../../assets/svg/backArrow';
import useNavigationHook from '../../../../hooks/use_navigation';

const AccessRequiredScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>();
  const {phone, otpToken} = route.params || {};
  const floatAnim = useRef(new Animated.Value(0)).current;

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [floatAnim]);

  const handleEnterInviteCode = () => {
    navigation.navigate('EnterVerifyCodeScreen', {phone, otpToken});
  };

  const handleGetPremiumAccess = () => {
    navigation.navigate('PremiumAccessPassScreen', {phone, otpToken});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <BackArrow />
        </TouchableOpacity>

        {/* Central Icon - Checkmark in Blue Circle */}
        <View style={styles.iconContainer}>
          <Animated.View
            style={[styles.checkmarkCircle, {transform: [{rotate}]}]}>
            <View style={styles.checkmarkInner}>
              <BadgeCheck size={40} color="#397CEA" />
            </View>
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Access Required</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Create your Amigo account using an invite code or Premium Access Pass.
        </Text>

        {/* Options Cards */}
        <View style={styles.cardsContainer}>
          {/* Enter Invite Code Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={handleEnterInviteCode}
            activeOpacity={0.8}>
            <View>
              <View style={styles.cardIconContainer}>
                <View style={styles.keyIcon}>
                  <Ticket size={24} color="#397CEA" />
                </View>
                <Text style={styles.cardTitle}>Enter Invite Code</Text>
              </View>
              <View style={styles.cardContent} />
            </View>
            <Text style={styles.cardDescription}>
              Have an invite code from a friend? Use it to create your account.
            </Text>
          </TouchableOpacity>

          {/* Get Premium Access Pass Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={handleGetPremiumAccess}
            activeOpacity={0.8}>
            <View>
              <View style={styles.cardIconContainer}>
                <View style={styles.keyIcon}>
                  <BadgeCheck size={24} color="#397CEA" />
                </View>
                <Text style={styles.cardTitle}>Get Premium Access Pass</Text>
              </View>
              <View style={styles.cardContent} />
            </View>
            <Text style={styles.cardDescription}>
              Get instant access to create your Amigo account.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccessRequiredScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#0A0A14',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#397CEA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 90,
    elevation: 70,
  },
  checkmarkInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#0A0A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8B8CAD',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#141422',
    borderRadius: 16,
    padding: 20,
    paddingVertical: 30,
    borderWidth: 1,
    borderColor: '#397CEA',
  },
  cardIconContainer: {
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  keyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#181F46',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#397CEA',
    borderWidth: 0.5,
  },
  keyIconText: {
    fontSize: 24,
  },
  checkmarkIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#181F46',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#397CEA',
    borderWidth: 0.5,
  },
  checkmarkIconText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 6,
    width: '80%',
  },
  cardDescription: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 20,
    color: '#8B8CAD',
    opacity: 0.8,
  },
});
