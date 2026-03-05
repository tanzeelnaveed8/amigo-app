import React, { useState } from 'react'
import { Image, InputAccessoryView, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,Dimensions } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { basepath } from '../../basepath';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');
const CreateGroup = ({navigation,route}) => {
  const user = useSelector(state => state.user)
  const group = useSelector(state => state.group)
  const { selectedUser} = route.params;
  const [bio,setBio]=useState('')
  const [title, setTitle]=useState('')
  console.log({selectedUser});
  const handleUpdateGroup=async()=>{
    await axios.patch(`${basepath}group/update-group`,{groupId:group.groupId,bio:bio,title:title},{
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }).then((res)=>{
      // console.log({res:res.data.data});
      if (res?.data?.status===200) {
        Toast.show({
          type:'success',
          text1:"Group Update",
          text2:"Keep continue and Don't refresh screen"
        })
        navigation.navigate('Group Chat Box')
      }
      
    }).catch((err)=>{
      console.log({err:err.message});
    })
  }
  return (
    <SafeAreaView style={styles.container} >
      <TouchableOpacity style={styles.back}  onPress={() => navigation.goBack()}>
        <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
      </TouchableOpacity>
      <View style={styles.profile} >
        <TouchableOpacity style={styles.profileitem1}>
          <Image source={require("../../assets/ellipse.png")} style={{ height: 60, width: 65 }} />

        </TouchableOpacity>
        <View style={styles.profileitem2}>
          <TextInput placeholder='Enter you group name'
           selectionColor="#fff"
           value={title}
           onChangeText={(txt)=>setTitle(txt)}
          style={styles.input} placeholderTextColor="#fff" />
        </View>

        <TouchableOpacity style={styles.profileitem3}>
          <Image source={require("../../assets/emoji.png")} style={{ height: 20, width: 20 }} />
        </TouchableOpacity>


      </View>
      <View style={{ width: "100%", paddingHorizontal: 30, marginVertical: 40 }} >
        <View style={styles.textarea}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }} >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }} >Bio :</Text>
            <TouchableOpacity>
              <Image source={require("../../assets/edit.png")} style={{ height: 30, width: 30 }} />
            </TouchableOpacity>
          </View>
          <TextInput 
          style={styles.input1}
           placeholderTextColor="#fff"
           selectionColor="#fff"
           multiline={true} 
           numberOfLines={4} 
           placeholder='Write Group Bio....' 
           value={bio}
           onChangeText={(txt)=>setBio(txt)}
           />
        </View>
      </View>

      <ScrollView style={styles.btm}>
          <Text style={{textAlign:"center",color:"#000",fontSize:18,fontWeight:"600",marginVertical:20}} >{selectedUser.length} Members</Text>
          {
          selectedUser.map((item, index) => {
            return (
              <TouchableOpacity key={index} >
                <View style={styles.messageStructure}>
                  <View style={styles.userStructure}>
                    <View style={styles.avatarImg}>
                      <Image
style={{height:60,width:60}}
                        resizeMode="cover"
                        source={{uri:item.userProfile}}
                      />

                    </View>
                    <View style={styles.nameLayout}>
                      <Text
                        style={[styles.ashishRajput, styles.ashishTypo]}
                      >
                        {item.firstName+ " " +item.lastName}
                      </Text>
                      <Text
                      //style={[styles.heyThere, styles.heyTypo]}
                      >
                        Hey, there!!</Text>
                    </View>
                  </View>
                  <View style={styles.timeLayout}>
                    
                    <Image
                      style={{height:35,width:35}}
                      resizeMode="cover"
                      source={require("../../assets/circletick.png")}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
      <TouchableOpacity style={styles.floatingbtn} onPress={()=>handleUpdateGroup()} >
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
  back: {
    width: "100%",
    paddingHorizontal: 20,
    height: 60,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  profile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 30
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#FFFFFF",
    color: '#fff'
  },
  profileitem1: {
    width: "15%"
  },
  profileitem2: {
    width: "70%",
    paddingHorizontal: 15
  },
  profileitem3: {
    width: "6%"
  },
  textarea: {
    width: "100%",
    height: "auto",
    borderWidth: 2,
    padding: 5,
    borderRadius: 10,
    borderColor: "#06eeeff2",
    backgroundColor: "#00000042",
  },
  input1: {
    color: '#fff'
  },
  btm:{
    backgroundColor:"#fff",
    width:"100%",
    height:"100%",
    borderTopLeftRadius:40,
    borderTopRightRadius:40
  },
  floatingbtn: {
    position: "absolute",
    bottom: 20,
    right: 20
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
    marginLeft:10,
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
})

export default CreateGroup