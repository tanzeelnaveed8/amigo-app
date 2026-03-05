import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {LinearGradient} from 'expo-linear-gradient';
import {FontFamily} from '../../../GlobalStyles';
import {CheckPhone, SendMsg91Otp} from '../../apis/auth/index';
import EnterIcon from '../../assets/svg/EnterIcon';
import WhiteGhostIcon from '../../assets/svg/WhiteGhostIcon';
import PhoneNumberModal from '../../components/PhoneNumberModal/PhoneNumberModal';

const ChooseModeScreen = ({navigation}) => {
  // Floating animation for Ghost Icon
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Modal state
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  // Loading state for API call
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  useEffect(() => {
    // Create a smooth, slow oscillating animation
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

  // Interpolate the animation value to create smooth vertical movement
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5], // Moves 5px up and down
  });

  const handleEnterGhostMode = () => {
    navigation.push('TermsAgreementScreen');
  };

  const handleLoginSignUp = () => {
    setIsPhoneModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsPhoneModalVisible(false);
  };

  const handleVerify = async (countryCode, phoneNumber) => {
    setIsPhoneModalVisible(false);
    setIsCheckingPhone(true);

    try {
      const cleanCountryCode = countryCode.replace('+', '');
      const fullPhoneNumber = `${cleanCountryCode}${phoneNumber}`;

      console.log('Checking phone number:', fullPhoneNumber);

      const response = await CheckPhone({
        phone: fullPhoneNumber,
      });

      console.log('Check phone response:', response);

      if (response?.exists) {
        console.log('User exists, sending OTP for login');
        await SendMsg91Otp({phone: fullPhoneNumber, flowType: 'login'});

        navigation.navigate('VerifyOtpScreen', {
          phone: fullPhoneNumber,
          flowType: 'login',
        });
      } else {
        console.log('New user, sending OTP for registration');
        await SendMsg91Otp({phone: fullPhoneNumber, flowType: 'register'});

        navigation.navigate('VerifyOtpScreen', {
          phone: fullPhoneNumber,
          flowType: 'register',
        });
      }
    } catch (error) {
      console.error('Error checking phone number:', error);
      setIsPhoneModalVisible(true);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#050509', '#141426']}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}>
        {/* Top Section - Ghost Icon, Title, Subtitle */}
        <View style={styles.topContainer}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{translateY}],
              },
            ]}>
            <WhiteGhostIcon width={80} height={80} />
          </Animated.View>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Choose how you want to continue</Text>
        </View>

        {/* Bottom Section - Buttons */}
        <View style={styles.bottomContainer}>
          {/* Enter Ghost Mode Button */}
          <TouchableOpacity
            style={[styles.buttonContainer]}
            onPress={handleEnterGhostMode}
            activeOpacity={0.8}
            >
            <LinearGradient
              colors={['#9B7BFF', '#B88DFF']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.gradientButton}>
              <View style={styles.buttonContent}>
                <View style={styles.iconSpacing}>
                  <WhiteGhostIcon
                    width={20}
                    height={20}
                    strokeColor={'#FFFFFF'}
                  />
                </View>
                <Text
                  style={[
                    styles.buttonText,
                  ]}>
                  Enter Ghost Mode
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

  

          {/* Or Divider with line */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.orDivider}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login / Sign Up Button */}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLoginSignUp}
            activeOpacity={0.8}>
            <View style={styles.loginButton}>
              <View style={styles.buttonContent}>
                <View style={styles.iconSpacing}>
                  <EnterIcon />
                </View>
                <Text style={styles.loginButtonText}>Login / Sign Up</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Ghost Mode: No login required, temporary crowds, fully anonymous.
          </Text>
        </View>
      </LinearGradient>

      {/* Phone Number Modal */}
      <PhoneNumberModal
        visible={isPhoneModalVisible}
        onClose={handleCloseModal}
        onVerify={handleVerify}
      />

      {/* Loading Overlay */}
      {isCheckingPhone && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Checking account...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChooseModeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050509',
  },
  container: {
    flex: 1,
    paddingBottom: 200,
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#C5C6E3',
    paddingHorizontal: 24,
    maxWidth: 280,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 1,
  },
  gradientButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B7BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#181830',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#AFAAB3',
  },
  loginButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  orDivider: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 12,
    textAlign: 'center',
    color: '#8B8CAD',
    paddingHorizontal: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#8B8CAD',
    backgroundColor: '#141422',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    borderColor: '#9B7BFF',
    backgroundColor: '#9B7BFF',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 2,
  },
  termsText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: '#C5C6E3',
    marginBottom: 2,
  },
  termsLink: {
    color: '#9B7BFF',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  disclaimer: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 19.5,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: '#8B8CAD',
    opacity: 0.7,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  iconSpacing: {
    marginRight: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#0A0A14',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').height * 0.2,
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 12,
  },
});
