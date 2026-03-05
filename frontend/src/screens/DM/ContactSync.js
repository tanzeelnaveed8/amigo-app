import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image, Text, ScrollView, Dimensions,Linking , Platform, TouchableOpacity, PermissionsAndroid, Alert } from 'react-native'
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import Contacts from '../../utils/contactsCompat';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { basepath } from '../../basepath';
import { useSelector } from 'react-redux';
const { width, height } = Dimensions.get('window');
const ContactSync = ({ navigation }) => {
  const token=useSelector(state=>state.user.token)
  let [contacts, setContacts] = useState([]);
  console.log({tkkkkkkk:contacts[0]});
  useEffect(() => {
    const requestContactsPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
              title: 'Contacts',
              message: 'This app would like to view your contacts.',
            }
          );
          console.log('Permission result:', granted);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Contacts permission granted');
            loadContacts();
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              'Permission Required',
              'Please enable contacts permission in the app settings',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ],
            );
            console.warn('Permission to access contacts was denied permanently');
          } else {
            Alert.alert('Permission Denied', 'Permission to access contacts was denied');
            console.warn('Permission to access contacts was denied');
          }
        } catch (err) {
          console.warn('Error requesting contacts permission', err);
        }
      } else {
        console.log('Platform is not Android, loading contacts directly');
        loadContacts();
      }
    };

    requestContactsPermission();
  }, []);

  const loadContacts = () => {
    Contacts.getAll()
      .then(contacts => {
        // console.log('Contacts fetched:', contacts);
        contacts.sort((a, b) =>
          a.givenName.toLowerCase() > b.givenName.toLowerCase() ? 1 : -1
        );
        setContacts(contacts);
      })
      .catch(e => {
        Alert.alert('Error', 'Permission to access contacts was denied');
        console.warn('Error fetching contacts', e);
      });
  };

  const handleSynckContact=async ()=>{
    await axios.post(`${basepath}user/check-number-on-server`,{contact:contacts},{
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res)=>{
      navigation.navigate('Home')
      // console.log({testing :res.data});

    }).catch((err)=>{
      console.log({err});
    })
  }

  return (
    <ScrollView
    >
      <View style={styles.container}>
        <View
          styles={styles.ImgComp}
        >
          <View
            style={styles.image1}
          >
            <Image

              resizeMode="cover"
              source={require("../../assets/image-166.png")}
            />
          </View>
          <View
            style={styles.image2}
          >
            <Image
              resizeMode="cover"
              source={require("../../assets/f8c6fee96964466f82ab54ba0cb44ac2-1.png")}
            />
          </View>

        </View>
        <View style={styles.childFrameLayout}>

          <Text style={[styles.pleaseEnterYour, styles.yourClr]}>
            Amigo needs access to your contact so that you an connect with your
            friends. Contacts will be continuously synced with Amigo heavily
            encrypted cloud services.
          </Text>
      
      <TouchableOpacity style={[styles.bySigningUp, styles.bySigningUpTypo]} onPress={()=>navigation.navigate('Home')} >
            <Text style={{ textAlign: 'center', fontWeight: '600' ,color:"black"}}>Not Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.component2} onPress={() => handleSynckContact()}>
            <Text style={styles.button}>Continue</Text>
          </TouchableOpacity>


        </View>

      </View>
    </ScrollView>
  )
}
const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.colorCornflowerblue_100,
    flex: 1,
    paddingTop: 5 * vh,
    //justifyContent: 'center',
    // alignItems: 'center',
  },
  image1: {
    // borderWidth: 1,
    // borderColor: Color.colorBlack,
    marginHorizontal: 'auto',
    marginBottom: -6 * vh,
    marginLeft: 10 * vh,
    zIndex: 2,
    position: 'absolute'
  },
  image2: {
    // borderWidth: 1,
    // borderColor: Color.colorBlack,
    marginHorizontal: 'auto'
  },
  ImgComp: {
    position: 'relative',
    marginVertical: 5 * vh,
    flexDirection: 'column',
    // width: 80 * vw,
    // height: 80 * vh,
    borderWidth: 1,
    borderColor: Color.colorWhite,
    flexGrow: 1,
    justifyContent: 'center'
  },
  childFrameLayout: {
    // borderRadius: Border.br_31xl,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: Color.colorWhite,
    height: 60 * vh,
    // width: 48 * vh,
    paddingHorizontal: 5 * vh,
    paddingTop: 5 * vh,
    textAlign: 'center',
    marginTop: 5 * vh,
  },
  pleaseEnterYour: {
    display: "flex",
    color: Color.colorBlack,
    alignItems: "center",
    marginTop: 1 * vh,
    justifyContent: 'center',
    textAlign: "center",
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    fontSize: 16,
  },
  yourClr: {
    color: Color.colorBlack,
    textAlign: "center",
    marginVertical: 3 * vh,
  },
  component2: {
    shadowRadius: 4,
    elevation: 4,
    shadowOpacity: 1,
    borderRadius: Border.br_31xl,
    color: '#fff',
    backgroundColor: Color.colorCornflowerblue_100,
    textAlign: 'center',
    marginTop: 3.5 * vh,
    marginHorizontal: 40

  },
  button: {
    fontFamily: FontFamily.robotoBold,
    fontWeight: "600",
    fontSize: FontSize.size_xl,
    textAlign: "center",
    color: Color.colorWhite,
    paddingVertical: 2 * vh,
    width: '100%',

  },
  bySigningUp: {
    color: Color.colorGray_200,
    marginTop: 3 * vh,
    borderStyle: "solid",
    borderColor: Color.colorCornflowerblue_100,
    borderWidth: 1,
    paddingVertical: 1.5 * vh,
    borderRadius: Border.br_31xl,
    marginHorizontal: 40

  },
  bySigningUpTypo: {
    fontFamily: FontFamily.nunitoBold,
    fontSize: FontSize.size_xl,
    textAlign: "center",
    fontWeight: "700",
  },

});

export default ContactSync