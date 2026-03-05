import {CheckCircle, Crown, Loader2} from 'lucide-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {FontFamily} from '../../../../../GlobalStyles';
import BackArrow from '../../../../assets/svg/backArrow';
import useNavigationHook from '../../../../hooks/use_navigation';
import {shadow, shadow2} from '../../../../constants/shadows';
import {useSelector} from 'react-redux';
import {useRoute} from '@react-navigation/native';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../../../apis/razorpay';
import { RAZORPAY_KEY_ID } from '../../../../apis/base_url';
import useTopEnterAnim from '../../../../hooks/useTopEnterAnim';

const PAYMENT_AMOUNT = 50;

const PremiumAccessPassScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>();
  const {phone, otpToken} = route.params || {};
  const userData: any = useSelector((state: any) => state.loginData);
  const enterStyle = useTopEnterAnim({ offsetY: -40 });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinueToPayment = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const phoneNumber =
        phone || userData?.data?.phone || userData?.phone || 'unknown';

      const orderResponse = await createRazorpayOrder({
        amount: PAYMENT_AMOUNT,
        currency: 'INR',
        phoneNumber,
      });

      if (!orderResponse?.order?.id) {
        throw new Error('Failed to create payment order');
      }

      const order = orderResponse.order;

      let RazorpayCheckout: any;
      try {
        RazorpayCheckout = require('react-native-razorpay').default;
      } catch (e) {
        // Razorpay SDK not available, use fallback
        RazorpayCheckout = null;
      }

      if (RazorpayCheckout) {
        const options = {
          description: 'Amigo Premium Access Pass',
          image: '',
          currency: order.currency,
          key: RAZORPAY_KEY_ID,
          amount: order.amount,
          name: 'Amigo',
          order_id: order.id,
          prefill: {
            contact: phoneNumber,
          },
          theme: {color: '#397CEA'},
        };

        try {
          const paymentData = await RazorpayCheckout.open(options);

          const verifyResponse = await verifyRazorpayPayment({
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
          });

          if (verifyResponse?.success) {
            setPaymentStatus('success');
            setTimeout(() => {
              navigation.navigate('RegisterUserScreen' as any, {
                paymentVerified: true,
                phone: phone,
                otpToken: otpToken,
              });
            }, 1500);
          } else {
            setPaymentStatus('failed');
            setErrorMessage(
              'Payment verification failed. Please contact support.',
            );
          }
        } catch (payError: any) {
          if (
            payError?.code === 'PAYMENT_CANCELLED' ||
            payError?.description?.includes('cancelled')
          ) {
            setPaymentStatus('idle');
            setErrorMessage('');
          } else {
            setPaymentStatus('failed');
            setErrorMessage(
              payError?.description ||
                payError?.message ||
                'Payment failed. Please try again.',
            );
          }
        }
      } else {
        Alert.alert(
          'Payment',
          'Razorpay SDK is not available. Please rebuild the app with expo-dev-client after installing react-native-razorpay.',
          [{text: 'OK', onPress: () => setPaymentStatus('idle')}],
        );
      }
    } catch (error: any) {
      console.log('Payment flow error:', error);
      setPaymentStatus('failed');
      if (error?.message?.includes('Network')) {
        setErrorMessage(
          'Network error. Please check your connection and try again.',
        );
      } else {
        setErrorMessage(
          error?.response?.data?.error ||
            error?.message ||
            'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterInviteCode = () => {
    navigation.navigate('EnterVerifyCodeScreen', {phone, otpToken});
  };

  const floatAnim = useRef(new Animated.Value(0)).current;

  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[{ flex: 1 }, enterStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <BackArrow />
        </TouchableOpacity>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Animated.View
                style={[styles.crownCircle, {transform: [{rotate}]}]}>
                <Crown size={30} color="#397CEA" strokeWidth={1} />
              </Animated.View>
            </View>

            <Text style={styles.title}>Premium Access Pass</Text>

            <Text style={styles.description}>
              One-time access to create your Amigo account.
            </Text>

            <Text style={styles.price}>
              {'\u20B9'}
              {PAYMENT_AMOUNT}
            </Text>

            <Text style={styles.paymentType}>One-time payment</Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <CheckCircle size={20} color="#397CEA" strokeWidth={2.5} />
                <Text style={styles.benefitText}>Instant account creation</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={20} color="#397CEA" strokeWidth={2.5} />
                <Text style={styles.benefitText}>No waiting for invites</Text>
              </View>
              <View style={styles.benefitItem}>
                <CheckCircle size={20} color="#397CEA" strokeWidth={2.5} />
                <Text style={styles.benefitText}>One-time payment</Text>
              </View>
            </View>

            {paymentStatus === 'success' && (
              <View style={styles.statusContainer}>
                <CheckCircle size={24} color="#22C55E" strokeWidth={2.5} />
                <Text style={styles.successText}>
                  Payment successful! Redirecting...
                </Text>
              </View>
            )}

            {paymentStatus === 'failed' && errorMessage ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.paymentButton,
                (isLoading || paymentStatus === 'success') &&
                  styles.paymentButtonDisabled,
              ]}
              onPress={handleContinueToPayment}
              activeOpacity={0.8}
              disabled={isLoading || paymentStatus === 'success'}>
              <LinearGradient
                colors={
                  paymentStatus === 'success'
                    ? ['#22C55E', '#16A34A']
                    : ['#397CEA', '#397CEA']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientButton}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : paymentStatus === 'success' ? (
                  <Text style={styles.paymentButtonText}>
                    Payment Verified!
                  </Text>
                ) : (
                  <Text style={styles.paymentButtonText}>
                    Continue to Payment
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inviteCodeLink}
              onPress={handleEnterInviteCode}
              activeOpacity={0.8}>
              <Text style={styles.inviteCodeLinkText}>
                Have an invite code?{' '}
                <Text style={styles.inviteCodeLinkText}>Enter here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PremiumAccessPassScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#100E1C',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#397CEA',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...shadow2,
  },
  iconContainer: {
    marginBottom: 24,
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#397CEA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#100E1C',
    ...shadow2,
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
  description: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  price: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
    color: '#397CEA',
    marginBottom: 8,
    ...shadow,
  },
  paymentType: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#8B8CAD',
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    color: '#8B8CAD',
    flex: 1,
  },
  paymentButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadow,
  },
  paymentButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  paymentButtonText: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  inviteCodeLink: {
    marginTop: 8,
  },
  inviteCodeText: {
    fontFamily: FontFamily.robotoRegular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: '#8B8CAD',
  },
  inviteCodeLinkText: {
    color: '#397CEA',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  successText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#22C55E',
    flex: 1,
  },
  errorText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: 14,
    color: '#EF4444',
    flex: 1,
    textAlign: 'center',
  },
});
