import {useRoute} from '@react-navigation/native';
import {Ticket} from 'lucide-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {FontFamily} from '../../../../../GlobalStyles';
import {VerifyInviteCode} from '../../../../apis/auth/index';
import BackArrow from '../../../../assets/svg/backArrow';
import {shadow, shadow3} from '../../../../constants/shadows';
import useNavigationHook from '../../../../hooks/use_navigation';
import useTopEnterAnim from '../../../../hooks/useTopEnterAnim';

const EnterVerifyCodeScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>();
  const {phone, otpToken} = route.params || {};
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  const [inviteCode, setInviteCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    'Please enter a valid invite code',
  );
  const [isVerifying, setIsVerifying] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  useEffect(() => {
    const loop = () => {
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
      ]).start(loop);
    };
    loop();
  }, [floatAnim]);

  const handleContinue = async () => {
    if (inviteCode.trim().length < 3) {
      setErrorMessage('Please enter a valid invite code');
      setShowError(true);
      return;
    }

    setShowError(false);
    setIsVerifying(true);

    try {
      console.log('Verifying invite code:', inviteCode);

      const response = await VerifyInviteCode({
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      if (response?.valid) {
        console.log('Invite code is valid, proceeding to profile creation');

        navigation.navigate('RegisterUserScreen', {
          inviteCode: inviteCode.trim().toUpperCase(),
          inviteData: response?.data,
          phone: phone,
          otpToken: otpToken,
        });
      } else {
        setErrorMessage(response?.message || 'Invalid invite code');
        setShowError(true);
      }
    } catch (error: any) {
      console.error('Error verifying invite code:', error);
      setErrorMessage('Failed to verify invite code. Please try again.');
      setShowError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setInviteCode(text);
    if (showError) {
      setShowError(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[{ flex: 1 }, enterStyle]}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}>
            <BackArrow />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.ticketCircle,
                {transform: [{translateY}]},
                inviteCode.length === 6 && shadow3,
              ]}>
              <View style={styles.ticketInner}>
                <Ticket size={40} color="#397CEA" />
              </View>
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter Invite Code</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Enter the invite code you received to create your Amigo account.
          </Text>

          {/* Input */}
          <View style={[styles.inputContainer, focused && shadow]}>
            <TextInput
              style={styles.input}
              value={inviteCode}
              onChangeText={handleCodeChange}
              placeholder="INVITE123"
              placeholderTextColor="#8B8CAD"
              autoCapitalize="characters"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
          {showError && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Push button to bottom of scroll content */}
          <View style={{flex: 1, justifyContent: 'flex-end'}}>
            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                inviteCode.trim().length >= 3 && styles.continueButtonActive,
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={inviteCode.trim().length < 3 || isVerifying}>
              {isVerifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Bottom Link */}
            <TouchableOpacity
              style={styles.bottomLinkContainer}
              onPress={() => navigation.navigate('PremiumAccessPassScreen', {phone, otpToken})}
              activeOpacity={0.8}>
              <Text style={styles.bottomLinkText}>
                Don't have an invite? Get Premium Access Pass
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default EnterVerifyCodeScreen;

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 30,
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
  ticketCircle: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#0A0A14',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  ticketInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#0A0A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#8B8CAD',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: '#141422',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#397CEA',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
  errorText: {
    marginTop: 8,
    color: '#FF4D4D',
    fontSize: 14,
    textAlign: 'center',
  },
  continueButton: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#141422',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#397CEA',
    paddingVertical: 12,
    alignItems: 'center',
    opacity: 0.5,
  },
  continueButtonActive: {
    backgroundColor: '#225DE5',
    opacity: 1,
  },
  continueButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  bottomLinkContainer: {
    marginTop: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomLinkText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#397CEA',
    textAlign: 'center',
  },
});
