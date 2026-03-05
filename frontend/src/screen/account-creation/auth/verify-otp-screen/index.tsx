import {useRoute} from '@react-navigation/native';
import {CheckCircle2, Send, Shield} from 'lucide-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {FontFamily} from '../../../../../GlobalStyles';
import {SendMsg91Otp, VerifyMsg91Otp} from '../../../../apis/auth/index';
import BackArrow from '../../../../assets/svg/backArrow';
import {shadow, shadow2} from '../../../../constants/shadows';
import useNavigationHook from '../../../../hooks/use_navigation';
import {useDispatch} from 'react-redux';
import {loginAction} from '../../../../redux/actions';

const VerifyOtpScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const {phone, inviteCode, inviteData, flowType, email, userId} =
    route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [justResent, setJustResent] = useState(false);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const phoneWithoutPlus = (phone || '').replace(/^\+/, '');
      const verifyPayload = {
        phone: phoneWithoutPlus,
        otp: otpCode,
        flowType: flowType || 'register',
      };

      console.log('Verifying OTP with payload:', verifyPayload);
      const response = await VerifyMsg91Otp(verifyPayload);
      console.log('OTP verified successfully:', response);

      if (flowType === 'login') {
        dispatch(loginAction({...response}));
        navigation.reset({
          index: 0,
          routes: [{name: 'MyDrawer' as any}],
        });
      } else {
        const otpToken = response?.data?.token || response?.token || '';
        navigation.navigate('AccessRequiredScreen', {
          phone: phone,
          otpToken: otpToken,
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrorMessage(
        error?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');

    try {
      const phoneWithoutPlus = (phone || '').replace(/^\+/, '');
      const otpPayload = {
        phone: phoneWithoutPlus,
        flowType: flowType || 'register',
      };

      console.log('Resending OTP with payload:', otpPayload);
      await SendMsg91Otp(otpPayload);
      console.log('OTP resent successfully');

      setIsResending(false);
      setJustResent(true);
      setResendCountdown(60);
      setTimeout(() => setJustResent(false), 3000);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setIsResending(false);
      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to resend OTP. Please try again.',
      );
    }
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(prev => prev - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const isOtpComplete = otp.every(v => v !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === 'android' ? 120 : 80}>
          {/* Back Arrow */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackArrow />
          </TouchableOpacity>

          {/* Shield Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.shieldCircle, isOtpComplete && shadow2]}>
              <Shield size={35} color="#397CEA" strokeWidth={2} />
            </View>
          </View>

          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.instruction}>Enter the 6-digit code sent to</Text>
          <Text style={styles.phoneNumber}>{phone ? `+${phone}` : ''}</Text>

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={({nativeEvent}) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                editable={!isVerifying}
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResendCode}
            disabled={resendCountdown > 0 || isResending}>
            {isResending ? (
              <Text style={styles.resendText}>Sending...</Text>
            ) : justResent ? (
              <>
                <CheckCircle2 size={18} color="#397CEA" />
                <Text style={styles.resendText}>Code sent!</Text>
              </>
            ) : resendCountdown > 0 ? (
              <Text style={styles.resendTextDisabled}>
                Resend in {resendCountdown}s
              </Text>
            ) : (
              <>
                <Send size={18} color="#397CEA" />
                <Text style={styles.resendText}>Resend Code</Text>
              </>
            )}
          </TouchableOpacity>

          {/* VERIFY BUTTON */}
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isOtpComplete && styles.verifyButtonActive,
              ]}
              onPress={handleVerify}
              disabled={!isOtpComplete || isVerifying}>
              {isVerifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  shieldCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#397CEA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171729',
    ...shadow,
  },
  title: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  instruction: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 16,
    color: '#8A8BAB',
    textAlign: 'center',
  },
  phoneNumber: {
    fontFamily: FontFamily.robotoBold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    // width: 56,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#397CEA',
    backgroundColor: '#171729',
    textAlign: 'center',
    fontSize: 24,
    color: '#FFFFFF',
    flex: 1,
  },
  otpInputFilled: {
    backgroundColor: '#141422',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: FontFamily.robotoRegular,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  resendText: {
    color: '#397CEA',
    fontSize: 16,
  },
  resendTextDisabled: {
    color: '#5E607E',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: '#141422',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#397CEA',
    paddingVertical: 16,
    alignItems: 'center',
    opacity: 0.5,
  },
  verifyButtonActive: {
    backgroundColor: '#225DE5',
    opacity: 1,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FontFamily.robotoBold,
  },
});
