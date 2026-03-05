import {Image, Platform, View, TouchableOpacity} from 'react-native';
import React, {useContext, useState} from 'react';
import {images} from '../../constants/image';
import RNText from '../atoms/text';
import OtpInput from '../atoms/otp-input';
import Button from '../atoms/button';
import fontSize from '../../constants/font-size';
import fontWeight from '../../constants/font-weight';
import {getHeightInPercentage} from '../../utils/dimensions';
import {otpProps} from './data';
import BackgroundContainer from '../atoms/bg-container';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';
import Context from '../../context';
import {Image as FastImage} from 'expo-image';

const OtpComponent = (props: otpProps) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const {colors} = useContext(Context);
  const {onPress, onResend} = props;

  return (
    <BackgroundContainer
      Whitebgwidth={'100%'}
      Whitebgheight={getHeightInPercentage(100)}
      mainchildren={
        <FastImage
          source={images.otp}
          style={styles.image}
          contentFit="contain"
        />
      }
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
            <RNText
              color={colors.textColor}
              alignSelf={'center'}
              label={'Verification code'}
              fontSize={fontSize._32}
              fontWeight={fontWeight._700}
            />
            <RNText
              color={colors.textColor}
              label={
                'Please enter the verification code sent to your given email'
              }
              marginTop={40}
              fontSize={fontSize._17}
              fontWeight={fontWeight._400}
              textAlign={'center'}
              paddingHorizontal={50}
            />
            <OtpInput onOtp={val => setOtp(val)} />
            {error && otp.length == 6 ? null : !error ? null : (
              <RNText
                color={colors.red}
                label={'Please enter the verification code'}
                marginTop={5}
                fontSize={fontSize._17}
                fontWeight={fontWeight._400}
                textAlign={'center'}
                paddingHorizontal={50}
              />
            )}
            <Button
              title="Continue"
              height={60}
              width={'82%'}
              alignSelf="center"
              borderRadius={8}
              color={colors.white}
              backgroundColor={colors.primary}
              borderColor={colors.primary}
              fontWeight={fontWeight._700}
              marginTop={getHeightInPercentage(5)}
              onPress={() => {
                if (otp.length == 6) {
                  onPress(otp);
                } else {
                  setError(true);
                }
              }}
            />
            <TouchableOpacity
              onPress={onResend}
              style={{ marginTop: 25, alignSelf: 'center' }}
              disabled={!onResend}
            >
              <RNText
                color={onResend ? colors.primary : colors.textColor}
                label={'Resend OTP'}
                fontSize={fontSize._20}
                fontWeight={fontWeight._700}
              />
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      }
    />
  );
};

export default OtpComponent;
