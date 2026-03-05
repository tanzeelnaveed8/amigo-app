import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableOpacity, ActivityIndicator,BackHandler } from 'react-native'
const { width, height } = Dimensions.get('window');
import { Color, Border, FontFamily, FontSize, Padding } from "../../../GlobalStyles";
import axios from 'axios';
import { basepath } from '../../basepath';
import { setAccessToken } from '../../AsyncStorage';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoading, setToken } from '../../store/slices/userSlice';
import { useFocusEffect } from '@react-navigation/native'; 

const Login = ({ navigation }) => {
    const user = useSelector(state => state.user)
    console.log({ isLoading: user.isLoading });
    const dispatch = useDispatch()
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({ userName: false, password: false });
    const handleSubmitLogin = async () => {
        dispatch(setIsLoading(true))
        let valid = true;
        let newErrors = { userName: false, password: false };

        if (userName === '') {
            newErrors.userName = true;
            valid = false;
        }
        if (password === '') {
            newErrors.password = true;
            valid = false;
        }
        setErrors(newErrors);
        if (valid) {
            await axios.post(`${basepath}user-auth/user-login`, { userName: userName, password: password }).then(async (res) => {
                dispatch(setIsLoading(false))
                await setAccessToken(res.data.token)
                dispatch(setToken(res.data.token))
                setUserName('')
                setPassword('')
                navigation.navigate('Home')
                // console.log({ res: res.data.token });
            }).catch((err) => {
                console.log({ err });
            })
        }

    }

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
            <Text style={styles.title}  >Login</Text>
            <View style={styles.inputGroup}>
                <Image
                    style={[styles.mdiearthIcon, styles.iconLayout1]}
                    resizeMode="cover"
                    source={require("../../assets/icbaselinephoneiphone.png")}
                />
                <TextInput
                    style={[styles.input, errors.userName && styles.errorBorder]}
                    placeholder="User Name"
                    // secureTextEntry
                    placeholderTextColor="white"
                    value={userName}
                    onChangeText={(txt) => setUserName(txt)}
                />
                {
                    errors.userName && <Text style={{ color: "red" }} >User Name is required</Text>
                }
            </View>
            <View style={styles.inputGroup}>
                <Image
                    style={[styles.mdiearthIcon, styles.iconLayout1]}
                    resizeMode="cover"
                    source={require("../../assets/icbaselinephoneiphone.png")}
                />
                <TextInput
                    style={[styles.input, errors.password && styles.errorBorder]}
                    placeholder="Password"
                    // secureTextEntry
                    placeholderTextColor="white"
                    value={password}
                    onChangeText={(txt) => setPassword(txt)}

                />
                {
                    errors.password && <Text style={{ color: "red" }} >User Name is required</Text>
                }
            </View>
            <TouchableOpacity style={styles.component2} onPress={() => handleSubmitLogin()}>
                {
                    user.isLoading ? <ActivityIndicator size="large"  /> :
                        <Text style={styles.button}>Login</Text>
                }

            </TouchableOpacity>
            <TouchableOpacity style={styles.component2} onPress={() => navigation.navigate('Register Screen')} >
                <Text style={styles.button}>Register</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
const vw = width / 100;
const vh = height / 100;
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#009cf4',
        height: '100%',
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    errorBorder: {
        borderColor: "red"
    },
    title: {
        fontSize: 28,
        color: 'white',
        fontWeight: "700",
        fontStyle: 'italic'
    },
    inputGroup: {
        display: 'flex',
        alignContent: 'center',
        marginTop: 3 * vh,
        width: '80%'
    },
    mdiearthIcon: {
        top: 1.5 * vh,
        left: 1 * vh,

    },
    iconLayout1: {
        height: 24,
        width: 24,
        position: "absolute",
        overflow: "hidden",
        marginVertical: 'auto',
        color: "white",
        tintColor: "white"
    },
    input: {
        width: '100%',
        paddingHorizontal: 5 * vh,
        borderWidth: 2,
        // borderColor: '#ccc',
        borderRadius: 5,
        borderColor: 'white',
        color: 'white',
        fontSize: FontSize.size_lg,

    },
    component2: {
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
        borderRadius: Border.br_5xs,
        color: '#fff',
        backgroundColor: '#9B7BFF',
        textAlign: 'center',
        marginTop: 3.5 * vh,
        paddingHorizontal: 10,
        width: '80%'
    },
    button: {
        fontFamily: FontFamily.robotoBold,
        fontWeight: "700",
        fontSize: FontSize.size_xl,
        textAlign: "center",
        color: Color.colorWhite,
        paddingVertical: 1 * vh,
        width: '100%',
    },
})
export default Login