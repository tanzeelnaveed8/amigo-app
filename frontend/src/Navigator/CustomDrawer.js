import React, { useState } from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { removeAccessToken } from '../AsyncStorage';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/userSlice';
// import { Image } from 'react-native-reanimated/lib/typescript/Animated';
import ImageView from "react-native-image-viewing";

const { width, height } = Dimensions.get('window');
const CustomDrawer = (props) => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [visible, setIsVisible] = useState(false);
  const handleLogout = async () => {
    await removeAccessToken('token').then((res) => {
      dispatch(logout())
      navigation.navigate('Splash Screen')
    }).catch((err) => {
      Alert.alert('Failed to Logout . Try again')
    })
  }

  return (
    <DrawerContentScrollView {...props} style={[user.isDarkMode && { backgroundColor: "#000" }]}  >
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={()=>setIsVisible(true)} >
          <Image source={{ uri: user.userProfile }} style={{ height: 80, width: 80, borderRadius: 40 }} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{user?.name}</Text>
        <Text style={{ color: "white" }} >{user?.userName}</Text>
      </View>
      <View style={styles.list} >
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('New Message')} >
          <View style={styles.iconText} >
            <Image source={require("../assets/contact.png")} style={[styles.img, { tintColor: "#fff" }]} />
          </View>
          <Text style={[user.isDarkMode ? styles.darktext : styles.text]} >Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Call Video')}>
          <View style={styles.iconText} >
            <Image source={require("../assets/ph_phone-call.png")} style={[styles.img, { tintColor: "#fff" }]} />
          </View>
          <Text style={[user.isDarkMode ? styles.darktext : styles.text]}>Call & Video call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Setting')}>
          <View style={styles.iconText} >
            <Image source={require("../assets/setting.png")} style={[styles.img, { tintColor: "#fff" }]} />
          </View>
          <Text style={[user.isDarkMode ? styles.darktext : styles.text]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('User Media')}>
          <View style={styles.iconText} >
            <Image source={require("../assets/sharess.png")} style={[styles.img, { tintColor: "#fff" }]} />
          </View>
          <Text style={[user.isDarkMode ? styles.darktext : styles.text]}>Share it</Text>
        </TouchableOpacity>
      </View>
      <View style={[user.isDarkMode ? { backgroundColor: "#fff", width: "60%", height: 2, marginTop: 15 * vh, marginLeft: 20 } : styles.borderline]} />
      {/* <DrawerItemList {...props} /> */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout()}>
        <Image source={require("../assets/logout.png")} style={[user.isDarkMode && { tintColor: "#fff" }, { height: 40, width: 40, marginRight: 15 }]} />
        <Text style={[user.isDarkMode ? { color: "#fff" } : styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
      <ImageView
        images={[
          {
            uri:user.userProfile
          }
        ]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </DrawerContentScrollView>
  )
}
const vw = width / 100;
const vh = height / 100;
const styles = StyleSheet.create({
  drawerHeader: {
    width: "100%",
    backgroundColor: '#009cf4',
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30
  },
  headerText: {
    color: "white",
    fontWeight: "700",
    fontSize: 22
  },
  list: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 20
  },
  item: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 60,
  },
  iconText: {
    height: 40,
    width: 40,
    backgroundColor: '#9B7BFF',
    borderRadius: 25,
    padding: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    paddingLeft: 15
  },
  darktext: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    paddingLeft: 15
  },
  img: { height: 25, width: 25 },
  logoutButton: {
    marginTop: 6 * vh,
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
  },
  logoutText: {
    fontSize: 20,
    fontWeight: "700",
    color: "black"
  },
  borderline: {
    width: "60%",
    height: 2,
    backgroundColor: "#000000",
    marginTop: 15 * vh,
    marginLeft: 20
  }
})

export default CustomDrawer