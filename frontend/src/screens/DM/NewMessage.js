/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Image, View, Dimensions, TouchableOpacity, TextInput, SafeAreaView, ScrollView, PermissionsAndroid } from "react-native";
// import LinearGradient from "react-native-linear-gradient";
import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../store/slices/userSlice";
import axios from "axios";
import { basepath } from "../../basepath";
import Contacts from '../../utils/contactsCompat';

const { width, height } = Dimensions.get('window');

const NewMessage = ({ navigation }) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    // console.log({ user:user.contactList });
    const [isSearch, setIsSearch] = useState(false)
    const handleUser = (item) => {
        dispatch(setUserData(item))
        navigation.navigate('User Chat')
    }
    const [searchuser, setSearchUser] = useState([])
    const [searchText, setSearchText] = useState('')
    const [contacts, setContacts] = useState([]);
    // console.log({ user });
    const searchContactAmigo = async () => {
        await axios.get(`${basepath}user/search-user-in-contact?searchTerm=${searchText}`, {
            headers: {
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'application/json',
            }
        }).then((res) => {
            console.log({ search: res.data.data.contactNum });

            setSearchUser(res.data.data.contactNum)
        }).catch((err) => {
            console.log({ err });
        })
    }

    const handleNavigateOnChat = (item) => {
        let formatedDate
        formatedDate = {
            _id: item._id,
            firstName: item.firstName,
            lastName: item.lastName,
            phone: item.phone,
            userProfile: item.userProfile,
        }
        dispatch(setUserData(formatedDate))
        setSearchUser([])
        // setIssearch(true)
        // console.log({item:formatedDate});
        navigation.navigate('User Chat')
    }
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

    const handleSynckContact = async () => {
        await axios.post(`${basepath}user/re-check-number-on-server`, { contact: contacts }, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        }).then((res) => {
            // navigation.navigate('Home')
            console.log({testing :res.data.data});

        }).catch((err) => {
            console.log({ err });
        })
    }
    return (
        <SafeAreaView style={[styles.frameParent, user.isDarkMode && { backgroundColor: "#0D142E" }]}>
            <View
                style={[styles.frameGroup, styles.frameGroupBg]}
            >
                <View style={styles.headerLayout}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            style={styles.frameChild}
                            resizeMode="cover"
                            source={require("../../assets/epback.png")}
                        />
                    </TouchableOpacity>
                    <View style={styles.subtitleLayout}>

                        <Text
                            style={styles.youReceived}
                        >New Message</Text>

                    </View>

                </View>
                <View style={styles.avatarHedaer}>
                    <TouchableOpacity style={styles.marginCard} onPress={() => navigation.navigate('Choose Group Type')}>
                        <View style={styles.messageStructure}>
                            <View style={styles.userStructure}>
                                <View style={styles.avatarImg}>
                                    <Image
                                        style={styles.avatarImgSize}
                                        //style={[styles.frameChild3, styles.frameChildPosition1]}
                                        resizeMode="cover"
                                        source={require("../../assets/ellipse-6.png")}
                                    />

                                </View>
                                <View style={styles.nameLayout}>
                                    <Text
                                        style={styles.blueBgText}
                                    >
                                        New Group
                                    </Text>

                                </View>
                            </View>

                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.marginCard} onPress={() => navigation.navigate('Choose Chanel')}>
                        <View style={styles.messageStructure}>
                            <View style={styles.userStructure}>
                                <View style={styles.avatarImg}>
                                    <Image
                                        style={styles.avatarImgSize}
                                        //style={[styles.frameChild3, styles.frameChildPosition1]}
                                        resizeMode="cover"
                                        source={require("../../assets/ellipse-6.png")}
                                    />

                                </View>
                                <View style={styles.nameLayout}>
                                    <Text
                                        style={styles.blueBgText}
                                    >
                                        New Channel
                                    </Text>

                                </View>
                            </View>

                        </View>
                    </TouchableOpacity>
                </View>



                <View
                    style={[styles.materialSymbolssearchParent, user.isDarkMode && { backgroundColor: "#000", borderColor: "#333" }]}
                // style={[styles.materialSymbolssearchParent, styles.parentLayout]}
                >
                    {isSearch ?

                        <View style={styles.searchTop} >
                            <View style={{ width: "85%" }}>
                                <TextInput
                                    // placeholderTextColor="#000"
                                    placeholder="Search Here ..."
                                    style={ user.isDarkMode ? {borderRadius: 30, borderWidth: 2, borderColor: '#fff', paddingLeft: 20,color:"#fff"} : 
                                    { borderRadius: 30, borderWidth: 2, borderColor: '#000', paddingLeft: 20,color:"gray" }}
                                    value={searchText}
                                    onChangeText={(txt) => setSearchText(txt)}
                                   placeholderTextColor={user.isDarkMode ? '#fff':'gray'}
                                />
                                <TouchableOpacity
                                    style={{ position: "absolute", top: 10, right: 15 }}
                                    onPress={() => searchContactAmigo()}>
                                    <Image
                                        style={ user.isDarkMode ? {tintColor:"#fff"} : { tintColor: "#000" }}
                                        resizeMode="cover"
                                        source={require("../../assets/materialsymbolssearch.png")}
                                    />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={{ width: '10%' }}
                                onPress={() => { setIsSearch(!isSearch); setSearchUser([]); setSearchText('') }}

                            >
                                <Image source={require('../../assets/iconoircancel.png')} style={{ height: 40, width: 40, tintColor: user.isDarkMode?"#fff" : "#000" }} />
                            </TouchableOpacity>

                        </View>

                        :
                        <TouchableOpacity style={styles.serachStructure} onPress={() => setIsSearch(!isSearch)}>

                            <Image
                                style={[styles.materialSymbolssearchIcon, user.isDarkMode && { tintColor: "#fff" }]}

                                resizeMode="cover"
                                source={require("../../assets/materialsymbolssearch.png")}
                            />
                            <Text style={[styles.group, styles.textTypo, user.isDarkMode && { color: "#fff" }]}>
                                Your contacts on Amigo
                            </Text>

                        </TouchableOpacity>
                    }
                    <ScrollView style={{ height: "100%", paddingBottom: 150, }} >
                        {searchuser.length <= 0 ?
                            user?.contactList?.map((item, index) => {
                                // console.log({item});
                                return (
                                    <TouchableOpacity style={styles.marginCard} key={index} onPress={() => handleUser(item)}>
                                        <View style={styles.messageStructure}>
                                            <View style={styles.userStructure}>
                                                <View style={[styles.avatarImg,{borderRadius:30,overflow:"hidden"}, user.isDarkMode && { borderColor: "#fff", borderWidth: 1, borderRadius: 30 }]}>
                                                    <Image
                                                        style={styles.avatarImgSize}
                                                        //style={[styles.frameChild3, styles.frameChildPosition1]}
                                                        resizeMode="cover"
                                                        source={{ uri: item?.userProfile }}
                                                    />

                                                </View>
                                                <View style={styles.nameLayout}>
                                                    <Text
                                                        style={[styles.ashishRajput, styles.ashishTypo, user.isDarkMode && { color: "#fff" }]}
                                                    >
                                                        {item?.firstName + " " + item?.lastName}
                                                    </Text>
                                                    <Text
                                                        style={[user.isDarkMode ? { color: "#fff" } : { color: "#000" }]}
                                                    >
                                                        see you soon</Text>
                                                </View>
                                            </View>

                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                            :
                            searchuser.length > 0 ?
                                searchuser?.map((item, index) => {
                                    return (
                                        <TouchableOpacity key={index}
                                            style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 15 }}
                                            onPress={() => handleNavigateOnChat(item)}
                                        >
                                            <View style={{ borderWidth: 1, borderColor: "#000", borderRadius: 30, marginRight: 10 }}>
                                                <Image source={{ uri: item.userProfile }} style={{ height: 50, width: 50,borderColor:"#9B7BFF",borderWidth:1,borderRadius:30 }} />
                                            </View>
                                            <Text style={[user.isDarkMode ? {color:'#fff'}:{color:"#000"}, { fontSize: 18, fontWeight: "600",  }]} >{item.firstName + " " + item.lastName}</Text>
                                        </TouchableOpacity>
                                    )
                                })
                                :
                                <View>
                                    <Text>No result Found</Text>
                                </View>
                        }



                    </ScrollView>



                </View>
                {/* </LinearGradient> */}
            </View>
            <View 
            style={{ 
                position: "absolute", 
                bottom: 20, right: 30,
                height:50,width:50,
                borderRadius:50,
                // borderColor:"#000",
                // borderWidth:3,
                flexDirection:"row",
                justifyContent:"center",
                alignItems:"center",
                backgroundColor:"#9B7BFF"
                }}>
                <TouchableOpacity onPress={()=>handleSynckContact()} >
                    <Image
                        style={{ tintColor: "#fff", height: 40, width: 40 }}
                        source={require('../../assets/plus.png')} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
    frameGroupBg: {
        // backgroundColor: Color.colorWhite,
        // overflow: "hidden",
        // position: "absolute",
        flex: 1,
        height: '100%'
    },
    searchTop: {
        width: "100%",
        paddingHorizontal: 10,
        // marginVertical: 20,
        marginBottom: 20,
        position: "relative",
        zIndex: 999,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    searchitem: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        height: 70,
        width: "100%",
        // backgroundColor:'black'

    },
    searchinput: {
        width: "75%",
        height: 40,
        borderWidth: 2,
        borderRadius: 10,
        paddingLeft: 20
    },
    avatarHedaer: {
        marginLeft: 2 * vh,
        paddingHorizontal: 5 * vw,
    },
    subtitleLayout: {
        width: '100%',
        paddingRight:20

    },
    searchLayout: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
    },
    subtitle: {
        //flex: 1,
        flexDirection: 'row'
    },
    avatarImg: {
        // position: 'relative',

    },
    avatarImgSize: {
        width: 60,
        height: 60,
    },

    messageStructure: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stickyLayout: {
        // position: 'absolute',
        bottom: 0,
        left: 1 * vh,
        paddingHorizontal: 1 * vh,
        paddingVertical: 1 * vh,
        width: '100%',
    },
    timeLayout: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    blueText: {
        backgroundColor: Color.colorDeepskyblue_100,
        color: Color.colorWhite,
        paddingHorizontal: 2 * vw,
        paddingVertical: 0.5 * vh,
        borderRadius: Border.br_31xl,
        fontSize: FontSize.size_3xs,
    },
    marginCard: {
        marginBottom: 3 * vh,
    }
    ,
    msgText: {
        color: Color.colorWhite,

    },
    nameLayout: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        marginLeft: 2 * vh,
    },
    textNumber: {
        color: Color.colorBlack,
    },
    serachStructure: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3 * vh,
    },
    userStructure: {
        display: 'flex',
        flexDirection: 'row',
    },
    msgNumber: {
        backgroundColor: Color.colorWhite,
        height: 2 * vh,
        paddingHorizontal: 1 * vh,
        // paddingVertical:0.1*vh,
        borderRadius: Border.br_31xl,
        marginLeft: 1 * vh,
        //color:Color.colorBlack,
        //padding:1*vh,
    },
    msgBg: {
        backgroundColor: Color.colorBlack,
        paddingVertical: 1 * vh,
        paddingHorizontal: 2 * vh,
        display: 'flex',
        flexDirection: 'row',
        borderRadius: Border.br_11xl

    },
    headerLayout: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        // borderWidth:5,
        // borderColor:Color.colorRed,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 3 * vh,
        marginBottom: 2 * vh,
        paddingHorizontal: 5 * vw,
    },
    allImages: {
        display: 'flex',
        flexDirection: 'row',


    },
    parentLayout: {
        // width: 375,
        //left: 0,
        //width: 100 * vw,
        width: '100%',

        //position: 'relative',

    },
    avatarLayout: {
        display: 'flex',
        flexDirection: 'column',
        marginRight: 5 * vw,
    },
    imageLayout: {
        position: 'relative',
    },
    frameChildLayout: {
        height: 50,
        width: 50,

    },
    iconLayout1: {
        // overflow: "hidden",

        position: "absolute",
        height: 18,
        width: 18,
        borderRadius: Border.br_17xl,
    },
    textTypo: {
        // textAlign: "center",
        fontFamily: FontFamily.nunitoBold,
        fontWeight: "700",
        // position: "absolute",

    },
    messageTypo: {
        color: Color.colorGray_1400,
        fontFamily: FontFamily.nunitoSemiBold,
        textAlign: "left",
        fontWeight: "600",
        fontSize: FontSize.size_lg,
        marginVertical: 2 * vh,
    },
    frameChildPosition1: {
        left: 21,
        position: "absolute",
    },
    ashishTypo: {
        //width: 144,
        color: Color.colorDimgray_500,
        fontFamily: FontFamily.nunitoBold,
        fontWeight: "700",
        textAlign: "left",
        fontSize: FontSize.size_xl,
        // position: "absolute",
    },
    heyTypo: {
        color: Color.colorDimgray_400,
        fontFamily: FontFamily.nunitoMedium,
        textAlign: "center",
        fontSize: FontSize.size_xs,
        fontWeight: "500",
        position: "absolute",
    },
    amTypo: {
        color: Color.colorDimgray_200,
        fontFamily: FontFamily.nunitoMedium,
        textAlign: "center",
        fontSize: FontSize.size_3xs,
        fontWeight: "500",
        position: "absolute",
    },
    mditickIconLayout: {
        height: 18,
        width: 18,
        borderRadius: Border.br_17xl,
        bottom: 0,
        position: "absolute",
        right: 0,
    },
    youReceived: {
        color: Color.colorWhite,

        marginVertical: 1 * vh,
        width: '100%',
        textAlign: 'center',
        fontSize: FontSize.size_3xl,
        lineHeight: 30,
        fontFamily: FontFamily.nunitoSemiBold,
        textShadowColor: "rgba(0, 0, 0, 0.25)",
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowRadius: 4,
        paddingRight:10,
        
        // borderWidth: 1,
        // borderColor: Color.colorBlack
    },
    messages: {
        // top: 98,
        fontSize: FontSize.size_3xl,
        textDecoration: "underline",
        fontFamily: FontFamily.interSemiBold,
        fontWeight: "600",
        textAlign: "left",
        color: Color.colorWhite,
        textDecorationLine: 'underline'
        //  left: 19,
        // position: "absolute",
    },
    frameChild: {
        // top: 47,
        borderRadius: Border.br_21xl,
        width: 40,
        height: 40,
        // borderWidth: 1,
        // borderColor: Color.colorBlack
        // borderWidth:1,
        // borderColor:Color.colorBlack,
        // left: 313,
        // overflow: "hidden",
        // position: "absolute",
    },
    online: {
        // top: 150,
        fontFamily: FontFamily.interMedium,
        fontWeight: "500",
        fontSize: FontSize.size_mini,
        textAlign: "left",
        color: Color.colorWhite,
        marginVertical: 1 * vh,
        //  left: 19,
        // position: "absolute",
    },
    frameItem: {
        // left: 25,
        // position: "absolute",
        // top: 185,
        //  width: 50,
    },
    mditickCircle: {
        // left: 60,
        width: 18,
        borderRadius: Border.br_17xl,
        // height: 18,
        borderWidth: 2,
        borderColor: Color.colorBlack,
        borderStyle: "solid",
        backgroundColor: Color.colorSpringgreen,
        position: 'absolute',
        right: 0,
        bottom: 0,

        // top: 216,
    },
    mditickCircle1: {
        // left: 135,
        // backgroundColor: Color.colorGold,
        // width: 18,
        // borderRadius: Border.br_17xl,
        // height: 18,
        // borderWidth: 2,
        // borderColor: Color.colorBlack,
        // borderStyle: "solid",
        // top: 216,
        width: 18,
        borderRadius: Border.br_17xl,
        // height: 18,
        borderWidth: 2,
        borderColor: Color.colorBlack,
        borderStyle: "solid",
        backgroundColor: Color.colorGold,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },

    mditickCircle2: {
        // left: 210,
        // backgroundColor: Color.colorRed,
        // width: 18,
        // borderRadius: Border.br_17xl,
        // height: 18,
        // borderWidth: 2,
        // borderColor: Color.colorBlack,
        // borderStyle: "solid",
        // top: 216,
        width: 18,
        borderRadius: Border.br_17xl,
        // height: 18,
        borderWidth: 2,
        borderColor: Color.colorBlack,
        borderStyle: "solid",
        backgroundColor: Color.colorRed,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
    ashish: {
        // left: 30,
        fontWeight: "800",
        fontFamily: FontFamily.nunitoExtraBold,
        // width: 39,
        // top: 242,
        fontSize: FontSize.size_mini,
        // textAlign: "left",
        color: Color.colorWhite,
        // position: "absolute",
        marginTop: 1 * vh,
    },

    hiAshish: {
        // top: 46,
        // left: 46,
        fontSize: FontSize.size_sm,
        textAlign: "left",
        color: Color.colorWhite,
        fontFamily: FontFamily.interRegular,
        // position: "absolute",
        marginLeft: 2 * vw,
    },
    groupIcon1: {
        // height: "2.01%",
        // width: "5.27%",
        // top: "16.05%",
        // right: "90.67%",
        // bottom: "79.93%",
        // left: "5.07%",
        // top: "0%",
        // right: "0%",
        // bottom: "0%",
        // left: "0%",
        // maxHeight: "100%",
        // maxWidth: "100%",
        //   overflow: "hidden",
        // position: "absolute",
    },
    youReceiveedParent: {
        //height: '100%',
        // backgroundColor: "transparent",
        // overflow: "hidden",
        // top: 0,
        // width: 375,
        // position: "absolute",

        paddingHorizontal: 4 * vw,
        paddingTop: 5 * vw,
        paddingBottom: 5 * vw,
        display: 'flex',
        // borderWidth:5,
        // borderColor:Color.colorRed,
        width: '100%',

    },
    materialSymbolssearchIcon: {
        // top: 22,
        width: 30,
        height: 30,
        // overflow: "hidden",
    },
    group: {
        // top: 28,
        // left: 266,
        color: Color.colorGray_1300,
        textAlign: "left",
        fontSize: FontSize.size_lg,
        width: '100%',
        marginLeft: 1 * vh,
    },
    text1: {
        // top: 29,
        // left: 324,
        color: Color.colorBlack,
        fontSize: FontSize.size_sm,
        textAlign: "center",
    },
    pinnedMessage2: {
        // top: 87,
        // left: 17,
        // position: "absolute",
    },

    frameChild3: {
        top: 124,
        height: 50,
        width: 50,
    },
    ashishRajput: {
        // top: 126,
        // left: 92,
        fontFamily: FontFamily.robotoMedium,
        fontWeight: "500",
        color: Color.colorWhite,

    },
    blueBgText: {
        // top: 126,
        // left: 92,
        fontFamily: FontFamily.robotoMedium,
        fontWeight: "700",
        color: Color.colorWhite,
        fontSize: FontSize.size_lg,
    },
    heyThere: {
        top: 153,
        left: 92,
    },
    am: {
        top: 132,
        left: 311,
        color: Color.colorDimgray_200,
    },
    vectorIcon: {
        // top: "30.61%",
        // bottom: "68.44%",
    },
    mditickCircleIcon: {
        // top: 156,
    },
    frameChild8: {
        // top: 438,
        // left: 299,
        width: 60,
        height: 60,
        //position: "absolute",
        bottom: 0,
        position: 'fixed',
        //right:3, 
        marginLeft: 'auto',
        top: 1,
    },
    icbaselinePlusIcon: {
        // top: 455,
        //left: 316,
        width: 26,
        height: 26,
        // overflow: "hidden",
        // position: "absolute",
        // backgroundColor: Color.colorCornflowerblue_100,
        // bottom: 0,
        //right: 3,
        position: 'absolute',
        borderRadius: Border.br_31xl,
        // paddingHorizontal:1*vh,
        // paddingVertical:1*vh,
        zIndex: 15,
        // borderWidth:2,
        // borderColor:Color.colorSpringgreen,
        right: 3 * vh,
        top: 3 * vh,

    },

    materialSymbolssearchParent: {
        borderTopLeftRadius: Border.br_16xl,
        borderTopRightRadius: Border.br_16xl,
        backgroundColor: Color.colorWhite,
        height: '100%',
        paddingHorizontal: 4 * vh,
        paddingTop: 3 * vh,
        borderWidth: 1,
        borderColor: "#E0E0E0"
    },
    frameGroup: {
        // borderRadius: Border.br_16xl,
        // width: 373,
        // overflow: "hidden",
        height: '100%',
        //backgroundColor: Color.colorBlack,

        // height: 780,
        flex: 1,
    },
    frameParent: {
        flex: 1,
        backgroundColor: '#9B7BFF',
        width: "100%",
        // height: 780,

    },
});

export default NewMessage;
