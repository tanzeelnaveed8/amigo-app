import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { basepath } from '../../basepath';
import Toast from 'react-native-toast-message';
import { setGroupParticipent } from '../../store/slices/groupSlice';
import { setChanelParticipent } from '../../store/slices/chanelSlice';
const { width, height } = Dimensions.get('window');

const ChanelContactList = ({ navigation }) => {
  const user = useSelector(state => state.user)
  const chanel=useSelector(state=>state.chanel)
  const dispatch=useDispatch()
  console.log({chanel});
  const [participent, setParticipent] = useState([])
  const [selectedUser, setSelectedUser]=useState([])
  console.log({ participent: participent });
  const addParticipant = (newParticipant) => {
    setSelectedUser(prevParticipent => [...prevParticipent, newParticipant])
    setParticipent(prevParticipent => [...prevParticipent, newParticipant._id]);
  };
  const isParticipant = (participantId) => {
    return participent.includes(participantId);
  };
const handleUpdateChanel= async()=>{
  await axios.patch(`${basepath}chanel/update-chanel`,{chanelId:chanel.chanelId,participants:participent},{
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  }).then((res)=>{
    console.log({res:res.data.data});
    if (res?.data?.status===200) {
      Toast.show({
        type:'success',
        text1:"Group Update",
        text2:"Keep continue and Don't refresh screen"
      })
      dispatch(setChanelParticipent(participent))
      navigation.navigate('Create Chanel')
    }
    
  }).catch((err)=>{
    console.log({err:err});
  })
}
  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.top} >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <View   >
          <Text style={{ textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "600" }}  >New Chanel</Text>
          <Text style={{ textAlign: "center", color: "#fff" }}>{` ${selectedUser.length} to ${user?.contactList?.length} selected`}</Text>
        </View>
        <TouchableOpacity>
          <Image source={require("../../assets/search.png")} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.btm} >
        {
          user?.contactList?.map((item, index) => {
            // console.log({item});
            return (
              <TouchableOpacity key={index} onPress={() => addParticipant(item)}  >
                <View style={styles.messageStructure}>
                  <View style={styles.userStructure}>
                    <View style={styles.avatarImg}>
                      <Image
                        style={{ height: 60, width: 60 }}
                        resizeMode="cover"
                        source={{ uri: item?.userProfile }}
                      />

                    </View>
                    <View style={styles.nameLayout}>
                      <Text
                        style={[styles.ashishRajput, styles.ashishTypo]}
                      >
                        {item.firstName + " " + item.lastName}
                      </Text>

                    </View>
                  </View>
                  <View style={styles.timeLayout}>
                    {isParticipant(item._id) &&

                      <Image
                        style={{ height: 35, width: 35 }}
                        resizeMode="cover"
                        source={require("../../assets/circletick.png")}
                      />}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
      <TouchableOpacity style={styles.floatingbtn} onPress={() => handleUpdateChanel()} >
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
    alignItems:"center",
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
export default ChanelContactList