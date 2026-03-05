/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity, Pressable, TextInput, ScrollView, SafeAreaView, ActivityIndicator, Alert, PermissionsAndroid, Platform, Linking } from "react-native";
import { Border, Color, FontFamily, FontSize } from "../../../GlobalStyles";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-native-modal";
// import EmojiPicker from 'emoji-picker-react';
import { launchImageLibrary } from '../../utils/imagePickerCompat';
import axios from "axios";
import { basepath } from "../../basepath";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { setSMS, setUserId } from "../../store/slices/userSlice";
import { Toasts } from "../../Toasts";
const { width, height } = Dimensions.get('window');
// import SoundPlayer from 'react-native-sound-player'
// import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageView from "react-native-image-viewing";

import Sound from '../../utils/soundCompat';
import * as Clipboard from 'expo-clipboard';
import DocumentPicker from '../../utils/documentPickerCompat';
import { Video } from 'expo-av'
import RNVoiceMessagePlayer from '@carchaze/react-native-voice-message-player';
import RNFS from '../../utils/fsCompat';
import Hyperlink from 'react-native-hyperlink';
import LinkifyIt from 'linkify-it';
const linkify = new LinkifyIt();

linkify.add('tel:', {
    validate: (text, pos, self) => {
        const tail = text.slice(pos);
        if (!self.re.phone) {
            // Use a more accurate regex for phone numbers
            self.re.phone = /(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}?\)?[\s-]?)?[\d\s-]{3,15}/;
        }
        const match = self.re.phone.exec(tail);
        if (!match) {
            return 0;
        }
        const phone = match[0];
        return phone.length;
    },
});

