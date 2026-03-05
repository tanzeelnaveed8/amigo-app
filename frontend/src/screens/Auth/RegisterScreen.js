/* eslint-disable prettier/prettier */
import React, { useRef, useState } from 'react';
import { View, TextInput, Image, Button, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import * as splashstyle from '../../styles/splashstyle';
import { Color, Border, FontFamily, FontSize, Padding } from "../../../GlobalStyles";
import { windowHeight, windowWidth } from '../../styles/commonstyle';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, setPhones } from '../../store/slices/userSlice';
import axios from 'axios';
import { basepath } from '../../basepath';
import Toast from 'react-native-toast-message';
// import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get('window');


const RegisterScreen = ({ navigation }) => {
  const user = useSelector(state => state.user)
  const [phone, setPhone] = useState('')
  const [fullNumber, setFullNumber] = useState('')
  const phoneInputRef = useRef(null)
  const [errors, setErrors] = useState({ phone: false });
  const [err, setErr] = useState('')
  const dispatch = useDispatch()
  const window = useWindowDimensions()
  const handleLogin = async () => {
    dispatch(setIsLoading(true))
    let valid = true;
    let newErrors = { userName: false, password: false };

    if (phone === '') {
      newErrors.phone = true;
      valid = false;
    }

    setErrors(newErrors);
    // phone format validation using the phone input ref if available
    const isValid = phoneInputRef.current?.isValidNumber?.(fullNumber || phone)
    if (valid && (isValid === undefined || isValid)) {
      dispatch(setIsLoading(true))
      const data = { phone: fullNumber || phone }
      console.log({ data });
      await axios.post(`${basepath}user-auth/send-otp`, data).then((res) => {
        dispatch(setIsLoading(false))
        dispatch(setPhones(fullNumber || phone))

        console.log({ res: res.data });
        if (res.data.status === 201) {
          Toast.show({
            type: "success",
            text1: fullNumber || phone,
            text2: 'OTP Sent Successfully'
          })
          navigation.navigate('Verification Screen', { phone: fullNumber || phone })
        } else {
          setErr(res.data.message)
        }
        // 
        setPhone('')
      }).catch((err) => {
        console.log({ err: err });
        Toast.show({
          type: 'error',
          text1: fullNumber || phone,
          text2: "Failed to sent otp"
        })
        dispatch(setIsLoading(false))


      })
    } else if (valid && isValid === false) {
      Toast.show({ type: 'error', text1: 'Invalid phone number' })
      dispatch(setIsLoading(false))
    }


  }

  return (
    <>

      <ScrollView style={{ height: window.height, width: window.width }}

      >
        <View
          style={styles.container}
        >

          <View
            style={[styles.vectorParent, styles.notiLayout]}


          >
            <Image
              style={styles.vectorIcon}
              resizeMode="cover"
              source={require("../../assets/vector22.png")}
            />
            <Image
              style={styles.frameItem}
              resizeMode="cover"
              source={require("../../assets/frame-184748.png")}
            />
            <Image
              style={[styles.frameInner, styles.frameLayout]}
              resizeMode="cover"
              source={require("../../assets/ellipse-204.png")}
            />

          </View>
          <View style={styles.childFrameLayout}>



            <Text style={[styles.register, styles.notiPosition]}>Register</Text>
            <Text
              style={[styles.letsGetYour, styles.yourClr]}
            >
              Lets Get Your Mobile Number Verified
            </Text>
            <Text style={[styles.pleaseEnterYour, styles.yourClr]}>
              Please enter your mobile number to receive verification code
            </Text>

            <View style={[styles.inputGroup, { zIndex: 1000 }] }>
              <PhoneInput
                ref={phoneInputRef}
                defaultCode="IN"
                layout="second"
                onChangeFormattedText={(text) => setFullNumber(text)}
                onChangeCountry={(country) => {
                  // keep latest formatted number consistent with country change
                  const current = phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero()?.formattedNumber
                  if (current) setFullNumber(current)
                }}
                disableArrowIcon={false}
                countryPickerProps={{ withFilter: true }}
                modalProps={{ presentationStyle: 'overFullScreen' }}
                containerStyle={{ width: '100%', borderWidth: 2, borderColor: Color.colorGray_100, borderRadius: 5, backgroundColor: 'transparent', zIndex: 1000, elevation: 10 }}
                textContainerStyle={{ backgroundColor: 'transparent', paddingVertical: 0, paddingHorizontal: 0 }}
                codeTextStyle={{ color: Color.colorBlack }}
                textInputProps={{ keyboardType: 'phone-pad', placeholder: '9999....', placeholderTextColor: '#000' }}
                textInputStyle={{ color: Color.colorBlack, fontSize: FontSize.size_lg }}
                withDarkTheme={false}
                withShadow={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <Image
                style={[styles.mdiearthIcon, styles.iconLayout1]}
                resizeMode="cover"
                source={require("../../assets/icbaselinephoneiphone.png")}
              />
              <TextInput
                style={[styles.input, errors.phone && styles.errorBorder]}
                placeholder="9999...."
                keyboardType="numeric"
                value={phone}
                onChangeText={(txt) => {
                  setPhone(txt)
                  const formatted = phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero()?.formattedNumber
                  if (formatted) setFullNumber(formatted)
                }}
                placeholderTextColor="#000"
              />
              {errors.phone && <Text style={{ color: "red" }} >Enter 10 digits Phone Number</Text>}
              {err !== '' && <Text style={{ color: "red" }} >{err}</Text>}
            </View>


            <TouchableOpacity style={styles.component2} onPress={() => handleLogin()}>
              {
                user.isLoading ? <ActivityIndicator size="large" /> :
                  <Text style={styles.button}>Send OTP</Text>
              }

            </TouchableOpacity>

            <Text style={[styles.bySigningUp, styles.bySigningUpTypo]}>
              By signing Up.
            </Text>
            <View style={styles.termslayout}>
              <Image
                //  style={[styles.frameChild, styles.frameLayout]}
                resizeMode="cover"
                source={require("../../assets/ellipse-833.png")}
              />
              <Text style={[styles.youAgreeToContainer, styles.bySigningUpTypo]}>
                <Text style={styles.youAgreeTo}>You Agree to the</Text>
                <Text style={styles.termsOfServices}> Terms of Services</Text>
              </Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </>
  )
}

const vw = width / 100;
const vh = height / 100;


const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.colorCornflowerblue_100,
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',
    height: windowHeight

  },
  errorBorder: {
    borderColor: "red"

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
    textAlign: "left",
    // position: "absolute",
  },
  notiPosition: {
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
    fontSize: FontSize.size_sm,
    textAlign: "center",
    fontWeight: "700",
    // position: "absolute",
  },
  frameLayout: {
  },
  notiLayout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
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
    fontSize: 24,
    color: Color.colorGray_500,
    textAlign: "left",
    // position: "absolute",
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
  },
  letsGetYour: {
    //top: 53,
    fontSize: FontSize.size_sm,
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
    marginTop: 2 * vh,
    //left: 0,
  },
  pleaseEnterYour: {
    //top: 92,
    fontSize: FontSize.size_xs,
    display: "flex",
    fontFamily: FontFamily.robotoRegular,
    color: Color.colorBlack,
    alignItems: "center",
    marginTop: 1 * vh,
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
    marginTop: 4 * vh,

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
    height: 100
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
    paddingHorizontal: 4 * vh,
    paddingTop: 5 * vh,

    // width: 308,
    // position: "absolute",
  },
  input: {
    width: '100%',
    paddingHorizontal: 5 * vh,
    borderWidth: 2,
    // borderColor: '#ccc',
    borderRadius: 5,
    borderColor: Color.colorGray_100,
    color: Color.colorBlack,
    fontSize: FontSize.size_lg,

  },
  inputGroup: {
    display: 'flex',
    alignContent: 'center',
    marginTop: 3 * vh,
  },
  termslayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1 * vh,
  }
});


export default RegisterScreen
