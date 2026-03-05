import React, { useEffect } from "react";
import { StyleSheet, View, Image, Text, ScrollView, Dimensions, Pressable, SafeAreaView, TouchableOpacity } from "react-native";
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useSelector } from "react-redux";


const { width, height } = Dimensions.get('window');

const CallVideo = ({navigation}) => {
  const user=useSelector(state=>state.user)

  return (
    <SafeAreaView style={[styles.container,user.isDarkMode && {backgroundColor:"#0D142E"}]}>
      <View style={styles.top}>
        <TouchableOpacity style={{marginRight:20}} onPress={()=>navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <Text style={{color:'white',fontWeight:'700',fontSize:22}}>Call & Video call</Text>
      </View>
      <View style={[styles.btm,user.isDarkMode && {backgroundColor:"#000"}]}>
          <Image source={require("../../assets/coming.png")} style={{height:200,width:200}} />
          <Text style={[{fontWeight:'700',fontSize:28,color:"black",paddingVertical:20}, user.isDarkMode && {color:'#fff'}]}>Call & Video call</Text>
          <Text style={{color: user.isDarkMode ? "#888" : "#999", fontSize:14, textAlign:"center", paddingHorizontal:20}}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
};

const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: "100%",
    backgroundColor: '#009cf4',
  },
  top:{
    width:'100%',
    paddingHorizontal:20,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    height:120
  },
  btm:{
    flex:1,
    flexDirection:"column",
    justifyContent:'center',
    alignItems:'center',
    height:"100%",
    width:'100%',
    backgroundColor:"white",
    borderTopLeftRadius:50,
    borderTopRightRadius:50
  }

});

export default CallVideo;
