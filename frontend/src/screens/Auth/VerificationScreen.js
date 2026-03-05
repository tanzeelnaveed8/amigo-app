/* eslint-disable prettier/prettier */
import React, { useRef, useState } from "react";
import { Image, StyleSheet, View, Text, ScrollView, Dimensions, TextInput, TouchableOpacity, useWindowDimensions, Alert } from "react-native";
import { Color, Border, FontFamily, FontSize, Padding } from "../../../GlobalStyles";

import axios from "axios";
import { basepath } from "../../basepath";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading, setToken } from "../../store/slices/userSlice";
import { setAccessToken } from "../../AsyncStorage";
// import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const VerificationScreen = ({ navigation, route }) => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  
  // Get confirmation from route params (passed from RegisterScreen)
  const { confirmation, phone, email } = route.params || {};
  
  const [verificationCode, setVerificationCode] = useState('');
  const inputRefs = useRef([]);
  const [err, setErr] = useState('')
  const [errors, setErrors] = useState({ verificationCode: false });

  // console.log({ verificationCode });
  const focusInput = (index) => {
    if (index < inputRefs.current.length) {
      inputRefs.current[index].focus();
    }
  };

  const handleChange = (text, index) => {
    // Update verification code
    const newCode = verificationCode.slice(0, index) + text + verificationCode.slice(index + 1);
    setVerificationCode(newCode);

    // Move focus to next input
    if (text.length === 1 && index < inputRefs.current.length - 1) {
      focusInput(index + 1);
    }
  };

  const window = useWindowDimensions()

  const handleVeifyOtp = async () => {
    // let valid = true;
    // let newErrors = { verificationCode: false, };

    // if (verificationCode === '') {
    //     newErrors.verificationCode = true;
    //     valid = false;
    // }
    
    // if (valid) {
    //   dispatch(setIsLoading(true))
      
    //   try {
    //     if (confirmation) {
    //       // Firebase Phone Auth verification (following React Native Firebase docs)
    //       const result = await confirmation.confirm(verificationCode);
    //       console.log('Firebase Phone Auth successful:', result);
          
    //       // Get Firebase ID token for backend user creation
    //       const firebaseToken = await auth().currentUser.getIdToken();
    //       console.log('Firebase ID Token:', firebaseToken);
          
    //       // Create user in backend after successful Firebase verification
    //       const response = await axios.post(`${basepath}user-auth/create-user`, { 
    //         phone: phone, 
    //         email: email,
    //         firebaseVerified: true,
    //         firebaseToken: firebaseToken
    //       });
          
    //       console.log({ res: response.data });
    //       await setAccessToken(response.data.token)
    //       dispatch(setToken(response.data.token))
    //       dispatch(setIsLoading(false))
          
    //       if (response?.data?.status === 201) {
    //         navigation.navigate('Profile')
    //       } else {
    //         setErr(response?.data?.message)
    //       }
    //     } else {
    //       // No confirmation object - this shouldn't happen with Firebase-only flow
    //       setErr('No verification method available')
    //       dispatch(setIsLoading(false))
    //     }
    //   } catch (error) {
    //     dispatch(setIsLoading(false))
    //     console.log('Verification Error:', error);
        
    //     if (error.code === 'auth/invalid-verification-code') {
    //       setErr('Invalid verification code');
    //     } else if (error.code === 'auth/code-expired') {
    //       setErr('Verification code has expired');
    //     } else {
    //       setErr(error.message || 'Verification failed');
    //     }
    //   }
    // }
  }

  return (
    <>


      <ScrollView style={{ height: window.height, width: window.width }}
      >
        <View
          style={styles.container}
        >

          <View>
            <Image
              style={styles.login1Icon}
              resizeMode="cover"
              source={require("../../assets/login.png")}

            />
          </View>
          <View style={styles.childFrameLayout}>

            <Text style={[styles.register, styles.notiPosition]}> Verification code</Text>

            <Text style={[styles.pleaseEnterYour, styles.yourClr]}>
              Please enter the verification code sent to your given mobile number
            </Text>

            <View style={styles.inputGroup}>

              {[...Array(6)].map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.input, errors.verificationCode && styles.erroBoarder]}
                  placeholder=""
                  // secureTextEntry
                  keyboardType="numeric"
                  maxLength={1}
                  value={verificationCode[index] || ''}
                  onChangeText={(text) => handleChange(text, index)}
                />
              ))}

            </View>
            {
              err !== '' && <Text style={{ color: "red" }} >{err}</Text>
            }

            <TouchableOpacity style={styles.component2} onPress={() => handleVeifyOtp()}>
              <Text style={styles.button}>Continue</Text>
            </TouchableOpacity>

            <Text style={[styles.bySigningUp, styles.bySigningUpTypo]}>
              Resend OTP
            </Text>
          </View>

        </View>

      </ScrollView>
    </>
  );
};

