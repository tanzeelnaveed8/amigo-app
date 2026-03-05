import { Animated, Dimensions, FlatList, Platform, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import {LinearGradient} from 'expo-linear-gradient'
import RNText from '../../component/atoms/text'
import fontSize from '../../constants/font-size'
import fontWeight from '../../constants/font-weight'
import ShareImageIcon from '../../assets/svg/shareimage.icon'
import styles from './styles'
import useNavigationHook from '../../hooks/use_navigation'
import BackArrow from '../../assets/svg/backArrow'
import * as ImagePicker from '../../utils/imagePickerCompat';
import DocumentPicker from '../../utils/documentPickerCompat';
import { Data } from './data'
import Context from '../../context'
import { useMutation } from 'react-query'
import { UploadImage, getUploadedImage } from '../../apis/auth'
import { images } from '../../constants/image'
import { useSelector } from 'react-redux'
import { useRoute } from '@react-navigation/native'
// import { VLCPlayer } from 'react-native-vlc-media-player'
import PlayerIcon from '../../assets/svg/player.icon'
import ShareSongIcon from '../../assets/svg/sharesong.icon'
import ListemptyComponent from '../../component/atoms/listEmptyComponent'
import ShareFileIcon from '../../assets/svg/sharefile.icon'
import {Image as FastImage} from 'expo-image'
import useTopEnterAnim from '../../hooks/useTopEnterAnim'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const GRID_GAP = 12
const GRID_SIDE_PADDING = 20
const ITEM_WIDTH = (SCREEN_WIDTH - (GRID_SIDE_PADDING * 2) - GRID_GAP) / 2
const ITEM_HEIGHT = ITEM_WIDTH * 1.25

const ShareItScreen = () => {
    const route = useRoute<any>().params || {}
    const navigation = useNavigationHook()
    const { colors } = useContext(Context)
    const [mediatype, setMediaType] = useState('image')
    const { setLoader, setShareMsg } = useContext(Context)
    const userData: any = useSelector((state: any) => state.loginData);
    const [mediaItem, setMediaItem] = useState<any>([])
    const enterStyle = useTopEnterAnim({ offsetY: -40 })


    const RenderItemForImages = useCallback(({ item, index }: any) => {
        return (
            <TouchableOpacity
                disabled={route?.isMedia}
                style={{ width: ITEM_WIDTH, alignItems: 'center', paddingVertical: 8 }}
                activeOpacity={0.7}
                onPress={() => {
                    const obj = { ...item }
                    obj.message = item.mediaurl
                    setShareMsg(obj)
                    navigation.navigate('MyDrawer')
                }}>
                {/* {item.mediaType == 'video' && <VLCPlayer
                    source={{ uri: item.url }}
                    autoplay={true}
                    style={{ borderRadius: 10, height: getHeightInPercentage(15), width: getWidthInPercentage(42) }}
                />} */}
                {item.mediaType == 'video' && <View style={{ position: 'absolute', top: 0, bottom: 28, right: 0, left: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <PlayerIcon />
                </View>}
                {item.mediaType == 'image' && <View style={{ backgroundColor: colors.white, borderRadius: 15 }}>
                    <FastImage source={{ uri: item.url }} style={{ borderRadius: 12, height: ITEM_HEIGHT, width: ITEM_WIDTH }} />
                </View>}
                <RNText
                    width={ITEM_WIDTH - 8}
                    numberOfLines={1}
                    label={item.name || 'Media'}
                    color={colors.white}
                    marginTop={6}
                    fontSize={fontSize._12}
                    fontWeight={fontWeight._600}
                    paddingHorizontal={4}
                />
            </TouchableOpacity>
        )
    }, [mediaItem, mediatype])

    const RenderItemForDoc = useCallback(({ item, index }: any) => {
        return (
            <TouchableOpacity disabled={route?.isMedia} style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.7}
                onPress={() => {
                    const obj = { ...item }
                    obj.message = item.mediaurl
                    setShareMsg(obj)
                    navigation.navigate('MyDrawer')
                }} >
                <View style={{ backgroundColor: colors.white, borderRadius: 10 }}>
                    {mediatype == 'audio' ? <ShareSongIcon color={colors.black} /> : <ShareFileIcon color={colors.black} />}
                </View>
                <RNText width={250} numberOfLines={1} label={item.name || 'Document'} color={colors.white} fontSize={fontSize._14} fontWeight={fontWeight._600} paddingHorizontal={10} />
            </TouchableOpacity>
        )
    }, [mediaItem, mediatype])

    const { mutate: uploadImage } = useMutation(UploadImage, {
        onSuccess: (res) => {
            console.log(res.data);
            const obj = {
                mediaType: mediatype,
                sender: userData?.data?._id,
                conversationId: route?.itemData?.conversationId
            }
            getMedia(obj)
            setTimeout(() => {
                setLoader(false)
            }, 1500);
        },
        onError: () => {
            setLoader(false)
            console.log('UPLOAD_IMAGE_ERROR');
        },
    });

    const { mutate: getMedia, isLoading } = useMutation(getUploadedImage, {
        onSuccess: (res) => {
            const arr = [...res.data]
            for (let index = 0; index < arr.length; index++) {
                const current = res.data[index]
                const fallbackName = String(current?.mediaurl ?? '').split('/').pop() ?? ''
                arr[index].url = res.data[index].mediaurl
                arr[index].name = current?.name || current?.fileName || fallbackName || 'Media'
                arr[index].mediaType = current?.mediaType
            }
            setMediaItem(arr)
            setLoader(false)
        },
        onError: () => {
            setLoader(false)
            console.log('UPLOAD_IMAGE_ERROR');
        },
    });

    const OpenDocumentPicker = async () => {
        try {
            const response: any = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
            });
            const formData = new FormData()
            formData.append('mediaType', response?.[0]?.type == 'audio/mpeg' ? 'audio' : 'file')
            formData.append('images', {
                uri: response[0].uri,
                type: response[0].type,
                name: response[0].name
            })
            uploadImage(formData)
        } catch (err) {
            console.log(err);
        }
    }

    const OpenGallery = async (mediaType: any) => {
        try {
            await ImagePicker.launchImageLibrary({
                mediaType: mediaType,
            }, (response: any) => {
                if (!response.didCancel) {
                    const formData = new FormData()
                    formData.append('mediaType', mediatype)
                    formData.append('images', {
                        uri: response.assets[0].uri,
                        type: response.assets[0].type,
                        name: response.assets[0].fileName || response.assets[0].name
                    })
                    uploadImage(formData)
                }
            })
        } catch (err: any) {
            console.log(err.message);
        }
    }

    const onClickItem = (index: any) => {
        if (!route?.itemData?.conversationId) {
            setLoader(false)
            return
        }
        if (route?.isMedia) return // View All mode: no upload/tab switch
        setLoader(true)
        let objData = {}
        switch (index.toString()) {
            case '0':
                objData = {
                    mediaType: "image",
                    sender: userData?.data?._id,
                    conversationId: route?.itemData?.conversationId
                }
                setMediaType('image')
                break;
            case '1':
                objData = {
                    mediaType: "video",
                    sender: userData?.data?._id,
                    conversationId: route?.itemData?.conversationId
                }
                setMediaType('video')
                break;
            case '2':
                objData = {
                    mediaType: "audio",
                    sender: userData?.data?._id,
                    conversationId: route?.itemData?.conversationId
                }
                setMediaType('audio')
                break;
            case '3':
                objData = {
                    mediaType: "file",
                    sender: userData?.data?._id,
                    conversationId: route?.itemData?.conversationId
                }
                setMediaType('file')
                break;
        }
        getMedia(objData)
    }

    useEffect(() => {
        if (route?.isMedia && !route?.itemData?.conversationId) return
        if (route?.itemData?.conversationId && userData?.data?._id) {
            const obj = {
                mediaType: "image",
                sender: userData.data._id,
                conversationId: route.itemData.conversationId
            }
            getMedia(obj)
        }
    }, [route?.itemData?.conversationId, route?.isMedia, userData?.data?._id])

    return (
        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.container}>
            <Animated.View style={[{ flex: 1 }, enterStyle]}>
                <SafeAreaView style={{ width: '100%', }}>
                    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Pressable onPress={navigation.goBack} hitSlop={20}>
                                <BackArrow />
                            </Pressable>
                            {!route?.isMedia && <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    if (mediatype == 'image' || mediatype == 'video') {
                                        OpenGallery(mediatype == 'image' ? 'photo' : 'video')
                                    } else {
                                        OpenDocumentPicker()
                                    }
                                }}>
                                <ShareImageIcon size={40} />
                                <RNText paddingHorizontal={8} label={`Browse ${mediatype}`} color={colors.white} fontSize={fontSize._18} fontWeight={fontWeight._500} />
                            </TouchableOpacity>}
                        </View>
                    </View>
                </SafeAreaView>
                {
                    (mediatype == 'video' || mediatype == 'image') &&
                    <FlatList
                        data={mediaItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(_, index) => `${index}`}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between', marginTop: 8 }}
                        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GRID_SIDE_PADDING, marginTop: 8, paddingBottom: 10 }}
                        ListEmptyComponent={<ListemptyComponent color={colors.white} isLoading={isLoading} />}
                        renderItem={RenderItemForImages}
                    />
                }
                {
                    (mediatype == 'audio' || mediatype == 'file') &&
                    <FlatList
                        data={mediaItem}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(_, index) => `${index}`}
                        contentContainerStyle={{ flexGrow: 1, marginTop: 10, marginHorizontal: 30 }}
                        ListEmptyComponent={<ListemptyComponent color={colors.white} isLoading={isLoading} />}
                        renderItem={RenderItemForDoc}
                    />
                }
                <View style={styles.lastview}>
                    {!route?.isMedia && (
                    <>
                    <View style={styles.line} />
                    <FlatList
                        data={Data}
                        showsVerticalScrollIndicator={false}
                        horizontal
                        keyExtractor={(_, index) => `${index}`}
                        scrollEnabled={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-evenly' }}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity onPress={() => onClickItem(index)} style={styles.lastimageview} activeOpacity={0.5}>
                                    {item.icon}
                                </TouchableOpacity>
                            )
                        }}
                    />
                    </>
                    )}
                </View>
            </Animated.View>
        </LinearGradient>
    )
}

export default ShareItScreen