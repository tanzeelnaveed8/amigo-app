import React, { useEffect, useState } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { basepath } from '../../basepath';
import Skeleton from 'react-native-reanimated-skeleton';
import ImageView from "react-native-image-viewing";
const UserProfile = ({ navigation }) => {
  const user = useSelector(state => state.user)

  const [getProfiles, setGetProfiles] = useState('')
  const [contLoading, setContentLoading] = useState(false)
  const [images, setImages] = useState('')
  const [visible, setIsVisible] = useState(false);
  // console.log({ images });
  useEffect(() => {
    const getUserProfile = async () => {
      setContentLoading(true)
      await axios.get(`${basepath}/user/get-user-profile?userId=${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      ).then((res) => {
        setContentLoading(false)
        setGetProfiles(res.data.data)
        console.log({ profile: res.data.data.userProfile });
        setImages(res.data.data.userProfile)
      }).catch((err) => {
        console.log({ err });
      })
    }
    getUserProfile()
  }, [])

  return (
    <Skeleton
      isLoading={contLoading}

      layout={[
        {
          width: 325,
          height: 325,
          borderRadius: 34,
          marginBottom: 16,
        },
        {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          children: [
            {
              width: 119,
              height: 19,
              borderRadius: 16,
              marginBottom: 8,
            },
            {
              width: 234,
              height: 42,
              borderRadius: 16,
            },
          ],
        },
      ]}
    >
      <SafeAreaView style={[styles.container, user.isDarkMode && { backgroundColor: "#0D142E" }]} >
        <View style={styles.top}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
          <TouchableOpacity style={styles.profile} onPress={() => setIsVisible(true)} >
            <Image
              style={{ height: 60, width: 60, overflow: "hidden", borderWidth: 2, borderColor: "#9B7BFF", borderRadius: 30 }}
              resizeMode="cover"
              source={{ uri: getProfiles?.userProfile }}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 22, color: 'white', paddingVertical: 10, fontWeight: "700" }} >{getProfiles?.firstName + " " + getProfiles?.lastName}</Text>
          <View style={styles.mediacontainer} onPress={() => navigation.navigate('Call Video')} >
            <TouchableOpacity style={styles.mediaitem} onPress={() => navigation.navigate('Call Video')} >
              <Image source={require('../../assets/phone.png')} style={{ height: 50, width: 50, tintColor: "#fff" }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaitem}>
              <Image source={require('../../assets/video.png')} style={{ height: 50, width: 50, tintColor: "#fff" }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaitem} onPress={() => navigation.navigate('User Media')} >
              <Image source={require('../../assets/media.png')} style={{ height: 50, width: 50, tintColor: "#fff" }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaitem} onPress={() => navigation.navigate('User Media')} >
              <Image source={require('../../assets/share1.png')} style={{ height: 50, width: 50, tintColor: "#fff" }} />
            </TouchableOpacity>
          </View>
          <View style={{ width: "100%", paddingHorizontal: 30, marginVertical: 20 }}>
            <View style={styles.bio}>
              <Text style={{ color: "white", fontWeight: "600" }}>Bio</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                {getProfiles?.bio}
              </Text>
            </View>
          </View>


        </View>
        
      </SafeAreaView>
      <ImageView
        images={[
          {
            uri:images
          }
        ]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
      />
    </Skeleton>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#009cf4',
    height: '100%',
    width: '100%',
    flex: 1
  },
  top: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60
  },
  profileContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    // height:"50%",
    // backgroundColor:"black",
  },
  mediacontainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginTop: 10
  },
  bio: {
    width: "100%",
    height: "auto",
    borderWidth: 2,
    padding: 5,
    borderRadius: 10,
    borderColor: "#06eeeff2",
    backgroundColor: "#00000042",
    padding: 20
  },
  btm: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 20
  },
  messageStructure: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    width: "100%",
    paddingHorizontal: 20,
    // marginTop:10
  },
  userStructure: {
    display: 'flex',
    flexDirection: 'row',
  },
  avatarImg: {
    position: 'relative',
  },
  nameLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  ashishTypo: {
    //width: 144,
    color: 'white',
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    textAlign: "left",
    fontSize: 16,
    // position: "absolute",
  },
  timeLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },

})

export default UserProfile