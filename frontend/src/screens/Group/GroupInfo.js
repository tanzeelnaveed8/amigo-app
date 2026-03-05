import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useSelector } from 'react-redux';
import Modal from "react-native-modal";
import axios from 'axios';
import { basepath, baseurl } from '../../basepath';


const GroupInfo = ({ navigation }) => {
  const group = useSelector(state => state.group)
  const user = useSelector(state => state.user)
  const [selectUser, setSelectUser] = useState('')
  const admin = group?.groupId?.groupAdmin?.some((item) => item === user._id)
  console.log({ admin });
  const [exitModal, setExitModal] = useState(false)
  const [kick, setKick] = useState(false)
  const isGroupAdmin = (userId) => {
    isAdmin = group?.groupId?.groupAdmin?.some((item) => item === userId)
    return isAdmin;
  }
  // console.log({ part: group.groupId.groupAdmin,userId:user._id ,admin});
  const handleOpenUser = (item) => {
    setSelectUser(item)
    setKick(true)
  }
  const handleLeaveGroup = async () => {
    await axios.patch(`${basepath}group/exist-from-group`,
      {
        groupId: group.groupId._id
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    ).then((res) => {
      console.log({ res });
      navigation.navigate('Home')
    }).catch((err) => {
      console.log({ err: err.message });
    })
  }

  const handleKickUser = async () => {
    await axios.patch(`${basepath}group/remove-from-group`, {
      groupId: group.groupId._id,
      userId: selectUser._id
    }, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }).then((res) => {

      setKick(false)

    }).catch((err) => {
      console.log({ err: err.message });
    })
  }

  const handleMakeAdmin = async () => {
    await axios.patch(`${basepath}/group/add-member-in-group-as-an-admin`,
      {
        groupId: group.groupId._id,
        userId: selectUser._id
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    ).then((res) => {
      setKick(false)

    }).catch((err) => {
      console.log({ err: err.message });
    })
  }

  return (
    <SafeAreaView style={[styles.container, user.isDarkMode && { backgroundColor: "#0D142E" }]} >
      <View style={styles.top}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExitModal(true)} >
          <Image source={require('../../assets/group6.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <View style={styles.profile}>
          <Image
            style={{ height: 70, width: 70, borderColor: '#9B7BFF', borderWidth: 2, borderRadius: 40 }}
            resizeMode="cover"
            source={{ uri: group?.groupData?.groupProfile }}
          />
        </View>
        <Text style={{ fontSize: 22, color: 'white', paddingVertical: 10, fontWeight: "700" }} >{group?.groupData?.title}</Text>
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
          <TouchableOpacity style={styles.mediaitem} onPress={() => navigation.navigate('Group Setting')} >
            <Image source={require('../../assets/sett.png')} style={{ height: 50, width: 50, tintColor: "#fff" }} />
          </TouchableOpacity>
        </View>
        <View style={{ width: "100%", paddingHorizontal: 30, marginVertical: 20 }}>
          <View style={styles.bio}>
            <Text style={{ color: "white", fontWeight: "600" }}>Bio</Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
              {group?.groupData?.bio}
            </Text>
          </View>
        </View>


      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20, marginVertical: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} >
          <Image source={require('../../assets/grp.png')} style={{ height: 30, width: 30, tintColor: "#fff" }} />
          <Text style={{ color: "#fff", paddingLeft: 10, fontSize: 18 }} >Members</Text>
        </View>
        <TouchableOpacity>
          <Image source={require('../../assets/search.png')} style={{ height: 30, width: 30, tintColor: "#fff" }} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.btm}>

        {
          group.groupId.participants?.map((item, index) => {
            return (
              <TouchableOpacity style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}} key={index} onLongPress={() => admin && handleOpenUser(item)} >
                <View style={styles.messageStructure}>
                  <View style={styles.userStructure}>
                    <View style={styles.avatarImg}>
                      <Image
                        style={{ height: 60, width: 60, borderRadius: 35 }}
                        resizeMode="cover"
                        source={{ uri: item?.userProfile }}
                      />

                    </View>
                    <View style={styles.nameLayout}>
                      <Text
                        style={[styles.ashishRajput, styles.ashishTypo]}
                      >
                        {item?.firstName + " " + item?.lastName}
                      </Text>
                      <Text
                        style={{ color: "#fff" }}
                      >
                        {item?.bio}</Text>
                    </View>
                  </View>
                  <View style={styles.timeLayout}>

                  </View>
                </View>

                {
                  isGroupAdmin(item._id) &&
                  <TouchableOpacity style={{
                    width:'20%',backgroundColor:"white",
                    flexDirection:"row",justifyContent:"center",
                    alignItems:"center",
                    borderRadius:10
                    }} >
                  <Text>Admin</Text>
                  </TouchableOpacity>
                }

              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
      <Modal
        isVisible={exitModal}
        onBackdropPress={() => setExitModal(false)}
        backdropColor="rgba(255,255,255,0.8)"

      >
        <TouchableOpacity style={{
          position: "absolute", right: 0, top: 0,
          backgroundColor: '#fff',
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 10
        }}
          onPress={() => handleLeaveGroup()}
        >
          <Image style={{ height: 25, width: 25, right: 2 }} source={require('../../assets/leftgroup.png')} />
          <Text style={{ color: "#000", fontSize: 15, fontWeight: '700' }} >Leave group</Text>
        </TouchableOpacity>
      </Modal>
      <Modal
        isVisible={kick}
        onBackdropPress={() => setKick(false)}
        backdropColor="rgba(255,255,255,0.8)"


      >
        <View style={{
          position: "absolute",
          top: "75%",
          right: 0,
          backgroundColor: '#fff',
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderRadius: 10
        }} >
          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: "center",
            marginBottom: 7
          }}
            onPress={() => handleKickUser()}
          >

            <Text style={{ color: "#000", fontSize: 15, fontWeight: '700' }} >Kick</Text>
            <Image style={{ height: 25, width: 25, left: 5 }} source={require('../../assets/kick.png')} />
          </TouchableOpacity>
          <TouchableOpacity style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: "center",
            marginBottom: 7

          }}
            onPress={() => handleMakeAdmin()}
          >

            <Text style={{ color: "#000", fontSize: 15, fontWeight: '700' }} >Make admin</Text>
            <Image style={{ height: 25, width: 25, left: 5 }} source={require('../../assets/mdi_crown.png')} />
          </TouchableOpacity>
        
        </View>
      </Modal>
    </SafeAreaView>
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
    width: "50%",
    justifyContent: "center",
    marginTop: 10
  },
  bio: {
    width: "100%",
    minHeight: 130,
    borderWidth: 2,
    padding: 5,
    borderRadius: 10,
    borderColor: "#06eeeff2",
    backgroundColor: "#00000042",
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
    width: "70%",
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

export default GroupInfo