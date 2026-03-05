import React, { act, useEffect, useState } from 'react'
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { launchImageLibrary } from '../../utils/imagePickerCompat';

import img from '../../assets/img1.png'
import img1 from '../../assets/video1.png'
import img2 from '../../assets/file1.png'
import img3 from '../../assets/file2.png'
import img4 from '../../assets/audio.png'
import axios from 'axios';
import { basepath } from '../../basepath';
import { useSelector } from 'react-redux';
const UserMedia = ({ navigation }) => {
  const user=useSelector(state=>state.user)
  const media = [
    {
      path: img,
      title: 'images'
    },
    {
      path: img1,
      title: 'video'
    },
    {
      path: img4,
      title: 'audio'
    },
    {
      path: img3,
      title: 'file'
    },
    {
      path: img2,
      title: 'link'
    }
  ]

  const [activemedia, setActivemedia] = useState(media[0])
  const [getmedia, setGetmedia]=useState([])
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
            // setFile(imageUri)
            // setFileInfo(response.assets);
        }
    });
    
};

console.log({mediaType:activemedia.title});

const getUserMedia=async ()=>{
    let reqBody;
    if (activemedia.title==='images') {
      reqBody={
        sender:user._id,
        mediaType:'images'
      }
    }

    if (activemedia.title==='video') {
      reqBody={
        sender:user._id,
        mediaType:'video'
      }
    }

    if (activemedia.title==='audio') {
      reqBody={
        sender:user._id,
        mediaType:'audio'
      }
    }

    if (activemedia.title==='file') {
      reqBody={
        sender:user._id,
        mediaType:'file'
      }
    }
    if (activemedia.title==='link') {
      reqBody={
        sender:user._id,
        mediaType:'link'
      }
    }

    console.log({reqBody});
   await axios.post(`${basepath}media/get-media`,reqBody,{
    headers: {
      Authorization: `Bearer ${user.token}`
    }
   }).then((res)=>{
    setGetmedia(res.data.data)
    // console.log({res:res.data.data});
   }).catch((err)=>{
    console.log({err:err.message});
   })
}

useEffect(()=>{
  getUserMedia()
},[activemedia])

  return (
    <SafeAreaView style={[styles.contailer,user.isDarkMode && {backgroundColor:"#0D142E"}]}>
      {/* top bar start */}
      <View style={styles.top} >
        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 40 }} />
        </TouchableOpacity>
        {
          activemedia.title === 'video' &&
          <TouchableOpacity style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} >
            <Image source={img1} style={{ height: 30, width: 30, marginRight: 10 }} />
            <Text style={{ color: "white" }} >Browse Videos</Text>
          </TouchableOpacity>
        }
        {
          activemedia.title === 'images'  &&
          <TouchableOpacity 
          style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} onPress={openImagePicker} >
            <Image source={img} style={{ height: 30, width: 30, marginRight: 10 }} />
            <Text style={{ color: "white" }} >Browse Images</Text>
          </TouchableOpacity>
        }
        {
          activemedia.title === 'audio' &&
          <TouchableOpacity style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} >
            <Image source={img4} style={{ height: 30, width: 30, marginRight: 10 }} />
            <Text style={{ color: "white" }} >Browse Audio</Text>
          </TouchableOpacity>
        }
        {
          activemedia.title === 'file' &&
          <TouchableOpacity style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} >
            <Image source={img3} style={{ height: 30, width: 30, marginRight: 10 }} />
            <Text style={{ color: "white" }} >Browse Docs</Text>
          </TouchableOpacity>
        }
      </View>
      {/* top bar end */}

      <ScrollView style={{width:"100%",paddingHorizontal:20}} >
         { activemedia.title === 'images'  &&
         getmedia.length>0 ? 
         getmedia?.map((item,index)=>{
            return(
              <TouchableOpacity key={index}  >
                <Image source={{uri:item.mediaurl}} style={{width:150,height:200,borderRadius:20}} />
              </TouchableOpacity>
            )
          })
          :
          <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center",height:'100%'}}>
            <Text style={{color:"#fff",fontSize:18,fontWeight:'600'}} >No Images Found</Text>
          </View>
         }
         { activemedia.title === 'video'  &&
          getmedia.length>0 ? 
          getmedia?.map((item,index)=>{
            return(
              <TouchableOpacity key={index}  >
                <Image source={{uri:item.mediaurl}} style={{width:150,height:200,borderRadius:20}} />
              </TouchableOpacity>
            )
          })
          :
          <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center",height:'100%'}}>
            <Text style={{color:"#fff",fontSize:18,fontWeight:'600'}} >No Videos Found</Text>
          </View>
         }
      </ScrollView>

      {/* bottom bar start */}
      <View style={styles.btm} >

        {
          media.map((item, index) => {
            return (
              <TouchableOpacity key={index}
                style={[item.title === activemedia.title && styles.activeitem, styles.comitem]}
                onPress={() => setActivemedia(item)}
              >
                <Image source={item.path} style={{ height: 40, width: 40 }} />

              </TouchableOpacity>
            )
          })
        }

      </View>
      {/* bottom bar end */}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  contailer: {
    height: "100%",
    width: "100%",
    backgroundColor: "#9B7BFF"
  },
  btm: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activeitem: {
    shadowOffset: { width: 10, height: 10 },
    shadowColor: '#fff',
    shadowOpacity: 1,
    elevation: 30,
    // background color must be set
    backgroundColor: "#ffffff56",
    borderRadius: 10,
    padding: 5
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 20
  }
})

export default UserMedia