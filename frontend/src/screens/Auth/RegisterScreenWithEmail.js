/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, TextInput, Image, Button, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import * as splashstyle from '../../styles/splashstyle';
import { Color, Border, FontFamily, FontSize, Padding } from "../../../GlobalStyles";
import { windowHeight, windowWidth } from '../../styles/commonstyle';
// import LinearGradient from "react-native-linear-gradient";
import { useUserLoginMutation } from '../../store/services/authApi';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { basepath } from '../../basepath';
import { useDispatch, useSelector } from 'react-redux';
const { width, height } = Dimensions.get('window');
import { setIsLoading } from '../../store/slices/userSlice';


const RegisterScreenWithEmail = ({ navigation }) => {
  const isLoading = useSelector(state => state.user.isLoading)
  const dispatch = useDispatch()
  // const [isLoading, setIsLoading] = useState(false)
  const window = useWindowDimensions()
  const [email, setEmail] = useState('')
  const [loginMutation] = useUserLoginMutation();
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = async () => {
    
    dispatch(setIsLoading(true))
    const data = {
      email: email
    }
    console.log({ data });
    await axios.post(`${basepath}user-auth/send-otp`, data).then((res) => {
      dispatch(setIsLoading(false))

      // console.log({ res: res.data.data });
      navigation.navigate('Verification Screen', { email })
      setEmail('')
    }).catch((err) => {
      console.log({ err: err });
      Toast.show({
        type:'info',
        text1:"heloo",
        text2:"Failed to load"
      })
      dispatch(setIsLoading(false))


    })

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
              Lets Get Your Email  Verified
            </Text>
            <Text style={[styles.pleaseEnterYour, styles.yourClr]}>
              Please enter your email to receive verification code
            </Text>

            {/* <View style={styles.inputGroup}>
              <Image
                style={[styles.mdiearthIcon, styles.iconLayout1]}
                resizeMode="cover"
                source={require("../../assets/mdiearth.png")}
              />
              <TextInput
                style={styles.input}
                placeholder="Indian ()+91"
                secureTextEntry
              />
              <Image
                style={[styles.iconamoonarrowUp2Duotone, styles.iconLayout1]}
                resizeMode="cover"
                source={require("../../assets/iconamoonarrowup2duotone.png")}
              />
            </View> */}
            <View style={styles.inputGroup}>
              <Image
                style={[styles.mdiearthIcon, styles.iconLayout1]}
                resizeMode="cover"
                source={require("../../assets/email.png")}
              />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                keyboardType="email-address"
                // autoCapitalize="none"
                value={email}
                onChangeText={(txt) => setEmail(txt)}
              />

            </View>


            <TouchableOpacity style={styles.component2} onPress={handleLogin} >
              {isLoading ?
                <ActivityIndicator size="large" color="#0000ff" />
                :
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
  component1FlexBox: {


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
    top: 2.2 * vh,
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


export default RegisterScreenWithEmail
