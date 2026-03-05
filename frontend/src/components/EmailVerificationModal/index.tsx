import {Mail, X, Ghost} from 'lucide-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {FontFamily} from '../../../GlobalStyles';
import {
  shadow,
  shadow2,
  shadowSecondary,
  shadowSecondary2,
} from '../../constants/shadows';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerifySuccess: () => void;
  onVerifyEmail: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  onClose,
  onVerifySuccess,
  onVerifyEmail,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(53);
  const [isResending, setIsResending] = useState(false);
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

  useEffect(() => {
    if (visible && resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [visible, resendCountdown]);

  useEffect(() => {
    if (visible) {
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    } else {
      // Reset state when modal closes
      setOtp(['', '', '', '', '', '']);
      setErrorMessage('');
      setResendCountdown(53);
    }
  }, [visible]);

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
      await onVerifyEmail(otpCode);
      onVerifySuccess();
      onClose();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setOtp(['', '', '', '', '', '']);
    setErrorMessage('');

    try {
      await onResendOtp();
      setResendCountdown(53);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, shadow2]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#8A8BAB" size={24} />
          </TouchableOpacity>

          {/* Header Icons */}
          <Animated.View
            style={[styles.headerIcons, {transform: [{translateY}]}]}>
            <View
              style={[
                styles.iconCircle,
                styles.iconCircleLeft,
                shadowSecondary,
              ]}>
              <Ghost color="#b171f0" size={25} />
            </View>
            <View style={styles.dividerWrapper}>
              <View style={styles.divider2} />
              <View style={styles.divider} />
            </View>
            <View
              style={[
                styles.iconCircle,
                styles.iconCircleRight,
                shadow2,
                shadow,
              ]}>
              <Mail color="#397CEA" size={25} />
            </View>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Verify Email</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Email helps in account recovery if you lose access
          </Text>

          {/* Email Display */}
          <Text style={styles.email}>{email}</Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  errorMessage ? styles.otpInputError : null,
                ]}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={({nativeEvent}) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Resend Text */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0 || isResending}>
            <Text
              style={[
                styles.resendText,
                (resendCountdown > 0 || isResending) && styles.resendDisabled,
              ]}>
              {isResending
                ? 'Sending...'
                : resendCountdown > 0
                ? `Resend in ${resendCountdown}s`
                : 'Resend Code'}
            </Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.join('').length !== 6 || isVerifying) &&
                styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.join('').length !== 6 || isVerifying}>
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#0A0A14',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F3D',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#397CEA',
  },
  iconCircleLeft: {
    backgroundColor: 'rgba(177, 113, 240, 0.05)',
    // borderWidth: 0.5,
    // borderColor: '#b171f0',
  },
  iconCircleRight: {
    backgroundColor: 'rgba(57, 124, 234, 0.2)',
    borderWidth: 0.5,
    // borderColor: '#397CEA',
  },
  dividerWrapper: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  divider: {
    width: 20,
    height: 1,
    backgroundColor: '#397CEA',
    ...shadow2,
  },
  divider2: {
    width: 20,
    height: 1,
    backgroundColor: '#b171f0',
    ...shadowSecondary2,
  },
  title: {
    fontSize: 28,
    fontFamily: FontFamily.robotoBold,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FontFamily.robotoRegular,
    color: '#8A8BAB',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  email: {
    fontSize: 16,
    fontFamily: FontFamily.robotoMedium,
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: 52,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F3D',
    backgroundColor: '#171729',
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: FontFamily.robotoBold,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#397CEA',
    backgroundColor: '#1F1F3D',
  },
  otpInputError: {
    borderColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 14,
    fontFamily: FontFamily.robotoRegular,
    marginBottom: 12,
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    fontFamily: FontFamily.robotoMedium,
    color: '#8A8BAB',
    marginBottom: 24,
  },
  resendDisabled: {
    color: '#5E607E',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#225DE5',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FontFamily.robotoBold,
  },
});

export default EmailVerificationModal;
