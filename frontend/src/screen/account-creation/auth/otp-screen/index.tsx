import React, { useContext } from 'react';
import { Animated } from 'react-native';
import OtpComponent from '../../../../component/otp-component';
import useNavigationHook from '../../../../hooks/use_navigation';
import Context from '../../../../context';
import { VerifyMsg91Otp, SendMsg91Otp } from '../../../../apis/auth';
import { useDispatch } from 'react-redux';
import { loginAction } from '../../../../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import useTopEnterAnim from '../../../../hooks/useTopEnterAnim';

const OtpScreen = () => {
  const navigation: any = useNavigationHook();
  const route = useRoute<any>();
  const { phone, flowType, loginData } = route.params;
  const { setLoader, setToastMsg } = useContext(Context);
  const dispatch = useDispatch();
  const enterStyle = useTopEnterAnim({ offsetY: -40 });

  // Resend OTP function
  const handleResendOtp = async () => {
    try {
      const phoneWithoutPlus = (phone || '').replace(/^\+/, '');
      const resendPayload = {
        phone: phoneWithoutPlus,
        flowType: 'register'
      };

      const resendResponse = await SendMsg91Otp(resendPayload);

      console.log('MSG91 Resend OTP - Response:', JSON.stringify(resendResponse, null, 2));
      setToastMsg('OTP resent successfully');
    } catch (error: any) {
      console.log('MSG91 Resend OTP - Error:', error);
      setToastMsg('Failed to resend OTP. Please try again.');
    }
  };

  const validateOTP = (code: string): { isValid: boolean; error?: string } => {
    // Check if OTP is empty
    if (!code || code.trim() === '') {
      return { isValid: false, error: 'Please enter the OTP code' };
    }

    // Remove any spaces or special characters for validation
    const cleanCode = code.replace(/\s/g, '');

    // Check if OTP has minimum length (typically 6 digits)
    if (cleanCode.length < 6) {
      return { isValid: false, error: 'OTP must be at least 6 digits' };
    }

    // Check if OTP contains only numbers
    if (!/^\d+$/.test(cleanCode)) {
      return { isValid: false, error: 'OTP must contain only numbers (0-9)' };
    }

    // Check if OTP is not too long (typically 6-8 digits)
    if (cleanCode.length > 8) {
      return { isValid: false, error: 'OTP is too long. Please check and try again' };
    }


    return { isValid: true };
  };

  const confirmCode = async (code: string) => {
    // Validate OTP before processing
    const validation = validateOTP(code);
    if (!validation.isValid) {
      setToastMsg(validation.error || 'Invalid OTP');
      return;
    }

    setLoader(true);

    try {
      // Step 1: Verify OTP via MSG91
      const phoneWithoutPlus = (phone || '').replace(/^\+/, '');

      const msg91VerifyPayload = {
        phone: phoneWithoutPlus,
        otp: code
      };


      const msg91VerifyResponse = await VerifyMsg91Otp(msg91VerifyPayload);

      console.log('MSG91 Verify OTP - Response:', JSON.stringify(msg91VerifyResponse, null, 2));

      setLoader(false);
      setToastMsg('OTP verified successfully');

      if (flowType === 'login') {
        // Existing user - login and go to home
        try {
          if (msg91VerifyResponse?.refreshToken) {
            await AsyncStorage.setItem('refreshToken', msg91VerifyResponse.refreshToken);
          }
        } catch {}
        dispatch(loginAction({ ...msg91VerifyResponse }));
        navigation.reset({
          index: 0,
          routes: [{ name: 'MyDrawer' as any }],
        });
      } else {
        // New user - go to invite code / premium access
        const otpToken = msg91VerifyResponse?.data?.token || msg91VerifyResponse?.token || '';
        navigation.navigate('AccessRequiredScreen', {
          phone: phoneWithoutPlus,
          otpToken: otpToken,
        });
      }
    } catch (error: any) {
      console.log('MSG91 Verify OTP - Error:', error);
      setLoader(false);
      setToastMsg('Invalid OTP. Please check the code and try again.');
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, enterStyle]}>
      <OtpComponent
        onPress={confirmCode}
        onResend={handleResendOtp}
      />
    </Animated.View>
  );
};

export default OtpScreen;