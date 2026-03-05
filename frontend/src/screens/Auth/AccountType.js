import React, { useState } from 'react';
import { View, TextInput, Image, Button, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

import { Border, FontSize, Color, FontFamily } from "../../../GlobalStyles";
import { windowHeight, windowWidth } from '../../styles/commonstyle';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { basepath } from '../../basepath';

const { width, height } = Dimensions.get('window');

const AccountType = ({ navigation }) => {
  const token=useSelector(state=>state.user.token)
  console.log({tttttttttttttt:token});
  const getAcountType = ['BUSINESS ACCOUNT', 'FAMILY ACCOUNT', 'INFLUENCER ACCOUNT', 'PREMIUM ACCOUNT']
  const [data, setData] = useState(getAcountType[0])
  console.log({data});
const handleUpdate =async ()=>{

  await axios.patch(`${basepath}user/update-user-profile`,{userAccountType:data},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res)=>{
    navigation.navigate('Contact Sync')

  }).catch((err)=>{
    console.log({err:err.message});
  })


}
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Image
            style={styles.epbackIcon}
            resizeMode="cover"
            source={require("../../assets/epback.png")}
          />
          <View>
            <Text style={styles.title}>Amigo</Text>
          </View>
          <TouchableOpacity onPress={()=>handleUpdate()}>
            <Image source={require("../../assets/mdi_tick.png")} style={{ height: 30, width: 35 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.childComp}>
          {
            getAcountType.map((item, index) => {
              // console.log({item,data});
              return (
                <TouchableOpacity style={[styles.card, item===data && styles.active ]} onPress={() => setData(item)} key={index} >
                  <Image
                    resizeMode="cover"
                    source={require("../../assets/oig-10.png")}
                    style={styles.cardImg}
                  />
                  <Text style={[styles.label,item===data && styles.activeext]}>{item}</Text>
                </TouchableOpacity>
              )
            })
          }


        </View>
      </ScrollView>
    </>
  )
}
const vw = width / 100;
const vh = height / 100;


const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.colorCornflowerblue_100,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 1 * vh,

  },
  active:{
    borderColor:"#fff",
    backgroundColor:"white",
    borderRadius:20
  },
  activeext:{
    color:"#000",
    paddingBottom:10
  },
  header: {
    // display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    marginVertical: 4 * vh,
    paddingHorizontal:20
  },

  title: {
    color: Color.colorWhite,
    fontSize: FontSize.size_5xl,
    // width: 43 * vh,
    textAlign: 'center'
  },
  label: {
    fontSize: 12,
    color: Color.colorWhite,
    paddingTop: 2 * vh,
    textAlign: 'center'
  },
  childComp: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2 * vh,

  },
  card: {
    paddingTop: 5 * vh,
    textAlign: 'center',
    marginHorizontal: 'auto',
    width: '48%',
    marginBottom: 10
  },
  cardImg: {
    marginHorizontal: 'auto',
  }

});
export default AccountType