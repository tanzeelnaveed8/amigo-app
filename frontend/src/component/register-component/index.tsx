import { Image, Keyboard, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { images } from '../../constants/image';
import { useForm } from 'react-hook-form';
import RNText from '../atoms/text';
import fontSize from '../../constants/font-size';
import fontWeight from '../../constants/font-weight';
import InputField from '../atoms/input-field';
import Button from '../atoms/button';
import { getHeightInPercentage } from '../../utils/dimensions';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerProps, registerSchema } from './data';
import BackgroundContainer from '../atoms/bg-container';
import styles from './styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Context from '../../context';
import MobileIcon from '../../assets/svg/mobile.icon';
import {Image as FastImage} from 'expo-image';
import useNavigationHook from '../../hooks/use_navigation';
import PhoneInput from 'react-native-phone-number-input';
import { SendMsg91Otp } from '../../apis/auth';

const RegisterComponent = (props: registerProps) => {
    const navigation = useNavigationHook()
    const { onSendOTP, error, message } = props
    const { control, formState: { errors }, handleSubmit, setError, clearErrors, setValue } = useForm({ mode: 'onSubmit', resolver: yupResolver(registerSchema) });
    const { setLoader, colors, setToastMsg } = useContext(Context)
    const [isSelect, setIsSelect] = useState(false)
    const phoneInputRef = useRef<PhoneInput>(null)
    const [fullNumber, setFullNumber] = useState<string>('')

    const onSubmit = async (data: any) => {
        Keyboard.dismiss()
        if (isSelect) {
            try {
                // Remove + from phone number
                const phoneWithoutPlus = (fullNumber || data?.phone || '').replace(/^\+/, '')

                // Prepare payload for MSG91 send-otp API
                const msg91Payload = {
                    phone: phoneWithoutPlus,
                    flowType: 'register'
                }

                console.log('MSG91 Send OTP - Payload:', JSON.stringify(msg91Payload, null, 2))

                // Call MSG91 send-otp API
                const msg91Response = await SendMsg91Otp(msg91Payload)
                setToastMsg('Otp sent successfully!')
                console.log('MSG91 Send OTP - Response:', JSON.stringify(msg91Response, null, 2))

                // Prepare payload for onSendOTP (existing flow)
                const payload = {
                    phone: fullNumber || data?.phone,
                }
                // Call onSendOTP which will handle loader and navigation
                onSendOTP(payload as any)
            } catch (error: any) {
                console.log('MSG91 Send OTP - Error:', error)
                setLoader(false)
                setToastMsg('Failed to send OTP. Please try again.')
            }
        } else {
            setToastMsg('Please confirm agreements')
        }
    }

    return (
        <BackgroundContainer
            Whitebgheight={getHeightInPercentage(100)}
            Whitebgwidth={'100%'}
            mainchildren={<FastImage source={images.register} style={styles.image} contentFit='contain' />}
            children={
                <View style={styles.container}>
                    <KeyboardAwareScrollView
                        bounces={true}
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        extraHeight={50}
                        extraScrollHeight={Platform.OS === 'android' ? 100 : 0}
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor: colors.transparent,
                            paddingBottom: 30,
                        }}>
                        <View style={styles.textview}>
                            <RNText color={colors.textColor} label={'Register'} fontSize={fontSize._32} fontWeight={fontWeight._700} />
                            <RNText color={colors.textColor} label={'Lets Get Your Mobile Number Verified'} fontSize={fontSize._17} fontWeight={fontWeight._700} marginVertical={18} />
                            <RNText color={colors.textColor} label={'Please enter your mobile number to receive verification code'} fontSize={fontSize._15} fontWeight={fontWeight._400} />
                        </View>
                        <View style={styles.inputview}>
                            <View style={{ width: '90%', alignSelf: 'center', marginTop: 5, zIndex: 1000 }}>
                                <PhoneInput
                                    ref={phoneInputRef}
                                    defaultCode="IN"
                                    layout="first"
                                    onChangeFormattedText={(text: string) => {
                                        setFullNumber(text)
                                        setValue('phone', text, { shouldValidate: true })
                                    }}
                                    countryPickerProps={{
                                        withFilter: true,
                                        withFlag: true,
                                        withCallingCode: true,
                                        withAlphaFilter: true,
                                        withEmoji: true,
                                    }}
                                    disableArrowIcon={false}
                                    modalProps={{ presentationStyle: 'overFullScreen' }}
                                    containerStyle={{
                                        width: '100%',
                                        borderWidth: 1,
                                        height: getHeightInPercentage(6.5),
                                        borderColor: colors.textinputBorder,
                                        borderRadius: 8,
                                        backgroundColor: colors.white,
                                    }}
                                    flagButtonStyle={{
                                        width: 60,
                                        marginLeft: 5,
                                    }}
                                    textContainerStyle={{
                                        backgroundColor: 'transparent',
                                        paddingVertical: 0,
                                        paddingHorizontal: 0,
                                        borderLeftWidth: 1,
                                        borderLeftColor: colors.textinputBorder,
                                        paddingLeft: 10,
                                    }}
                                    codeTextStyle={{ color: colors.textColor, fontSize: 16 }}
                                    textInputProps={{
                                        keyboardType: 'phone-pad',
                                        placeholder: 'Enter phone number',
                                        placeholderTextColor: '#999',
                                    }}
                                    textInputStyle={{ color: colors.textColor, fontSize: 16, height: 50 }}
                                    withDarkTheme={false}
                                    withShadow={false}
                                />
                            </View>
                            {/* <InputField
                                name={'email'}
                                placeholder={'Enter your email'}
                                height={getHeightInPercentage(7)}
                                width={'90%'}
                                control={control}
                                keyboardType='email-address'
                                errors={errors}
                                borderColor={colors.textinputBorder}
                                borderRadius={8}
                                backgroundColor={colors.white}
                                onChangeText={() => { }}
                                marginTop={5}
                                icon={<MobileIcon />}
                            /> */}

                        </View>
                        <Button
                            title='Send OTP'
                            height={getHeightInPercentage(7)}
                            width={'80%'}
                            alignSelf='center'
                            borderRadius={8}
                            color={colors.white}
                            backgroundColor={colors.primary}
                            borderColor={colors.primary}
                            fontWeight={fontWeight._700}
                            marginTop={15}
                            onPress={handleSubmit(onSubmit)}
                        />
                        <RNText color={colors.textColor} label={'By signing Up.'} fontSize={fontSize._17} fontWeight={fontWeight._700} marginTop={20} alignSelf={'center'} />
                        <TouchableOpacity style={[styles.termsview, { paddingVertical: 15 }]}
                            onPress={() => {
                                navigation.goBack()
                                clearErrors()
                            }}>
                            <Text style={styles.defftext1}>If you alredy have an account<Text style={styles.defftext2}> sign in</Text> </Text>
                        </TouchableOpacity>
                        <View style={styles.termsview}>
                            <Pressable onPress={() => setIsSelect(e => !e)} style={styles.circle} >
                                {isSelect && <View style={styles.selectcircle} />}
                            </Pressable>
                            <Text style={styles.defftext1}>You Agree to the<Text style={styles.defftext2}> Terms of Services</Text> </Text>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            }
        />
    )
}

export default RegisterComponent