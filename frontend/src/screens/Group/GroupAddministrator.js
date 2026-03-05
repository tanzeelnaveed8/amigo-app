import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Alert } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useSelector } from 'react-redux';
import { basepath, baseurl } from '../../basepath';
import axios from 'axios';
const { width, height } = Dimensions.get('window');

const GroupAddministrator = ({ navigation }) => {
  const user = useSelector(state => state.user)
  const group = useSelector(state => state.group)
  const [addUser, setAddUser] = useState([])
  console.log({ addUser });
  const handleMakeAdmin = async () => {
    if (addUser.length >0) {
      await axios.patch(`${basepath}group/add-member-in-group-as-an-admin`,
        {
          groupId: group.groupId._id,
          userId: addUser
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      ).then((res) => {
        // setKick(false)
        navigation.navigate('Home')
  
      }).catch((err) => {
        console.log({ err: err.message });
      })
    }else{
      Alert.alert('User Not Selected')
    }
   
  }
  const handleSelectUser = (user) => {
    setAddUser((prevSelectedUsers) => {
      // Check if user._id is already selected
      if (prevSelectedUsers.includes(user._id)) {
        // If selected, remove user._id
        return prevSelectedUsers.filter((id) => id !== user._id);
      } else {
        // If not selected, add user._id
        return [...prevSelectedUsers, user._id];
      }
    });
  };
  // console.log({ cont: user.contactList });
  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.top} >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <View   >
          <Text style={{ textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "600" }}  > Administration</Text>
          {/* <Text style={{ textAlign: "center", color: "#fff" }}>15 to 30 selected</Text> */}
        </View>
        <TouchableOpacity>
          <Image source={require("../../assets/search.png")} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.btm} >

        {
          user.contactList.map((item, index) => {

            return (
              <TouchableOpacity key={index}
                onPress={() => handleSelectUser(item)}
                style={{
                  backgroundColor: addUser.includes(item._id) ? 'lightblue' : 'transparent',
                  marginBottom: 8,
                }}
              >
                <View style={styles.messageStructure}>
                  <View style={styles.userStructure}>
                    <View style={styles.avatarImg}>
                      <Image
                        style={{ height: 60, width: 60, borderRadius: 30 }}
                        resizeMode="cover"
                        source={{ uri: item.userProfile }}
                      />

                    </View>
                    <View style={styles.nameLayout}>
                      <Text
                        style={[styles.ashishRajput, styles.ashishTypo]}
                      >
                        {item?.firstName + " " + item?.lastName}
                      </Text>

                    </View>
                  </View>
                  <View style={styles.timeLayout}>

                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }

      </ScrollView>
      <TouchableOpacity style={styles.floatingbtn} onPress={() => handleMakeAdmin()} >
        <Image source={require("../../assets/rightArrow.png")} style={{ width: 60, height: 60 }} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
const vw = width / 100;
const vh = height / 100;
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: "100%",
    backgroundColor: '#009cf4',
  },
  messageStructure: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: '#fff', // Default background color
  },
  selectedUser: {
    backgroundColor: '#d3f3fc', // Highlight background color for selected users
  },
  top: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    marginBottom: 20
  },
  btm: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30
  },
  messageStructure: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
  mditickIconLayout: {
    height: 18,
    width: 18,
    borderRadius: Border.br_17xl,
    bottom: 0,
    position: "absolute",
    right: 0,
  },
  nameLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 2 * vh,
  },
  ashishTypo: {
    //width: 144,
    color: Color.colorDimgray_500,
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    textAlign: "left",
    fontSize: FontSize.size_lg,
    // position: "absolute",
  },
  timeLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  floatingbtn: {
    position: "absolute",
    bottom: 20,
    right: 20
  }
})
export default GroupAddministrator