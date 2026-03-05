import React, { useEffect, useState } from 'react';
import { View, TextInput, Image, Button, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
// import { ImageBackground, SafeAreaView, Text, View, StyleSheet, Image, StatusBar, } from 'react-native'
// import {styles} from '../styles/splashstyle';
import * as splashstyle from '../../styles/splashstyle';
import { Border, FontSize, Color, FontFamily } from "../../../GlobalStyles";
import { windowHeight, windowWidth } from '../../styles/commonstyle';
import { getAccessToken } from '../../AsyncStorage';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, setToken } from '../../store/slices/userSlice';
import { launchImageLibrary } from '../../utils/imagePickerCompat';

import axios from 'axios';
import { basepath } from '../../basepath';
import { useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const Profile = ({ navigation }) => {
  const user = useSelector(state => state.user)
  // console.log({ tokensssss: user.token });

  const dispatch = useDispatch()
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  // console.log({lname});
  const [username, setUserName] = useState('')
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({ fname: false, lname: false, username: false, bio: false, bio: false });
  // console.log({fileInfo});
  // console.log({ fname,lname,username,bio,password });
  const handleSubmit = async () => {
    // Alert.alert('fdgdd')
    dispatch(setIsLoading(true))
    let valid = true;
    // let newErrors = { fname: false, lname: fileInfo, username: false, bio: false, password: false };

    if (fname === '') {
      errors.fname = true;
      valid = false;
    }
    if (lname === '') {
      errors.lname = true;
      valid = false;
    }

    if (username === '') {
      errors.username = true;
      valid = false;
    }
    if (bio === '') {
      errors.bio = true;
      valid = false;
    }
    if (password === '') {
      errors.password = true;
      valid = false;
    }
    // setErrors(newErrors);

    if (valid) {
      const formData = new FormData()
      formData.append('firstName', fname)
      formData.append('lastName', lname)
      formData.append('bio', bio)
      formData.append('userName', username)
      formData.append('password', password)
      formData.append('images', {
        uri: fileInfo[0].uri,
        type: fileInfo[0].type,
        name: fileInfo[0].fileName
      })

      await axios.post(`${basepath}user-auth/create-userinfo`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        }
      }).then((res) => {
        console.log({ profile: res.data });
        if (res?.data?.status === 201) {
          navigation.navigate('Acount Type')

        }
        dispatch(setIsLoading(false))

      }).catch((err) => {
        dispatch(setIsLoading(false))

        console.log({ err: err });
      })
    }


  };


  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('Image picker error: ', response.error);
      } else {
        let imageUri = response.uri || response.assets?.[0]?.uri;
        // console.log({response:response.assets});
        // await UploadImage(response.assets)
        setFile(imageUri)
        setFileInfo(response.assets);
      }
    });
  };



  return (
    <>
      <SafeAreaView
        style={styles.container}
      >
        <ScrollView  >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>


              <Image
                style={styles.epbackIcon}
                resizeMode="cover"
                source={require("../../assets/epback.png")}
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Profile Details</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.imageLayout}
            onPress={() => openImagePicker()}
          >
            {
              file === null ?
                <Image
                  style={styles.frameItem}
                  resizeMode="cover"
                  source={require("../../assets/ellipse.png")}
                />
                :
                <Image style={styles.frameItem}
                  resizeMode="cover"
                  source={{ uri: file }}
                />
            }



          </TouchableOpacity>
          <View style={styles.childFrameLayout}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.fname && styles.errorBorder]}
                placeholder="First Name"
                placeholderTextColor='gray'
                value={fname}
                onChangeText={(txt) => setFName(txt)}
              />
              {errors.fname && <Text style={{ color: 'red' }} >First Name is required</Text>}

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lname && styles.errorBorder]}
                placeholder="Last Name"
                placeholderTextColor='gray'

                value={lname}
                onChangeText={(txt) => setLName(txt)}
              // keyboardType="email-address"
              />
              {errors.lname && <Text style={{ color: 'red' }} >Last Name is required</Text>}

            </View>
            {/* <View style={styles.childComp}> */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, errors.bio && styles.errorBorder]}
                placeholder="Bio"
                placeholderTextColor='gray'

                value={bio}
                onChangeText={(txt) => setBio(txt)}
              // secureTextEntry
              />
              {errors.bio && <Text style={{ color: 'red' }} >Bio is required</Text>}

            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, errors.username && styles.errorBorder]}
                placeholder="User Name"
                placeholderTextColor='gray'

                value={username}
                onChangeText={(txt) => setUserName(txt)}
              // secureTextEntry
              />
              {errors.username && <Text style={{ color: 'red' }} >User Namw is required</Text>}

            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.errorBorder]}
                placeholder="Password"
                placeholderTextColor='gray'

                value={password}
                onChangeText={setPassword}
              // secureTextEntry
              />
              {errors.password && <Text style={{ color: 'red' }} >Password is required</Text>}
            </View>


            <TouchableOpacity style={styles.component2} onPress={() => handleSubmit()}>
              {
                user.isLoading ? <ActivityIndicator size="large" /> : <Text style={styles.button}>Done</Text>
              }

            </TouchableOpacity>
            {/* </View> */}
          </View>

        </ScrollView>

      </SafeAreaView>

    </>
  )
}
const vw = width / 100;
const vh = height / 100;


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    //paddingTop: StatusBar.currentHeight,
    // height: windowWidth,
    //width: windowHeight,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#009cf4',


  },
  errorBorder: {
    borderColor: "red"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    // borderColor: Color.colorWhite,
    // borderWidth: 1,
    marginVertical: 4 * vh,
    paddingHorizontal: 2 * vh,
  },
  imageLayout: {
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center"
  },
  title: {
    // fontSize: 24,
    // marginBottom: 20,
    color: Color.colorWhite,
    fontSize: FontSize.size_5xl,
    width: 43 * vh,
    // borderColor: Color.colorWhite,
    // borderWidth: 1,
    textAlign: 'center'
  },
  inputGroup: {
    // width: width * 0.9,
    marginBottom: 3 * vh,
  },
  label: {
    fontSize: FontSize.size_base,
    // marginBottom: 5,
    color: Color.colorBlack,
    marginBottom: 1 * vh,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 2,
    // borderColor: '#ccc',
    borderRadius: 5,
    borderColor: Color.colorBlack,
    color: Color.colorBlack,
    fontSize: FontSize.size_lg,
  },
  childComp: {
    padding: 20,
  },

  nameTypo: {
    color: Color.colorBlack,
    fontSize: FontSize.size_lg,
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    textAlign: "left",
    position: "absolute",
  },
  childFrameLayout: {
    // height: 55,
    borderRadius: Border.br_20xl,
    backgroundColor: Color.colorWhite,
    height: '100%',
    width: '100%',
    paddingHorizontal: 30,
    paddingTop: 8 * vh,
    marginBottom: 40
    // width: 308,
    // position: "absolute",
  },

  epbackIcon: {
    // borderColor: Color.colorWhite,
    // borderWidth: 1,

  },
  profileDetails: {
    top: 62,
    left: 120,
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    fontSize: FontSize.size_xl,
    textAlign: "left",
    color: Color.colorWhite,
    // position: "absolute",
  },

  frameItem: {
    marginBottom: -5 * vh,
    height: 100,
    width: 110,
    borderRadius: 50

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
  component2: {
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: Border.br_5xs,
    color: '#fff',
    backgroundColor: Color.colorCornflowerblue_100,
    textAlign: 'center',
    marginTop: 2 * vh,
  },
});
export default Profile