const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.colorCornflowerblue_100,
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',

  },
  erroBoarder: {
borderColor:"red"

  },
  login1Icon: {
    marginVertical: 8.5 * vh,
    width: 190,
    height: 210
  },

  component2: {
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: Border.br_5xs,
    color: '#fff',
    backgroundColor: Color.colorCornflowerblue_100,
    textAlign: 'center',
    marginTop: 3.5 * vh,
  },
  button: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
    fontSize: FontSize.size_xl,
    textAlign: "center",
    color: Color.colorWhite,
    paddingVertical: 1 * vh,
    width: '100%',
  },
  pmFlexBox: {
    textAlign: "left",
    color: Color.colorWhite,
  },
  groupLayout: {
    height: 55,
    width: 308,
    borderWidth: 1,
    borderColor: Color.colorGray_400,
    borderStyle: "solid",
    borderRadius: Border.br_5xs,
    position: "absolute",
  },
  yourClr: {
    color: Color.colorBlack,
    textAlign: "center",
    marginVertical: 3 * vh,
    // position: "absolute",
  },
  notiPosition: {
    marginBottom: 3 * vh,
  },
  iconLayout1: {
    height: 24,
    width: 24,
    position: "absolute",
    overflow: "hidden",
    marginVertical: 'auto'
  },
  bySigningUpTypo: {
    fontFamily: FontFamily.nunitoBold,
    fontSize: FontSize.size_xl,
    textAlign: "center",
    fontWeight: "700",
    // position: "absolute",
  },
  frameLayout: {
  },
  notiLayout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconLayout: {
    width: 22,
    height: 20,
    top: 0,
    position: "absolute",
    overflow: "hidden",
  },
  component1: {
    top: 316,
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    backgroundColor: Color.colorCornflowerblue_100,
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: Border.br_5xs,
    alignItems: "center",
    width: 311,
    position: "absolute",
  },
  groupChild: {
    top: 161,
    left: 3,
  },
  groupItem: {
    top: 232,
    left: 4,
  },
  indian91: {
    fontFamily: FontFamily.robotoRegular,
    color: Color.colorGray_500,
    fontSize: FontSize.size_lg,
    left: 55,
    top: 179,
  },
  register: {
    fontSize: 26,
    color: Color.colorGray_500,
    textAlign: "center",
    // position: "absolute",
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
  },
  letsGetYour: {
    //top: 53,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
    marginTop: 2 * vh,
    //left: 0,
  },
  pleaseEnterYour: {
    //top: 92,
    fontSize: FontSize.size_base,
    display: "flex",
    fontFamily: FontFamily.robotoRegular,
    color: Color.colorBlack,
    alignItems: "center",
    marginTop: 1 * vh,
    justifyContent: 'center'
    // width: 311,
    //  left: 0,
  },
  text: {
    top: 250,
    fontFamily: FontFamily.robotoRegular,
    color: Color.colorGray_500,
    fontSize: FontSize.size_lg,
    left: 55,
  },
  mdiearthIcon: {
    top: 1.5 * vh,
    left: 1 * vh,

  },
  icbaselinePhoneIphoneIcon: {
    top: 248,
    left: 18,
    width: 24,
  },
  iconamoonarrowUp2Duotone: {
    right: 1 * vh,
    top: 1.5 * vh,
  },
  component1Parent: {
  },
  bySigningUp: {
    // top: 431,
    // left: 143,
    color: Color.colorBlack,
    marginTop: 3 * vh,
    marginBottom: 4 * vh

  },
  youAgreeTo: {
    color: Color.colorBlack,
  },
  termsOfServices: {
    color: Color.colorDeepskyblue_100,
  },
  youAgreeToContainer: {
    marginLeft: 1 * vh

  },
  frameChild: {
    top: 449,
    left: 39,
    width: 32,
  },
  groupParent: {
    borderTopLeftRadius: Border.br_31xl,
    borderTopRightRadius: Border.br_31xl,
    backgroundColor: Color.colorWhite,
  },
  vectorIcon: {
  },
  frameItem: {

    marginTop: -5 * vh,
    right: -5 * vh
  },
  frameInner: {

  },
  signal1Icon: {
    left: 270,
  },
  fullBattery1Icon: {
    left: 294,
  },
  pm: {
    top: 2,
    fontSize: FontSize.size_3xs,
    lineHeight: 15,
    fontWeight: "600",
    fontFamily: FontFamily.interSemiBold,
    width: 51,
    left: 0,
    position: "absolute",
  },
  signal1Parent: {
    top: 4,
    left: 29,
    width: 317,
    height: 20,
    position: "absolute",
  },
  noti: {
    backgroundColor: Color.colorBlack,
    height: 28,
    top: 0,
    left: 0,
  },
  vectorParent: {
    // height: 359,
    // backgroundColor: "transparent",
    // top: 0,
    // left: 0,
    paddingVertical: 4 * vh,
  },
  frameIcon: {
    top: 772,
    left: -5,

    height: 18,
  },
  frameParent: {
    borderRadius: Border.br_16xl,
    // backgroundColor: "#018ef0",
    flex: 1,
  },
  childFrameLayout: {
    // height: 55,
    borderRadius: Border.br_31xl,
    backgroundColor: Color.colorWhite,
    height: '100%',
    width: 48 * vh,
    paddingHorizontal: 5 * vh,
    paddingTop: 5 * vh,
    textAlign: 'center'

    // width: 308,
    // position: "absolute",
  },
  input: {
    width: "20%",
    textAlign: "center",
    // paddingHorizontal: 3 * vh,
    // paddingVertical: 2 * vh,
    borderWidth: 2,
    // borderColor: '#ccc',
    borderRadius: 5,
    borderColor: Color.colorBlack,
    color: Color.colorBlack,
    fontSize: FontSize.size_lg,

  },
  inputGroup: {
    display: 'flex',
    alignContent: 'center',
    marginTop: 3 * vh,
    justifyContent: 'space-between',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%'
  },
  termslayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2 * vh,
  }
});

export default VerificationScreen;
