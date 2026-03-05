import { yupResolver } from '@hookform/resolvers/yup';
import { useRoute } from '@react-navigation/native';
import {
    ArrowLeft,
    AtSign,
    Camera,
    CheckCircle2,
    Mail,
    Plus,
    Sparkles,
    User,
} from 'lucide-react-native';
import React, { useCallback, useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Image,
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
import * as ExpoImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';

import { FontFamily } from '../../../../../GlobalStyles';
import { CreateUser, SendEmailOtp, VerifyEmailOtp } from '../../../../apis/auth';
import EmailVerificationModal from '../../../../components/EmailVerificationModal';
import { shadow, shadow2 } from '../../../../constants/shadows';
import Context from '../../../../context';
import useNavigationHook from '../../../../hooks/use_navigation';

const schema = yup.object().shape({
  displayName: yup.string().required('Display name is required').min(2),
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  email: yup.string().email('Invalid email address'),
});

const RegisterUserScreen = () => {
  const navigation = useNavigationHook();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const {phone, inviteData, otpToken, inviteCode, paymentVerified} = route.params || {};
  const {setLoader, setToastMsg, loader} = useContext(Context);

  const [image, setImage] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
    },
  });

  const {mutate} = useMutation(CreateUser, {
    onSuccess: res => {
      console.log('CREATE_USER_SUCCESS:', res);
      setLoader(false);

      if (res.status === 201) {
        setToastMsg('Account created successfully! Please login.');
        navigation.reset({
          index: 0,
          routes: [{name: 'ChooseModeScreen' as any}],
        });
      } else {
        setToastMsg(res.message || 'User creation failed');
      }
    },
    onError: (error: any) => {
      console.log('CREATE_USER_ERROR:', error);
      setLoader(false);
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong';
      setToastMsg(errorMessage);
    },
  });

  const OpenGallery = useCallback(async () => {
    try {
      const {status} = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setToastMsg('Please allow gallery access in settings');
        return;
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImage({
          path: asset.uri,
          uri: asset.uri,
          mime: asset.mimeType || 'image/jpeg',
          width: asset.width,
          height: asset.height,
        });
      }
    } catch (err) {
      console.log('Image picker error:', err);
    }
  }, []);

  const handleContinue = async (data: any) => {
    if (!image) {
      setToastMsg('Please select a profile picture');
      return;
    }

    setLoader(true);
    // let fcmToken = await AsyncStorage.getItem('FCMToken');

    const formData = new FormData();
    const nameParts = data.displayName.trim().split(' ');
    formData.append('firstName', nameParts[0] || '');
    formData.append('lastName', nameParts.slice(1).join(' ') || '');
    formData.append('userName', data.username.trim());
    formData.append('email', data.email?.trim() || '');
    formData.append('phone', phone || '');
    formData.append('password', '123456'); // Temporary password
    formData.append('otpToken', otpToken || inviteData?.otpToken || '');
    formData.append('emailVerified', isEmailVerified.toString());

    if (inviteCode) {
      formData.append('inviteCode', inviteCode);
    }
    if (paymentVerified) {
      formData.append('paymentVerified', 'true');
    }

    if (image) {
      formData.append('images', {
        uri: image.path,
        type: image.mime,
        name: 'profile_image.jpg',
      } as any);
    }

    mutate(formData);
  };

  const handleSendEmailOtp = async (email: string) => {
    setIsSendingOtp(true);
    try {
      await SendEmailOtp({email: email.trim()});
      setShowVerificationModal(true);
    } catch (error: any) {
      setToastMsg(
        error?.response?.data?.message ||
          'Failed to send verification code. Please try again.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async (otp: string) => {
    const emailValue = control._formValues.email;
    const response = await VerifyEmailOtp({
      email: emailValue.trim(),
      otp: otp,
    });
    if (response?.verified) {
      setIsEmailVerified(true);
      setToastMsg('Email verified successfully!');
    }
  };

  const handleResendEmailOtp = async () => {
    const emailValue = control._formValues.email;
    await SendEmailOtp({email: emailValue.trim()});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1}}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}>
                <ArrowLeft color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <View style={styles.almostThereContainer}>
                <Sparkles color="#397CEA" size={20} />
                <Text style={styles.almostThereText}>Almost there!</Text>
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Create your</Text>
              <Text style={[styles.title, {color: '#397CEA'}]}>
                Amigo profile
              </Text>
              <Text style={styles.subtitle}>Let's make you stand out</Text>
            </View>

            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={OpenGallery} activeOpacity={0.8}>
                <View style={[styles.imageCircle, shadow2]}>
                  {image ? (
                    <Image
                      source={{uri: image.path}}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Camera color="#397CEA" size={40} />
                  )}
                </View>
                <View style={styles.plusButton}>
                  <Plus color="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Controller
                control={control}
                name="displayName"
                render={({field: {onChange, onBlur, value}}) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.displayName && styles.inputError,
                    ]}>
                    <User color="#397CEA" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Display Name"
                      placeholderTextColor="#5E607E"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                    />
                  </View>
                )}
              />
              {errors.displayName && (
                <Text style={styles.errorText}>
                  {errors.displayName.message}
                </Text>
              )}

              <Controller
                control={control}
                name="username"
                render={({field: {onChange, onBlur, value}}) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.username && styles.inputError,
                    ]}>
                    <AtSign
                      color="#397CEA"
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#5E607E"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                    />
                  </View>
                )}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}

              <Controller
                control={control}
                name="email"
                render={({field: {onChange, onBlur, value}}) => (
                  <View
                    style={[
                      styles.inputContainer,
                      errors.email && styles.inputError,
                    ]}>
                    <Mail color="#397CEA" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email (optional)"
                      placeholderTextColor="#5E607E"
                      onBlur={onBlur}
                      onChangeText={text => {
                        onChange(text);
                        if (isEmailVerified) {
                          setIsEmailVerified(false);
                        }
                      }}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isEmailVerified}
                    />
                    {isEmailVerified ? (
                      <CheckCircle2 color="#397CEA" size={24} />
                    ) : value && !errors.email ? (
                      <TouchableOpacity
                        onPress={() => handleSendEmailOtp(value)}
                        disabled={isSendingOtp}>
                        {isSendingOtp ? (
                          <ActivityIndicator size="small" color="#397CEA" />
                        ) : (
                          <Text style={styles.verifyText}>Verify</Text>
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Sparkles color="#397CEA" size={16} />
              </View>
              <Text style={styles.infoText}>
                Your username is unique to you and can't be changed later.
                Choose wisely!
              </Text>
            </View>
          </KeyboardAwareScrollView>

          {/* Bottom Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isValid && styles.continueButtonDisabled,
              ]}
              onPress={handleSubmit(handleContinue)}
              disabled={loader}>
              {loader ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        visible={showVerificationModal}
        email={control._formValues.email || ''}
        onClose={() => setShowVerificationModal(false)}
        onVerifySuccess={() => {
          setIsEmailVerified(true);
        }}
        onVerifyEmail={handleVerifyEmailOtp}
        onResendOtp={handleResendEmailOtp}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  almostThereContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  almostThereText: {
    color: '#397CEA',
    fontSize: 16,
    fontFamily: FontFamily.robotoMedium,
  },
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: FontFamily.robotoBold,
    color: '#FFFFFF',
    lineHeight: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FontFamily.robotoRegular,
    color: '#8A8BAB',
    marginTop: 12,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#171729',
    borderWidth: 1,
    borderColor: '#397CEA',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  plusButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#397CEA',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A0A14',
    ...shadow2,
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11111F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F3D',
    height: 56,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamily.robotoRegular,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#171729',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F1F3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    color: '#8A8BAB',
    fontSize: 14,
    fontFamily: FontFamily.robotoRegular,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 4,
    marginLeft: 4,
  },
  verifyText: {
    color: '#397CEA',
    fontSize: 16,
    fontFamily: FontFamily.robotoMedium,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    paddingTop: 10,
    backgroundColor: '#0A0A14',
  },
  continueButton: {
    backgroundColor: '#225DE5',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FontFamily.robotoBold,
  },
});

export default RegisterUserScreen;
