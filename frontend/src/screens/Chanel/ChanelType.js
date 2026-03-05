import axios from 'axios'
import React, { useState } from 'react'
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { basepath } from '../../basepath'
import Toast from 'react-native-toast-message'
import { setChanelId } from '../../store/slices/chanelSlice'

const ChanelType = ({navigation}) => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const groupData = [
    {
      title: "Private Chanel",
      des: "When your account is private. Nobody can add you in any Private Group or channel."
    },
    {
      title: "Public Chanel",
      des: "When your account is private. Nobody can add you in any Public Group or channel."
    }
  ]
  const [data, setData] = useState(groupData[0])

  const initialiseGroup = async () => {
    await axios.post(`${basepath}chanel/create-chanel`, { chanelType: data.title }, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    }).then((res) => {
      console.log({ res: res.data });
      if (res.data.status === 201) {
        Toast.show({
          type:'success',
          text1:"Group Inialised",
          text2:"Keep continue and Don't refresh screen"
        })
        dispatch(setChanelId(res.data.data))
        // navigation.navigate('Group Contact List')
        navigation.navigate('Chanel Contact List')
      }

    })
  }

  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.top} >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "white" }} >Signal Type</Text>
        <TouchableOpacity onPress={()=>initialiseGroup()} >
          <Image source={require("../../assets/mdi_tick.png")} style={{ height: 30, width: 35 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemContainer}>
        {
          groupData.map((item, index) => {
            return (
              <TouchableOpacity key={index} 
              style={[item.title === data.title ? styles.selected : styles.deselected, styles.comItem]} 
              onPress={() => setData(item)} >
                {
                  index === 0 && (<Image source={require("../../assets/private.png")} style={styles.floatImg} />)
                }
                <Image source={require("../../assets/groupIcons.png")} style={[item.title === data.title ? styles.selectedImg : styles.deselectedImg, styles.comImg]} />
                <Text style={[item.title === data.title ? styles.activetitle:{color:"gray"}, { marginTop: 10, fontWeight: "600" }]} >{item.title}</Text>
              </TouchableOpacity>
            )
          })
        }
      </View>

      <View style={{width:"100%",paddingHorizontal:40}} >
        {data.title === 'Private Group' ? <Text style={styles.desText} >{groupData[0].des}</Text> : <Text style={styles.desText} >{groupData[1].des}</Text>}
      </View>




    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: "100%",
    backgroundColor: '#009cf4',
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    height: 100
  },
  itemContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 40
  },
  comItem: {

    borderRadius: 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  deselected: {
    backgroundColor: "white",
    width: "40%",
    height: 120
  },
  selected: {
    backgroundColor: '#9B7BFF',
    width: "50%",
    height: 150,
  },
  comImg: {
    height: 50, width: 70,
  },
  deselectedImg: {
    tintColor: "#8E9598"
  },
  activetitle: {
    color: "white"
  },
  floatImg: {
    position: "absolute",
    top: 15,
    right: 25,
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  desText:{
    color:"white",
    paddingHorizontal:20,
    textAlign:"center",
    lineHeight:20,
    fontSize:16
  }
})
export default ChanelType