const UserChat = ({ navigation,route }) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const { seenCount } = route.params;
    // console.log({seenCount});
    const scrollViewRef = useRef();
    const socketConnection = useSelector(state => state?.user?.socketConnection)
    // console.log({ conversationId: user.userData?.blockUser });
    const isBlockedUser = user.userData?.blockUser?.indexOf(user._id)
    const isActiveConvUser = user?.userData?.blockUser?.indexOf(user.userData._id)
    const [visible, setIsVisible] = useState(false);
    const [images, setImages] = useState('')
    // console.log({ isBlockedUser: isActiveConvUser });
    // userData
    const [modalVisible, setModalVisible] = useState(false);
    const [mediaModal, setMediaModal] = useState(false)
    const [read, setRead] = useState(false)
    const [menu, setMenu] = useState(false)
    const [isEnableOpt, setIsEnableOpt] = useState(false)
    const [isImg, setIsImg] = useState(false)
    const [dataUser, setDataUser] = useState({
        name: "",
        userProfile: "",
        online: false,
        _id: ""
    })
    const [deletesms, setDeletesms] = useState(false)
    const [edit, setEdit] = useState(false)
    const [enableedit, setEnableEdit] = useState(false)
    const [clearchat, setClearChat] = useState(false)
    // console.log({dataUser});
    const [message, setMessage] = useState({
        text: "",
        imageUrl: "",
        videoUrl: ""
    })
    const [selectsms, setSelectsms] = useState('')
    const [allMessage, setAllMessage] = useState([])
    const [text, setText] = useState()
    const [editText, setEditText] = useState('')
    const [emoji, setEmoji] = useState(false)
    const [fileInfo, setFileInfo] = useState(null);
    const [chatLoader, setChatLoader] = useState(false)
    const [file, setFile] = useState(null)
    const [top, setTop] = useState({ main: true, edit: false, search: false })
    const [mediaType, setMediaType] = useState('')
    const [convid, setConvId] = useState('')
    // console.log({convid});
    const [searchkey, setSearchKey] = useState('')

    // console.log({ searchkey: searchkey });
    const playSoundOut = async () => {

        var playSounds = new Sound('sound_out.ogg', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // loaded successfully
            console.log('duration in seconds: ' + playSounds.getDuration() + 'number of channels: ' + playSounds.getNumberOfChannels());

            // Play the sound with an onEnd callback
            playSounds.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        })
    }
    const playSoundIn = async () => {

        var playSounds = new Sound('sound_in.ogg', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // loaded successfully
            console.log('duration in seconds: ' + playSounds.getDuration() + 'number of channels: ' + playSounds.getNumberOfChannels());

            // Play the sound with an onEnd callback
            playSounds.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        })
    }
    useEffect(() => {
        setText(user.selectSms.text)
    }, [user.selectSms])
    useEffect(() => {
        if (socketConnection) {
            setChatLoader(true)
            const userId = user.userData._id
            const data = {
                userId: user._id,
                conversationId: user.userData.conversationId,
                sender: user._id,
                reciever: userId
            }
            socketConnection.emit('dm-message-page', data)
            if (seenCount>0) {
                let datas = { conversationId: user.userData.conversationId, msgByUserId: user.userData._id }
            socketConnection.emit('seen', datas)
            }
            

            socketConnection.on('message-user', (data) => {
                // console.log({ data });
                setDataUser(data)
            })

            socketConnection.on('message', (data) => {
                // console.log('message data', data)
                // playSoundIn()
                setAllMessage(data)
                setChatLoader(false)
            })


        }
        // console.log('ffffffffffffffffff');
    }, [socketConnection, user.userData._id, user, deletesms, edit, clearchat])

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('conversation-by-id', user.userData.conversationId)
        }
    }, [])

    useEffect(() => {
        if (allMessage?.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [allMessage]);

    const UploadImage = async (path, mediaType) => {
        setIsImg(true)
        const formData = new FormData()
        formData.append('conversationId', user.userData.conversationId)
        formData.append('mediaType', mediaType)
        formData.append('images', {
            uri: path[0].uri,
            type: path[0].type,
            name: path[0].fileName || path[0].name
        })
        // console.log({formData:formData[0]});
        await axios.post(`${basepath}user-auth/images-upload`, formData, {
            headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            setMediaType(mediaType)
            setIsImg(false)
            console.log({ imggggg: res.data });
            console.log({ imggggg1: res.data.data });

            setFile(res?.data?.data)
        }).catch((err) => {
            console.log({ err: err }, '111');
        })
    }
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
                await UploadImage(response.assets)
                // setFile(imageUri)
                // setFileInfo(response.assets);
            }
        });
    };
    const [fileResponse, setFileResponse] = useState([]);

    // console.log({ fileResponse });
    const handleDocumentSelection = useCallback(async (types, mediaType) => {
        try {
            const response = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
                type: [types]

            });
            setMediaModal(false)

            await UploadImage(response, mediaType)
            setFileResponse(response);
            // setFile(response[0].uri)
        } catch (err) {
            console.log({ err }, '222');
        }
    }, []);

    const handleSendMessage = () => {

        if (socketConnection) {

            let reqbody = {}
            switch (true) {
                case mediaType === 'image':
                    reqbody = {
                        sender: user?._id,
                        receiver: user.userData._id,
                        text: text,
                        imageUrl: file !== null ? file?.mediaurl || file : '',
                        msgByUserId: user?._id,
                        conversationId: user.userData.conversationId

                    }
                    break;
                case mediaType === 'video':
                    reqbody = {
                        sender: user?._id,
                        receiver: user.userData._id,
                        text: text,
                        videoUrl: file !== null ? file?.mediaurl || file : '',

                        msgByUserId: user?._id,
                        conversationId: user.userData.conversationId

                    }
                    break;
                case mediaType === 'audio':
                    reqbody = {
                        text: text,
                        imageUrl: '',
                        videoUrl: '',
                        audioUrl: file !== null ? file?.mediaurl || file : '',
                        docUrl: '',
                        msgByUserId: user?._id,
                        replyMessage: '',
                        sender: user?._id,
                        receiver: user.userData._id,
                        conversationId: user.userData.conversationId
                    }
                    break;
                case mediaType === 'doc':
                    reqbody = {
                        text: text,
                        imageUrl: '',
                        videoUrl: '',
                        audioUrl: '',
                        docUrl: file !== null ? file?.mediaurl || file : '',
                        msgByUserId: user?._id,
                        replyMessage: '',
                        sender: user?._id,
                        receiver: user.userData._id,
                        conversationId: user.userData.conversationId
                    }
                    break
                default:
                    reqbody = {
                        text: text,
                        imageUrl: '',
                        videoUrl: '',
                        audioUrl: '',
                        docUrl: '',
                        msgByUserId: user?._id,
                        replyMessage: '',
                        sender: user?._id,
                        receiver: user.userData._id,
                        conversationId: user.userData.conversationId
                    }
                    break;
            }


            //    console.log({reqbody});
            socketConnection.emit('dm-message', reqbody)
            playSoundOut()
            setText('')
            setFile(null)
            dispatch(setSMS(''))
            setMessage({
                text: "",
                imageUrl: "",
                videoUrl: ""
            })
        }
        socketConnection.on('message', (data) => {
            // console.log('message data', {data:data[data.length-1].seen})
            setAllMessage(data)
        })
        socketConnection.on('convId', (data) => {
            setConvId(data)
            console.log({ data });
        })
        // }
    }
    const handleDeleteSms = () => {
        if (socketConnection) {
            const data = {
                smsId: selectsms._id, // Replace with the actual message ID
                conversationId: user.userData.conversationId,
            };
            socketConnection.emit('delete-sms', data);
            setDeletesms(true)
            setIsEnableOpt(!isEnableOpt)
        }
    }
    const handleEditMessage = () => {
        if (socketConnection) {
            const data = {
                smsId: selectsms._id, // Replace with the actual message ID
                text: editText,
            };
            socketConnection.emit('edit-sms', data);
            setEdit(true)
            setIsEnableOpt(!isEnableOpt)
            setEnableEdit(!enableedit)
            setEditText('')
        }

    };
    const handleBlockUser = () => {
        const data = {
            conversationId: user.userData.conversationId,
            userId: user.userData._id
        }
        socketConnection.emit('blocked-user', data);
        setModalVisible(!modalVisible)

    }
    const handleUnblockUser = () => {
        const data = {
            conversationId: user.userData.conversationId,
            userId: user.userData._id
        }
        socketConnection.emit('unblocked-user', data);
        setModalVisible(!modalVisible)

    }
    const handleClearChat = () => {
        if (socketConnection) {
            socketConnection.emit('clear-conversation', user.userData.conversationId);
        }
        setClearChat(!clearchat)
        setModalVisible(!modalVisible)

    }

    const handleSelect = (item) => {
        setTop({ main: false, edit: true, search: false })

        // 
        setSelectsms(item)
        setEditText(item.text)
        // Alert.alert(JSON.stringify(item))
        // console.log({item});
        // setIsEnableOpt(true)
    }
    const handleCopyText = () => {
        Clipboard.setStringAsync(selectsms?.text)
        setIsEnableOpt(!isEnableOpt)
        Toasts(selectsms?.text)
    }

    const handleForward = () => {
        dispatch(setSMS(selectsms))
        // setIsEnableOpt(!isEnableOpt)
        setTop({ main: true, edit: false, search: false })
        navigation.navigate('New Message')

    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    let filterdata = allMessage?.filter((item) => item.text.toLowerCase().includes(searchkey?.toLowerCase()))


    useEffect(() => {
        if (user.selectSms) {
            if (user.selectSms.imageUrl) {
                setFile(user.selectSms.imageUrl);
                setMediaType('image');
            } else if (user.selectSms.docUrl) {
                setFile(user.selectSms.docUrl);
                setMediaType('doc');
            } else if (user.selectSms.videoUrl) {
                setFile(user.selectSms.videoUrl);
                setMediaType('video');
            } else if (user.selectSms.audioUrl) {
                setFile(user.selectSms.audioUrl);
                setMediaType('audio');
            } else {
                setFile(null); // Clear the file if no media found
                setMediaType(null);
            }
        }
    }, [user.selectSms]); // Re-run when user.selectSms changes


    const handleNavigateOnUserProfile = () => {
        dispatch(setUserId(user.userData._id))
        navigation.navigate('User Profile')
    }

    const getFileExtension = (url) => {
        if (!url) return ''; // Return an empty string if there's no URL

        const lastSlashIndex = url.lastIndexOf('/'); // Find the last slash
        const fileName = url.substring(lastSlashIndex + 1); // Get the file name after the last slash
        const lastDotIndex = fileName.lastIndexOf('.'); // Find the last dot in the file name

        return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : ''; // Extract the extension
    };

    // Function to get the appropriate image based on file type
    const getFileIcon = (url) => {
        const extension = getFileExtension(url); // Get the file extension from the helper function

        switch (extension) {
            case 'pdf':
                return require('../../assets/pdf.png');
            case 'doc':
            case 'docx':
                return require('../../assets/doc.png');
            case 'csv':
                return require('../../assets/csv.png');
            case 'xlsx':
                return require('../../assets/xlsx.png');
            default:
                return require('../../assets/docu.png'); // Default image for unknown file types
        }
    };



    const downloadImageRemote = async (url) => {
        try {
            const fileName = url.split('/').pop(); // Extract file name from URL
            const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`; // Set destination path

            if (Platform.OS === 'android') {
                const isAndroid11OrHigher = Platform.Version >= 30;

                // Only request permission for Android versions below 11
                if (!isAndroid11OrHigher) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permission Denied', 'Storage permission is required to download files.');
                        return;
                    }
                }
            }

            // Start the download
            const result = await RNFS.downloadFile({
                fromUrl: url,
                toFile: downloadDest,
            }).promise;

            if (result.statusCode === 200) {
                Alert.alert('Download Complete', `File saved to: ${downloadDest}`);
            } else {
                Alert.alert('Download Failed', 'Unable to download the file.');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            Alert.alert('Download Error', error.message);
        }
    };

    return (
        <SafeAreaView style={[styles.notiParent, user.isDarkMode && { backgroundColor: "#0D142E" }]}>

            {top.main &&
                <View
                    style={[styles.ashishRajputParent]}
                >
                    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} >
                        <Image
                            style={styles.groupChild1}
                            resizeMode="cover"
                            source={require("../../assets/group-94591.png")}
                        />
                    </TouchableOpacity>

                    <View style={styles.headerAllIcon}>
                        <TouchableOpacity style={styles.headerTitleIcon} onPress={() => handleNavigateOnUserProfile()}>
                            <View style={styles.headerAvatar}>
                                <Image
                                    style={[styles.groupChild, styles.childFrameLayout]}
                                    resizeMode="cover"
                                    source={{ uri: user.userData.userProfile }}
                                />
                                <View style={[dataUser.online ? styles.mditickCircle : styles.mditickCircle1, styles.comcircle]} />
                            </View>
                            <Text style={[styles.ashishRajput, styles.amText]}>
                                {`${(user.userData.firstName + " " + user.userData.lastName).substring(0, 10)}...`}
                            </Text>


                        </TouchableOpacity>
                        <View style={styles.headerIcon}>
                            <TouchableOpacity onPress={() => navigation.navigate('Call Video')} >
                                <Image
                                    style={[styles.groupItem, styles.groupLayout]}
                                    resizeMode="cover"
                                    source={require("../../assets/frame-1848422.png")}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Call Video')}>
                                <Image
                                    style={[styles.groupInner, styles.groupLayout]}
                                    resizeMode="cover"
                                    source={require("../../assets/frame-1848433.png")}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} >
                                <Image
                                    style={[styles.groupIcon, styles.iconLayout1]}
                                    resizeMode="cover"
                                    source={require("../../assets/group6.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }

            {
                top.edit &&
                <View style={[styles.isEnableOpt, user.isDarkMode && { backgroundColor: "#1a2a3a" }]}>
                    <TouchableOpacity style={styles.topicon} onPress={() => setTop({ main: true, edit: false, search: false })}>
                        <Image source={require('../../assets/iconoircancel.png')} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                    <View style={styles.topicon}>
                        <Text style={{ fontSize: 22, fontWeight: "700", color: user.isDarkMode ? "#fff" : "black" }}>{1}</Text>
                    </View>
                    <TouchableOpacity style={styles.topicon} onPress={() => setRead(!read)} >
                        <Image source={require("../../assets/read.png")} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topicon} onPress={() => handleDeleteSms()} >
                        <Image source={require("../../assets/delete.png")} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topicon} onPress={() => handleCopyText()} >
                        <Image source={require("../../assets/copy.png")} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topicon} onPress={() => handleForward()} >
                        <Image source={require("../../assets/share.png")} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topicon} onPress={() => setMenu(!menu)} >
                        <Image source={require("../../assets/menu.png")} style={{ height: 30, width: 30, tintColor: user.isDarkMode ? "#fff" : undefined }} />
                    </TouchableOpacity>
                </View>
            }
            {
                top.search &&
                <View style={styles.searchTop} >
                    <TextInput
                        placeholderTextColor={user.isDarkMode ? "#fff" : "#999"}
                        placeholder="Search Here ..."
                        style={{ borderRadius: 15, borderWidth: 2, borderColor: user.isDarkMode ? '#fff' : '#ccc', paddingLeft: 20, backgroundColor: user.isDarkMode ? 'black' : '#F5F5F5', color: user.isDarkMode ? '#fff' : '#000' }}
                        value={searchkey}
                        onChangeText={(txt) => setSearchKey(txt)}
                        onFocus={() => setTop({ ...top, search: true, main: false, edit: false })}
                    />


                    <TouchableOpacity
                        style={{ top: 0, right: 20, position: "absolute", width: 50, zIndex: 1000 }}
                        onPress={() => {
                            setSearchKey('');
                            setTop({ search: false, main: true, edit: false });
                        }} >
                        <Image source={require('../../assets/iconoircancel.png')} style={{ height: 50, width: 50, tintColor: user.isDarkMode ? "white" : "#333" }} />
                    </TouchableOpacity>

                </View>
            }


            <ScrollView
                ref={scrollViewRef}
                style={[styles.aMParent, user.isDarkMode && { backgroundColor: "#000" }]}
            >

                <View style={{ paddingBottom: 80 }}>
                    {
                        allMessage?.length > 0 ?
                            filterdata?.length > 0 ?
                                filterdata?.map((item, index) => {
                                    return (
                                        item.msgByUserId._id === user._id ?
                                            <Pressable key={index} style={[styles.chatMessage1]} onLongPress={() => handleSelect(item)} >
                                                <View style={[styles.frameParent, styles.frameShadowBox]}>
                                                    <View style={styles.chatMessageLayout1}>

                                                        <View
                                                            style={[styles.helloHowsEveryoneDoingParent, styles.helloLayout, item?.msgByUserId === user?._id && styles.activehelloLayout]}
                                                        >
                                                            {
                                                                item?.imageUrl !== '' &&
                                                                <TouchableOpacity onPress={() => {setImages(item?.imageUrl),setIsVisible(true)}} >
                                                                    <Image source={{ uri: item?.imageUrl }} style={{ height: 120, borderRadius: 15 }} />

                                                                </TouchableOpacity>
                                                            }
                                                            {
                                                                item?.videoUrl !== '' &&
                                                                <View>

                                                                    <Video
                                                                        source={{ uri: item?.videoUrl }}                  // the video file
                                                                        shouldPlay={false}    
                                                                        style={{ height: 120, borderRadius: 15 }}  // any style you want
                                                                        repeat={true}
                                                                        resizeMode="contain"
                                                                        controls={true}
                                                                    />
                                                                </View>
                                                            }
                                                            {
                                                                item?.audioUrl !== '' &&
                                                                <View>
                                                                    <RNVoiceMessagePlayer source={{ uri: item?.audioUrl }} />
                                                                </View>
                                                            }
                                                            {
                                                                item?.docUrl !== '' &&
                                                                <TouchableOpacity style={
                                                                    {
                                                                        flexDirection: "row",
                                                                        justifyContent: "flex-start",
                                                                        alignItems: "center",
                                                                        backgroundColor: "gray",
                                                                        borderRadius: 15,
                                                                        paddingHorizontal: 4,
                                                                        paddingVertical: 10

                                                                    }
                                                                }
                                                                    onPress={() => downloadImageRemote(item?.docUrl)}
                                                                >
                                                                    <Image style={{ height: 35, width: 35 }} source={getFileIcon(item?.docUrl)} />
                                                                    <Text style={{ color: "blue", fontSize: 12, padding: 10 }} >{`...${item?.docUrl?.slice(-25)}`}</Text>
                                                                </TouchableOpacity>
                                                            }
                                                            <Hyperlink

                                                                //  onPress={ (url, text) => Linking.openURL(url) }

                                                                onPress={(url, text) => {
                                                                    if (url.startsWith('tel:')) {
                                                                        Linking.openURL(url);
                                                                    } else {
                                                                        Linking.openURL(url);
                                                                    }
                                                                }}
                                                                inkify={linkify}
                                                                linkStyle={{ color: '#2980b9', textDecorationLine: 'underline' }}
                                                            >
                                                                <Text style={[styles.helloHowsEveryone, styles.helloTypo1]}>
                                                                    {item?.text}
                                                                </Text>
                                                            </Hyperlink>
                                                        </View>
                                                        <Image
                                                            style={[styles.ellipseIcon, item?.msgByUserId === user?._id && { tintColor: "#A9C2D0" }]}
                                                            resizeMode="cover"
                                                            source={require("../../assets/ellipse-222.png")}
                                                        />

                                                    </View>
                                                    <View style={styles.activeText}>
                                                        <Text
                                                            style={[styles.aM, styles.aMFlexBox, user.isDarkMode && { color: "#fff" }]}
                                                        >
                                                            {formatTime(item?.updatedAt)}
                                                        </Text>
                                                        {
                                                            item?.seen ?
                                                                <Image
                                                                    resizeMode="cover"
                                                                    source={require("../../assets/vector.png")}
                                                                />
                                                                :
                                                                <Image
                                                                    style={{ height: 10, width: 15, tintColor: "gray" }}
                                                                    resizeMode="cover"
                                                                    source={require("../../assets/mdi_tick.png")}
                                                                />
                                                        }

                                                    </View>
                                                </View>
                                                <Image
                                                    resizeMode="cover"
                                                    style={{ height: 40, width: 40, borderRadius: 30, borderWidth: 2, borderColor: "#9B7BFF" }}
                                                    source={{ uri: user.userProfile }}
                                                />
                                            </Pressable> :
                                            <Pressable style={styles.chatMessage2} key={index} onPress={() => handleSelect(item)}>
                                                <Image
                                                    resizeMode="cover"
                                                    style={{ height: 40, width: 40, borderRadius: 30, borderWidth: 2, borderColor: "#9B7BFF" }}
                                                    source={{ uri: item?.msgByUserId?.userProfile }}
                                                />
                                                <View style={[styles.frameParent1, styles.frameShadowBox]}>
                                                    <View style={styles.chatMessageLayout1}>

                                                        <View
                                                            style={[styles.helloHowsEveryoneDoingParent, styles.helloLayout]}
                                                        >
                                                            {
                                                                item?.imageUrl !== '' &&
                                                                <TouchableOpacity onPress={() => {setImages(item?.imageUrl),setIsVisible(true)}} >
                                                                    <Image source={{ uri: item?.imageUrl }} style={{ height: 100, height: 120, borderRadius: 15 }} />
                                                                    {/* <Text style={{color:"#000"}} >Image</Text> */}
                                                                </TouchableOpacity>
                                                            }
                                                            {
                                                                item?.videoUrl !== '' &&
                                                                <View>
                                                                    {/* <Text style={{color:"#fff"}} >video text</Text> */}
                                                                    <Video
                                                                        source={{ uri: item?.videoUrl }}                  // the video file
                                                                        shouldPlay={false}    
                                                                        style={{ height: 120, borderRadius: 15 }}  // any style you want
                                                                        repeat={true}
                                                                        resizeMode="contain"
                                                                        controls={true}
                                                                    />
                                                                </View>
                                                            }
                                                            {
                                                                item?.audioUrl !== '' &&
                                                                <View>
                                                                    <RNVoiceMessagePlayer source={{ uri: item?.audioUrl }} />
                                                                </View>
                                                            }
                                                            {
                                                                item?.docUrl !== '' &&
                                                                <TouchableOpacity

                                                                    style={
                                                                        {
                                                                            flexDirection: "row",
                                                                            justifyContent: "flex-start",
                                                                            alignItems: "center",
                                                                            backgroundColor: "gray",
                                                                            borderRadius: 15,
                                                                            paddingHorizontal: 4,
                                                                            paddingVertical: 10

                                                                        }
                                                                    }

                                                                >
                                                                    <Image style={{ height: 35, width: 35 }} source={getFileIcon(item?.docUrl)} />
                                                                    <Text style={{ color: "blue", fontSize: 12, padding: 10 }} >{`...${item?.docUrl?.slice(-25)}`}</Text>
                                                                </TouchableOpacity>
                                                            }
                                                            <Hyperlink

                                                                //  onPress={ (url, text) => Linking.openURL(url) }

                                                                onPress={(url, text) => {
                                                                    if (url.startsWith('tel:')) {
                                                                        Linking.openURL(url);
                                                                    } else {
                                                                        Linking.openURL(url);
                                                                    }
                                                                }}
                                                                inkify={linkify}
                                                                linkStyle={{ color: '#2980b9', textDecorationLine: 'underline' }}
                                                            >
                                                                <Text style={[styles.helloHowsEveryone, styles.helloTypo1]}>
                                                                    {item?.text}
                                                                </Text>
                                                            </Hyperlink>

                                                        </View>
                                                    </View>
                                                    <View style={styles.activeText1}>
                                                        <Text
                                                            style={[styles.aM, styles.aMFlexBox, user.isDarkMode && { color: "#fff" }]}
                                                        >
                                                            {formatTime(item?.updatedAt)}</Text>
                                                    </View>
                                                </View>

                                            </Pressable>
                                    )
                                })
                                :
                                <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: 50 }}>
                                    <Text style={{ color: user.isDarkMode ? "#fff" : "black" }}>
                                        No result found with {`"${searchkey}"`}
                                    </Text>
                                </View>
                            :
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: "80%", height: "100%" }} >
                                {/* <ActivityIndicator size="large" /> */}
                                <Text style={[{ color: "black", fontSize: 20, fontWeight: "600" }, user.isDarkMode && { color: "#fff" }]} >Chat Not Found, Let's Start</Text>
                            </View>

                    }

                    {
                        isBlockedUser === 0 &&
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 30 }} >
                            <Image source={require('../../assets/block.png')} style={{ height: 30, width: 30, marginRight: 10 }} />
                            <Text style={{ color: "red" }} >{`Blocked by ${user.userData.firstName + " " + user.userData.lastName}`}</Text>
                        </View>
                    }

                    {
                        chatLoader &&
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: "50%", height: "100%" }} >
                            <ActivityIndicator size="large" />
                        </View>
                    }



                </View>
            </ScrollView>


            {
                enableedit ?
                    <View style={[styles.bottomIcons, enableedit && { backgroundColor: "#A9C2D0" }]} >
                        <View style={[styles.typeMessageParent, enableedit && { width: "100%" }]}>

                            <TextInput style={[styles.typeMessage, enableedit && { backgroundColor: "#000", width: '70%' }]}
                                placeholder="Type Message..."
                                multiline={true}
                                value={editText}
                                onChangeText={(txt) => setEditText(txt)}
                            />

                            <TouchableOpacity onPress={() => handleEditMessage()} style={{ marginLeft: 10 }} >
                                <Image source={require('../../assets/rightArrow.png')} style={{ width: 35, height: 35 }} />
                            </TouchableOpacity>


                            <TouchableOpacity onPress={() => setEnableEdit(!enableedit)} >
                                <Image source={require('../../assets/iconoircancel.png')} style={{ height: 40, width: 40, tintColor: "white" }} />
                            </TouchableOpacity>

                        </View>
                    </View>
                    :
                    isBlockedUser !== 0 &&
                    <View style={styles.bottomIcons}>
                        <TouchableOpacity style={{ width: '10%' }} onPress={() => setMediaModal(true)} >
                            <Image
                                resizeMode="cover"
                                source={require("../../assets/icbaselineplus.png")}
                                style={user.isDarkMode && { tintColor: "#fff" }}
                            />
                        </TouchableOpacity>
                        <View style={[styles.typeMessageParent]}>

                            <TextInput style={[styles.typeMessage, styles.helloTypo1]}
                                placeholder="Type Message..."
                                multiline={true}
                                value={text}
                                onChangeText={(txt) => setText(txt)}
                            />
                            {
                                text !== '' &&
                                <TouchableOpacity onPress={() => handleSendMessage()} style={{ marginLeft: 10 }} >
                                    <Image source={require('../../assets/rightArrow.png')} style={{ width: 35, height: 35 }} />
                                </TouchableOpacity>
                            }

                            {text === '' &&
                                <Pressable style={styles.microphoneIcon}>
                                    <Image
                                        resizeMode="cover"
                                        source={require("../../assets/materialsymbolsmic.png")}
                                    />
                                </Pressable>}
                        </View>

                    </View>
            }





            {
                isImg &&
                <View style={styles.Isimg} >
                    <ActivityIndicator size="large" color="#00ff00" />
                </View>
            }

            {
                file !== null &&
                <View style={styles.showImg} >
                    {
                        mediaType === 'image' &&
                        <Image source={{ uri: file?.mediaurl || file }} style={{ height: 200, width: 200 }} />
                    }

                    {
                        mediaType === 'doc' &&

                        <View style={
                            {
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                backgroundColor: "gray",
                                borderRadius: 15,
                                paddingHorizontal: 4,
                                paddingVertical: 10

                            }
                        } >
                            <Image style={{ height: 35, width: 35 }} source={getFileIcon(file?.mediaurl || file.docUrl)} />
                            <Text style={{ color: "blue", fontSize: 12, padding: 10 }} >{`...${file?.mediaurl?.slice(-25) || file.slice(-25)}`}</Text>
                        </View>
                    }
                    {
                        mediaType === 'video' &&
                        <View style={{ width: 250 }}>
                            <Video
                                source={{ uri: file?.mediaurl || file }}                  // the video file
                                shouldPlay={false}    
                                style={{ height: 120, borderRadius: 15 }}  // any style you want
                                repeat={true}
                                resizeMode="contain"
                                controls={true}
                            />
                        </View>
                    }
                    {
                        mediaType === 'audio' &&
                        <RNVoiceMessagePlayer source={{ uri: file?.mediaurl || file }} />

                    }
                    <Text style={{ color: "#000" }} >{text}</Text>

                </View>
            }

            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                backdropColor="#fff"

            >
                <View style={[styles.userModel, user.isDarkMode && { backgroundColor: "#000", borderColor: "#fff", borderWidth: 1 }]} >
                    <TouchableOpacity style={styles.modelitem} onPress={() => { setTop({ search: true }); setModalVisible(!modalVisible) }} >
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]} >Search</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modelitem} onPress={() => handleClearChat()} >
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]}>Clear history</Text>
                    </TouchableOpacity>
                    {
                        isActiveConvUser === 0 ?
                            <TouchableOpacity style={styles.modelitem} onPress={() => handleUnblockUser()} >
                                <Text style={[styles.modeltext, isActiveConvUser === 0 && { color: 'red' }]}>Unblock</Text>
                            </TouchableOpacity>
                            : <TouchableOpacity style={styles.modelitem} onPress={() => handleBlockUser()} >
                                <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]}>Block</Text>
                            </TouchableOpacity>
                    }

                </View>
            </Modal>
            <Modal
                isVisible={menu}
                onBackdropPress={() => setMenu(false)}
                backdropColor="#fff "

            >
                <View style={[styles.userModel, user.isDarkMode && { backgroundColor: "#000", borderColor: "#fff", borderWidth: 1 }]} >
                    <TouchableOpacity style={styles.modelitem} onPress={() => { setEnableEdit(!enableedit); setTop({ main: true, edit: false, search: false }); setMenu(!menu) }} >
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]} >Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modelitem}>
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]}>Star</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modelitem}>
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modelitem}>
                        <Text style={[styles.modeltext, user.isDarkMode && { color: "#fff" }]}>Pin</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal
                isVisible={emoji}
                onBackdropPress={() => setEmoji(false)}
                backdropColor="#fff "

            >
                <View style={styles.emojilayout}>
                    <EmojiSelector
                        theme="#007AFF"
                        category={Categories.all}
                        onEmojiSelected={emoji => console.log(emoji)}
                        showSearchBar={true}
                        showTabs={true}
                        showHistory={true}
                        showSectionTitles={true}
                        placeholder="Search Here"
                        style={styles.emojistyle}

                    />
                </View>

            </Modal>

            <Modal
                isVisible={read}
                onBackdropPress={() => setRead(false)}
                backdropColor="#fff"

            >
                <View style={[styles.readcontainer, user.isDarkMode && { backgroundColor: "#000", borderColor: "#fff", borderWidth: 1 }]}>

                    <View style={{ backgroundColor: "#D9E6EB", borderRadius: 10, padding: 8 }}>
                        {
                            selectsms?.imageUrl !== '' &&
                            <Image source={{ uri: selectsms?.imageUrl }} style={{ height: 200, width: "100%" }} />
                        }
                        <Text style={{ color: "black", marginBottom: 40, marginTop: 10 }}>
                            {selectsms?.text}
                        </Text>
                        <Text style={{ color: "black" }}>
                            Delivered : {`${selectsms?.createdAt?.substring(0, 10)}, ${formatTime(selectsms?.createdAt)}`}
                        </Text>
                        <Text style={{ color: "black" }}>
                            Read : {`${selectsms?.updatedAt?.substring(0, 10)}, ${formatTime(selectsms?.updatedAt)}`}
                        </Text>
                    </View>

                </View>

            </Modal>

            <Modal
                isVisible={mediaModal}
                onBackdropPress={() => setMediaModal(false)}
                backdropColor="#ebedf0d9"
                hasBackdrop={true}
            // backdropOpacity={0.3}

            >
                <View style={{ width: "100%", height: 'auto', position: "absolute", bottom: 0, left: 0, backgroundColor: "#fff", borderRadius: 20 }}>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 20 }} >
                        <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleDocumentSelection(DocumentPicker.types.images, 'image')}
                        >

                            <Image source={require('../../assets/media.png')} style={{ tintColor: "black", height: 50, width: 50 }} />

                            <Text>Images</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleDocumentSelection(DocumentPicker.types.video, 'video')}

                        >

                            <Image source={require('../../assets/video.png')} style={{ tintColor: "black", height: 50, width: 50 }} />

                            <Text>Videos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleDocumentSelection(DocumentPicker.types.audio, 'audio')}

                        >

                            <Image source={require('../../assets/audio.png')} style={{ tintColor: "black", height: 50, width: 50 }} />

                            <Text>Audios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                            onPress={() => handleDocumentSelection(DocumentPicker.types.allFiles, 'doc')}

                        >

                            <Image source={require('../../assets/file2.png')} style={{ tintColor: "black", height: 50, width: 50 }} />

                            <Text>Documents</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ImageView
                images={[
                    {
                        uri: images
                    }
                ]}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setIsVisible(false)}
            />

        </SafeAreaView>
    );
};

const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
    isEnableOpt: {
        flexDirection: "row",
        height: 50,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: "center", width: "100%",
        marginBottom: 20,
        backgroundColor: "#D9E6EB",
        paddingHorizontal: 20
    },
    searchTop: {
        width: "100%",
        paddingHorizontal: 20,
        marginVertical: 20,
        position: "relative",
        zIndex: 999
    },
    readcontainer: {
        backgroundColor: "white",
        width: "80%",
        borderRadius: 20,
        top: 50,
        left: "12%",
        elevation: 10,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        padding: 15,
        position: "relative"
    },
    emojilayout: {
        backgroundColor: "white",
        width: '80%',
        height: "70%",
        position: "absolute",
        top: 70,
        right: 50,
        zIndex: 1000,
        shadowOpacity: 1,
        elevation: 10,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        padding: 10,
        overflow: "hidden",
        borderRadius: 30,
        paddingTop: 30
    },
    emojistyle: {
        color: "black"
    },
    topicon: {
        width: "15%",
    },
    modelitem: {
        marginBottom: 10,
        paddingLeft: 15
    },
    modeltext: {
        color: "black"
    },
    userModel: {
        paddingVertical: 20,
        backgroundColor: "white",
        borderRadius: 10,
        width: "60%",
        position: "absolute",
        top: 65,
        right: 20,
        shadowOpacity: 1,
        elevation: 10,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    Isimg: {
        flexDirection: 'row',
        justifyContent: 'center', width: "100%", height: "100%",
        alignItems: 'center',
        width: '100%',
        backgroundColor: "#0000002e",
        height: "100%",
        // bottom: 0,
        // position: 'fixed',
        // marginTop: 3 * vh,
        position: 'absolute',
        top: 0,
        paddingHorizontal: 20,
    },
    showImg: {
        position: "absolute",
        bottom: 70,
        // left:0,
        right: 20,
        width: '80%',
        height: "auto",
        backgroundColor: "#fff",
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        borderRadius: 20,
        paddingVertical: 15
    },

    iconLayout2: {
        width: 22,
        height: 20,
        top: 0,
        position: "absolute",
        overflow: "hidden",
    },
    activeText: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        marginTop: 1 * vh,
    },
    activeText1: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        marginTop: 1 * vh,
    },
    groupPosition: {
        top: 11,
        position: "absolute",
    },
    microphoneIcon: {
        backgroundColor: Color.colorBlack,
        borderRadius: Border.br_31xl,
        padding: 1 * vh,
        // width:'10%'
    },
    chatMessage1: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginTop: 3 * vh,
    },
    chatMessage2: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginTop: 4 * vh,
        marginLeft: 1 * vh,
    },
    chatMessageLayout1: {
        height: 'auto'
    },
    amText: {
        textShadowRadius: 4,
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowColor: "rgba(0, 0, 0, 0.25)",
    },
    back: {
        width: "10%"
    },
    headerAllIcon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '85%',
    },
    headerTitleIcon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "60%"
    },
    headerIcon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: "35%"
    },
    headerAvatar: {
        position: 'relative'
    },

    childFrameLayout: {
        height: 55,
        width: 55,
        borderRadius: 30,
        borderColor: "blue",
        borderWidth: 1
    },
    bottomIcons: {
        // display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 60,
        position: 'absolute',
        bottom: 0,
        paddingHorizontal: 20,
    },
    groupLayout: {
        height: 35,
        width: 35,
        overflow: "hidden",
    },

    images4: {
        display: 'flex',
        flexDirection: 'row',
    },
    amTypo: {
        color: Color.colorDimgray_100,
        textAlign: "center",
        fontFamily: FontFamily.nunitoRegular,
        fontSize: FontSize.size_3xs,
        // position: "absolute",
    },
    vectorIconLayout: {
        width: "2.51%",
        height: "0.75%",
        maxHeight: "100%",
        maxWidth: "100%",
        position: "absolute",
        overflow: "hidden",
    },
    frameShadowBox: {
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        // position: "absolute",
    },
    helloLayout: {
        height: 'auto',
        width: 241,
        //  position: "absolute",
    },
    activehelloLayout: {
        backgroundColor: "#A9C2D0"
    },

    subImages1: {
        marginRight: 1 * vh,
    },
    subImages3: {
        marginBottom: 1 * vh,
    },
    helloHowsEveryone4: {
        marginVertical: 1 * vh,
    },

    helloTypo: {
        // top: 31,
        fontFamily: FontFamily.nunitoBold,
        fontWeight: "700",
        fontSize: FontSize.size_mini,
        //  left: 12,
        textAlign: "left",
        //position: "absolute",
    },
    frameChildPosition1: {
        left: 13,
        position: "absolute",
    },
    frameChildPosition: {
        left: 335,
        height: 35,
        width: 35,
        position: "absolute",
    },
    iconPosition: {
        borderBottomLeftRadius: Border.br_8xs,
        borderTopLeftRadius: Border.br_8xs,
        left: 122,
        width: 108,
        position: "absolute",
    },

    iconLayout: {
        // height: 24,
        // width: 24,
        position: "absolute",
        //  overflow: "hidden",
        //left:0
    },
    frameChildLayout: {
        height: 33,
        width: 33,
        position: "absolute",
    },
    noti: {
        backgroundColor: Color.colorBlack,
        height: 28,
        left: 0,
        top: 0,
    },
    signal1Icon: {
        left: 270,
    },
    fullBattery1Icon: {
        left: 294,
    },
    pm: {
        top: 2,
        lineHeight: 15,
        width: 51,
        textAlign: "left",
        color: Color.colorWhite,
        fontFamily: FontFamily.interSemiBold,
        fontWeight: "600",
        fontSize: FontSize.size_3xs,
        left: 0,
        position: "absolute",
    },
    signal1Parent: {
        top: 4,
        left: 29,
        width: 317,
        height: 20,
        position: "absolute",
    },
    signal1: {
        left: 0,
    },
    fullBattery1: {
        left: 24,
    },
    signal1Group: {
        left: 299,
        width: 46,
        height: 20,
    },
    comcircle: {
        width: 10,
        height: 10,
        position: "absolute",
        overflow: "hidden",
        right: 0,
        bottom: 1 * vh,
        borderRadius: Border.br_17xl,

    },
    mditickCircle: {
        backgroundColor: Color.colorSpringgreen
    },
    mditickCircle1: {
        backgroundColor: "#808080"
    },
    ashishRajput: {
        // top: 18,
        fontSize: 16,
        // left: 52,
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowColor: "rgba(0, 0, 0, 0.25)",
        // textAlign: "left",
        color: Color.colorWhite,
        // fontFamily: FontFamily.interSemiBold,
        fontWeight: "600",
        marginLeft: 1 * vh,
        // position: "absolute",
    },
    groupIcon: {

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',

    },

    ashishRajputParent: {
        width: "100%",
        height: 80,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
        //height:3*vh,
    },
    groupChild1: {
        width: 34,
        height: 31,
        //  top: 14,
        // left: 0,
        //  position: "absolute",
    },


    aM: {
        //top: 6,
        color: Color.colorDimgray_200,
        fontFamily: FontFamily.nunitoRegular,
        textAlign: "center",
        // left: 52,
        fontSize: FontSize.size_3xs,
        marginRight: 1 * vh,
    },
    am: {
        top: 105,
        textShadowRadius: 4,
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowColor: "rgba(0, 0, 0, 0.25)",
        left: 270,
    },
    am1: {

        textShadowRadius: 4,
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowColor: "rgba(0, 0, 0, 0.25)",
    },

    vectorIcon1: {
        top: "43.27%",
        right: "13.23%",
        bottom: "55.98%",
        left: "84.27%",
    },
    helloHowsEveryone: {
        color: Color.colorBlack,
        // left: 12,
        // top: 8,
        fontWeight: "500",
        fontSize: 14,
        textAlign: "left",
        marginVertical: 10
        // position: "absolute",
    },
    helloHowsEveryone1: {
        color: Color.colorBlack,
    },
    helloHowsEveryoneDoingParent: {
        backgroundColor: Color.colorGainsboro_100,
        borderRadius: Border.br_xl,
        paddingHorizontal: 1 * vh,
        paddingVertical: 1 * vh,

    },
    helloHowsEveryoneDoingParent4: {
        backgroundColor: Color.colorGainsboro_100,
        borderRadius: Border.br_xl,
        paddingHorizontal: 1 * vh,
        paddingVertical: 1 * vh,

    },
    helloHowsEveryoneDoingParent3: {
        backgroundColor: Color.colorBlack,
        borderRadius: Border.br_xl,
        paddingHorizontal: 1 * vh,
        paddingVertical: 1 * vh,
        color: Color.colorWhite,

    },
    ellipseIcon: {

        width: 26,
        height: 26,
        position: "absolute",
        right: 0,
        bottom: 0
    },
    ellipseIcon1: {

        width: 26,
        height: 26,
        position: "absolute",

    },
    frameParent: {
        // top: 34,
        // left: 84,
        // position: 'relative',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: '100%',
        marginRight: 1 * vh,

    },
    frameParent1: {
        // top: 34,
        // left: 84,
        // position: 'relative',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: 1 * vh,

    },
    helloHowsEveryone2: {
        left: 12,
        top: 8,
        fontWeight: "700",
        fontSize: FontSize.size_mini,
        textAlign: "center",
        position: "absolute",
        color: Color.colorWhite,
    },
    helloHowsEveryone3: {
        color: Color.colorWhite,
    },
    helloHowsEveryoneDoingGroup: {
        backgroundColor: Color.colorGray_1200,
        borderRadius: Border.br_xl,
        width: 241,
        left: 0,
        top: 0,
        overflow: "hidden",
    },
    frameGroup: {
        top: 217,
        left: 83,
    },
    frameChild: {
        top: 159,
        height: 35,
        width: 35,
    },
    frameChild1: {
        top: 70,
    },
    frameChild2: {
        top: 253,
    },
    helloHowsEveryoneDoingContainer: {
        backgroundColor: Color.colorWhitesmoke_100,
        borderRadius: Border.br_xl,
        width: 241,
        left: 0,
        top: 0,
        overflow: "hidden",
    },
    frameWrapper: {
        top: 128,
        left: 72,
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    am2: {
        top: 196,
        left: 78,
        textShadowRadius: 4,
        textShadowOffset: {
            width: 0,
            height: 4,
        },
        textShadowColor: "rgba(0, 0, 0, 0.25)",
    },
    helloHowsEveryone6: {
        top: 164,
        color: Color.colorBlack,
        fontFamily: FontFamily.nunitoBold,
        fontWeight: "700",
        fontSize: FontSize.size_mini,
        textAlign: "left",
    },
    image44Icon: {
        left: 10,
        borderTopLeftRadius: Border.br_xl,
        borderBottomLeftRadius: Border.br_xl,
        height: 151,
        width: 108,
        borderBottomRightRadius: Border.br_8xs,
        borderTopRightRadius: Border.br_8xs,
        top: 9,
        position: "absolute",
    },
    image45Icon: {
        borderTopRightRadius: Border.br_xl,
        height: 77,
        borderBottomRightRadius: Border.br_8xs,
        top: 9,
        borderBottomLeftRadius: Border.br_8xs,
        borderTopLeftRadius: Border.br_8xs,
        left: 122,
    },
    image46Icon: {
        top: 89,
        borderBottomRightRadius: Border.br_xl,
        height: 71,
        borderBottomLeftRadius: Border.br_8xs,
        borderTopLeftRadius: Border.br_8xs,
        left: 122,
        borderTopRightRadius: Border.br_8xs,
    },
    frameView: {
        top: 312,
        left: 68,
        width: 240,
        height: 217,
        backgroundColor: Color.colorGainsboro_200,
        borderRadius: Border.br_xl,
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
        position: "absolute",
        overflow: "hidden",
    },
    am3: {
        top: 535,
        left: 54,
    },
    icbaselinePlusIcon: {
        top: 616,
        left: 23,
        width: 20,
        height: 20,
        position: "absolute",
        overflow: "hidden",
    },
    typeMessage: {
        color: Color.colorDarkgray,
        left: 14,
        textAlign: "center",
        width: '80%',
        height: 'auto',
        borderWidth: 1,
        borderRadius: 30,
        backgroundColor: '#E0E0E0',
        borderColor: "#E0E0E0"
        // position: "absolute",
        // top: 14,
    },
    fluentemoji24RegularIcon: {
        top: 12,
        left: 201,
        position: 'absolute',
        right: 0,
        width: 30
        // borderWidth:1
    },
    typeMessageParent: {
        width: '90%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

    },
    frameChild3: {
        left: 305,
        width: 48,
        height: 48,
        top: 602,
    },
    materialSymbolsmicIcon: {
        top: 614,
        left: 317,
    },
    typeMessageGroup: {
        width: 235,
        borderRadius: Border.br_4xl,
        left: 60,
        height: 48,
        top: 602,
        backgroundColor: Color.colorGainsboro_200,
        overflow: "hidden",
        shadowOpacity: 1,
        elevation: 4,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: "rgba(0, 0, 0, 0.25)",
    },
    frameIcon: {
        top: 666,
        height: 18,
        left: 0,
    },
    lineIcon: {
        top: 16,
        left: 160,
        width: 56,
    },
    frameChild7: {
        top: 71,
        left: 336,
        height: 33,
        width: 33,
    },
    frameChild8: {
        top: 160,
        left: 14,
    },
    frameChild9: {
        top: 492,
        height: 35,
        width: 35,
    },
    frameChild12: {
        top: 493,
        left: 14,
    },
    frameChild13: {
        top: 254,
        left: 336,
        height: 33,
        width: 33,
    },
    aMParent: {
        // top: 106,
        borderTopLeftRadius: Border.br_16xl,
        borderTopRightRadius: Border.br_16xl,
        height: '90%',

        backgroundColor: Color.colorWhite,
        width: '100%',
        paddingHorizontal: 10,

    },
    notiParent: {
        // borderRadius: Border.br_16xl,
        flex: 1,
        width: "100%",

        height: '100%',

        backgroundColor: Color.colorCornflowerblue_100,
    },
});

export default UserChat;
