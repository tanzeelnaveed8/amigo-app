import React, { useCallback, useEffect, useState } from 'react'
import { Image, SafeAreaView, StyleSheet, Text,BackHandler } from 'react-native'
import { getAccessToken } from '../AsyncStorage'
import { useDispatch, useSelector } from 'react-redux'
import { setToken } from '../store/slices/userSlice'
import { useFocusEffect } from '@react-navigation/native'

const SplashScreen = ({ navigation }) => {
  // const token = useSelector(state => state.user.token)
  // console.log({ tokensssskkkk: token });
  const dispatch = useDispatch()

  // Fetch token from async storage and set it in the Redux store
  useEffect(() => {
    const getToken = async () => {
      dispatch(setToken(await getAccessToken('token')))
    }
    getToken()
  }, [])

  // Handle navigation based on token presence
  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        handleGetAuthScreen();
      }, 2000);

      return () => clearTimeout(timeout); // Clean up the timeout when the screen loses focus
    }, [])
  );

  const handleGetAuthScreen=async ()=>{
    let token =await getAccessToken('token')
    console.log({token});
    if (!token) {
      navigation.navigate('login')
    } else {
      navigation.navigate('Home')
    }
  }

  // Optionally, ensure navigation happens when screen is focused
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (token) {
  //       navigation.navigate('Home')
  //     } else {
  //       navigation.navigate('login')
  //     }
  //   }, [token])
  // )

  const [backPressCount, setBackPressCount] = useState(0);

  useFocusEffect(
      React.useCallback(() => {
          const backAction = () => {
              if (backPressCount === 1) {
                  // Exit the app if the back button is pressed twice
                  BackHandler.exitApp();
                  return true;
              }

              // Increment back press count on first press
              setBackPressCount(1);
              // ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

              // Reset back press count after 2 seconds
              setTimeout(() => setBackPressCount(0), 2000);

              return true;
          };

          // Add event listener when HomeScreen is focused
          const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

          // Cleanup when HomeScreen loses focus or component unmounts
          return () => backHandler.remove();
      }, [backPressCount])
  );
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.splashtitle}>Chat & Share Anything Privately</Text>
      <Image source={require("../../src/assets/chatIcon.png")} style={styles.icon} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#009cf4',
    height: '100%',
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  splashtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: "center",
    paddingHorizontal: 40,
    fontStyle: "italic"
  },
  icon: {
    height: 150,
    width: 150,
    marginTop: 50
  }
})

export default SplashScreen
