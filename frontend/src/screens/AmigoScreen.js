/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, TextInput, Image, Button, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

import { Border, FontSize, Color, FontFamily } from "../../GlobalStyles";
import { windowHeight, windowWidth } from '../styles/commonstyle';

const { width, height } = Dimensions.get('window');


const AmigoScreen = () => {




  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Image
            style={styles.epbackIcon}
            resizeMode="cover"
            source={require("../assets/epback.png")}
          />
          <View>
            <Text style={styles.title}>Amigo</Text>
          </View>
        </View>

        <View style={styles.childComp}>
          <View style={styles.card}>
            <Image
              resizeMode="cover"
              source={require("../assets/oig-10.png")}
              style={styles.cardImg}
            />
            <Text style={styles.label}>BUSINESS ACCOUNT</Text>
          </View>

          <View style={styles.card}>
            <Image
              resizeMode="cover"
              source={require("../assets/oig-16.png")}
              style={styles.cardImg}
            />
            <Text style={styles.label}>FAMILY ACCOUNT</Text>
          </View>

          <View style={styles.card}>
            <Image
              resizeMode="cover"
              source={require("../assets/oig3mgkb3ww2nm-1.png")}
              style={styles.cardImg}
            />
            <Text style={styles.label}>INFLUENCER ACCOUNT</Text>
          </View>

          <View style={styles.card}> 
            <Image
              resizeMode="cover"
              source={require("../assets/oig-9.png")}
              style={styles.cardImg}
            />
            <Text style={styles.label}>PREMIUM ACCOUNT</Text>
          </View>

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
    paddingHorizontal:1*vh,

  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    marginVertical: 4 * vh,
  },

  title: {
    color: Color.colorWhite,
    fontSize: FontSize.size_5xl,
    width: 43 * vh,
    textAlign: 'center'
  },
  label: {
    fontSize: FontSize.size_base,
    color: Color.colorWhite,
    paddingTop:2*vh,
  },
  childComp: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal:2*vh,
   
  },
  card:{
    paddingTop:5*vh,
    textAlign:'center',
    marginHorizontal:'auto'
  },
  cardImg:{
     marginHorizontal:'auto',
  }

});


export default AmigoScreen
