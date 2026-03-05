import React, { useCallback, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, Switch, ScrollView, Alert } from 'react-native'
import { TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import Modal from "react-native-modal";

import { Border, FontSize, Color, FontFamily } from "../../../GlobalStyles";
import axios from 'axios';
import { basepath } from '../../basepath';
import { setUser } from '../../store/slices/userSlice';
import { launchImageLibrary } from '../../utils/imagePickerCompat';
import DocumentPicker from '../../utils/documentPickerCompat';

const Setting = ({ navigation }) => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [data, setData] = useState({
    name: false,
    userName: false,
    bio: false,
    phone: false,
    notification: false,
    darkmode: false

  })
  // console.log({ data });
  const [firstName, setfirstName] = useState(user.firstName)
  const [lastName, setlastName] = useState(user.lastName)
  const [userName, setUserName] = useState(user.userName)
  const [bio, setBio] = useState(user.bio)
  const [isPhoneVisible, setisPhoneVisible] = useState(user.isPhoneVisible)
  const [isNotificationEnable, setisNotificationEnable] = useState(user.isNotificationEnable)
  const [isDarkMode, setisDarkMode] = useState(user.isDarkMode)
  const [acountPrivacy, setAcountPrivacy] = useState(user.acountPrivacy)
  console.log({ acountPrivacy });
  const isPhoneVisibletoggleSwitch = () => setisPhoneVisible(previousState => !previousState);

  const isNotificationEnabletoggleSwitch = () => setisNotificationEnable(previousState => !previousState);
  const isDarkModetoggleSwitch = () => setisDarkMode(previousState => !previousState);
  const [modalVisible, setModalVisible] = useState(false);
  const [file, setFile] = useState(null)

  const UploadImage = async (path) => {
    // setIsImg(true)
    // console.log({path});
    const formData = new FormData()
    // formData.append('conversationId', user.userData.conversationId)
    formData.append('mediaType', 'image')
    formData.append('images', {
      uri: path[0].uri,
      type: path[0].type,
      name: path[0].fileName || path[0].name
    })
    // console.log({formData:formData[0]});
    await axios.post(`${basepath}user-auth/images-upload`, formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "multipart/form-data"
      }
    }).then((res) => {
      // setIsImg(false)
      console.log({ imggggg: res.data });
      console.log({ imggggg1: res.data.data });

      setFile(res?.data?.data)
    }).catch((err) => {
      console.log({ err: err }, '111');
    })
  }
  const handleDocumentSelection = useCallback(async (types) => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types]

      });
      // setMediaModal(false)

      await UploadImage(response)
      //  console.log({response});
      // setFileResponse(response);
      // setFile(response[0].uri)
    } catch (err) {
      console.warn(err);
    }
  }, []);
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
        // setFileInfo(response.assets);
      }
    });
  };
  const updateUserBoolean = () => {
    if (data.phone) {
      isPhoneVisibletoggleSwitch()

    }
    if (data.notification) {
      isNotificationEnabletoggleSwitch()
    }
    if (data.darkmode) {
      isDarkModetoggleSwitch()
    }
    handleUpdateUserProfile()
  }

  const handleUpdateUserProfile = async () => {
    let userData;
    switch (true) {
      case data.name:
        userData = {
          lastName: lastName,
          firstName: firstName
        }
        break;
      case data.userName:
        userData = {
          userName: userName
        }
        break;
      case data.bio:
        userData = {
          bio: bio
        }
        break;
      case data.phone:
        userData = {
          isPhoneVisible: !isPhoneVisible
        }
        break;
      case data.notification:
        userData = {
          isNotificationEnable: !isNotificationEnable
        }
        break;
      case data.darkmode:
        userData = {
          isDarkMode: !isDarkMode
        }
        break;
      default:
        break;
    }

    await axios.patch(`${basepath}user/update-user-profile`, userData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        // "Content-Type":"multipart/form-data"
      }
    }).then((res) => {
      // console.log({ res: res.data.data });
      if (data.name || data.userName || data.bio) {
        setModalVisible(!modalVisible)

      }
      dispatch(setUser(res.data.data))

    }).catch((err) => {
      console.log({ err });
    })

  }
  const handleUpdateProfileImage = async () => {
    await axios.patch(`${basepath}user/update-user-profile`, { userProfile: file.mediaurl }, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        // "Content-Type":"multipart/form-data"
      }
    }).then((res) => {
      dispatch(setUser(res.data.data))
      console.log({ restttt: res.data.data });
      setFile(null)
    }).catch((err) => {
      console.log({ err });
    })
  }
  console.log({ userProfile: user.userProfile });
  return (
    <SafeAreaView style={[styles.container, user.isDarkMode && { backgroundColor: "#0D142E" }]} >
      <View style={styles.top}>
        <TouchableOpacity style={{ marginRight: 50 }} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 22 }}>Settings</Text>
      </View>
      <ScrollView style={[styles.btm, user.isDarkMode && { backgroundColor: "#000" }]}>

        <View style={styles.profile}>
          <TouchableOpacity onPress={() => handleDocumentSelection(DocumentPicker.types.images)} >
            {
              file === null ?
                <Image
                  style={{ height: 70, width: 75, marginRight: 10, borderWidth: 1, borderRadius: 40, borderColor: user.isDarkMode ? "#fff" : "#ddd" }}
                  resizeMode="cover"
                  source={{ uri: user.userProfile }}
                />
                :
                <Image style={{ height: 70, width: 70, borderColor: "#fff", borderWidth: 1, borderRadius: 40, marginRight: 10 }}
                  resizeMode="cover"
                  source={{ uri: file.mediaurl }}
                />
            }
          </TouchableOpacity>
          {/* <Image source={require("../../assets/profile.png")} style={{ width: 80, height: 80, marginRight: 20 }} /> */}
          {
            file === null ?
              <View>
                <Text style={[{ fontWeight: "700", fontSize: 18, color: "black" }, user.isDarkMode && { color: "#fff" }]} >{user?.name}</Text>
                <Text style={user.isDarkMode && { color: "#fff" }} >{user?.userName}</Text>
              </View>
              :
              <TouchableOpacity
                onPress={() => handleUpdateProfileImage()}
                style={{ backgroundColor: "blue", width: "60%", height: 40, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center" }} >
                <Text style={{ color: "#fff", fontWeight: "600" }} >Update Profile</Text>
              </TouchableOpacity>
          }

        </View>



        <View style={styles.acount}>
          <View style={{ width: "10%" }}>
            <Image source={require("../../assets/acount.png")} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={{ width: "80%", paddingLeft: 20 }}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]} >Name</Text>
            <Text style={[{ fontWeight: "600", color: "black" }, user.isDarkMode && { color: "#fff" }]} >{user.name}</Text>

          </View>
          <TouchableOpacity style={{ width: "10%" }} onPress={() => { setData({ name: true }); setModalVisible(true) }} >
            <Image source={require('../../assets/edit.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </TouchableOpacity>
        </View>



        <View style={styles.acount}>
          <View style={{ width: "10%" }}>
            <Image source={require("../../assets/userName.png")} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={{ width: "80%", paddingLeft: 20 }}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]}> Username</Text>
            <Text style={[{ fontWeight: "600", color: "black" }, user.isDarkMode && { color: "#fff" }]} >{user?.userName}</Text>

          </View>
          <TouchableOpacity style={{ width: "10%" }} onPress={() => { setData({ userName: true }); setModalVisible(true) }}>
            <Image source={require('../../assets/edit.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </TouchableOpacity>
        </View>
        <View style={styles.acount}>
          <View style={{ width: "10%" }}>
            <Image source={require("../../assets/bio.png")} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={{ width: "80%", paddingLeft: 20 }}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]} >Bio</Text>
            <Text style={[{ fontWeight: "600", color: "black" }, user.isDarkMode && { color: "#fff" }]} >{user?.bio}</Text>

          </View>
          <TouchableOpacity style={{ width: "10%" }} onPress={() => { setData({ bio: true }); setModalVisible(true) }} >
            <Image source={require('../../assets/edit.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </TouchableOpacity>
        </View>
        <View style={styles.acount}>
          <View style={{ width: "10%" }}>
            <Image source={require("../../assets/phone1.png")} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={{ width: "80%", paddingLeft: 20 }}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]} >Phone</Text>
            <Text style={[{ fontWeight: "500", fontSize: 12, color: "#555" }, user.isDarkMode && { color: "#ccc" }]} >Nobody can see your phone number in any group or channel</Text>

          </View>
          <TouchableOpacity style={{ width: "10%" }}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isPhoneVisible ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => { setData({ phone: true }); updateUserBoolean() }}
              value={isPhoneVisible}
            />
          </TouchableOpacity>
        </View>
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <Text style={[{ fontWeight: '700', fontSize: 18, color: "black" }, user.isDarkMode && { color: "#fff" }]}>Settings</Text>
        </View>

        <View style={styles.setting} >
          <View style={styles.setting1}>
            <Image source={require('../../assets/bell.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={styles.setting2}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]}>Notifications & Sounds</Text>
          </View>
          <View style={styles.setting3}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isNotificationEnable ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => { setData({ notification: true }); updateUserBoolean() }}
              value={isNotificationEnable}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.setting} onPress={() => navigation.navigate('Privacy')} >
          <View style={styles.setting1}>
            <Image source={require('../../assets/lock.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={styles.setting2}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]}>Privacy</Text>
          </View>
          <View style={styles.setting3}>
            {
              acountPrivacy === 'Public Acount' ?
                <Image source={require('../../assets/mdiearth.png')} style={[{ height: 30, width:30 }, user.isDarkMode && { tintColor: "#fff" }]} />
                :
                <Image source={require('../../assets/lock.png')} style={{ height: 40, width: 40,tintColor:'gray' }} />

            }
          </View>
        </TouchableOpacity>
        <View style={styles.setting} >
          <View style={styles.setting1} >
            <Image source={require('../../assets/dark.png')} style={[{ height: 40, width: 40 }, user.isDarkMode && { tintColor: "#fff" }]} />
          </View>
          <View style={styles.setting2}>
            <Text style={[{ color: "black", fontWeight: "600", fontSize: 14 }, user.isDarkMode && { color: "#fff" }]}>Dark Mode</Text>
          </View>
          <View style={styles.setting3}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => { setData({ darkmode: true }); updateUserBoolean() }}
              value={isDarkMode}
            />
          </View>
        </View>

      </ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={[styles.edit, user.isDarkMode && { backgroundColor: "#000", borderColor: "#fff", borderWidth: 1 }]}>
          {/* <TouchableOpacity style={styles.cnlbtn} onPress={() => {
            setModalVisible(false);
          }} >
            <Image style={styles.cancelbtn} source={require('../../assets/iconoircancel.png')} />

          </TouchableOpacity> */}
          {
            data.name &&
            <View>
              <View style={{ marginBottom: 15 }}>
                <Text style={[styles.label, user.isDarkMode && { color: "#fff" }]}>First Name</Text>
                <TextInput
                  style={[styles.input, user.isDarkMode && { borderWidth: 1, borderColor: '#fff', color: "#fff" }]}
                  placeholder="First Name"
                  placeholderTextColor='gray'
                  value={firstName}
                  onChangeText={(txt) => setfirstName(txt)}
                />
              </View>
              <View>
                <Text style={[styles.label, user.isDarkMode && { color: "#fff" }]}>First Name</Text>
                <TextInput
                  style={[styles.input, user.isDarkMode && { borderWidth: 1, borderColor: '#fff', color: "#fff" }]}
                  placeholder="First Name"
                  placeholderTextColor='gray'
                  value={lastName}
                  onChangeText={(txt) => setlastName(txt)}
                />
              </View>
            </View>
          }

          {
            data.userName &&
            <View>
              <Text style={[styles.label, user.isDarkMode && { color: "#fff" }]}>User Name</Text>
              <TextInput
                style={[styles.input, user.isDarkMode && { borderWidth: 1, borderColor: '#fff', color: "#fff" }]}
                placeholder="User Name"
                placeholderTextColor='gray'
                value={userName}
                onChangeText={(txt) => setUserName(txt)}
              />
            </View>
          }

          {
            data.bio &&
            <View>
              <Text style={[styles.label, user.isDarkMode && { color: "#fff" }]}>Bio</Text>
              <TextInput
                style={[styles.input, user.isDarkMode && { borderWidth: 1, borderColor: '#fff', color: "#fff" }]}
                placeholder="Bio"
                placeholderTextColor='gray'
                value={bio}
                onChangeText={(txt) => setBio(txt)}
              />
            </View>
          }

          <TouchableOpacity style={styles.component2} onPress={() => handleUpdateUserProfile()} >
            <Text style={styles.button}>Update </Text>
          </TouchableOpacity>

        </View>
      </Modal>

    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: "100%",
    backgroundColor: '#009cf4',
  },
  edit: {
    width: "80%",
    margin: "auto",
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 30
  },
  component2: {
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: Border.br_5xs,
    color: '#fff',
    backgroundColor: Color.colorCornflowerblue_100,
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: "700",
    fontSize: FontSize.size_xl,
    textAlign: "center",
    color: Color.colorWhite,
    paddingVertical: 10,
    width: '100%',
  },
  cnlbtn: {
    position: "absolute",
    top: 10,
    right: 20,
  },
  cancelbtn: {

    tintColor: "#9B7BFF",
    height: 30,
    width: 30,
    borderColor: '#9B7BFF',
    borderWidth: 2,
    borderRadius: 20
  },
  label: {
    fontSize: FontSize.size_base,
    // marginBottom: 5,
    color: Color.colorBlack,
    marginBottom: 10,
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
  top: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 120
  },
  btm: {
    height: "100%",
    width: '100%',
    backgroundColor: "white",
  },
  profile: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 30
  },
  acount: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20
  },
  setting: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 10
  },
  setting1: {
    width: "10%"
  },
  setting2: {
    width: "80%",
    paddingLeft: 20
  },
  setting3: {
    width: "10%"
  },


})
export default Setting