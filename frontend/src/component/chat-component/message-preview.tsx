import { ActivityIndicator, Animated, Dimensions, Easing, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import RNText from '../atoms/text'
import ShareVideoIcon from '../../assets/svg/sharevideo.icon'
import fontWeight from '../../constants/font-weight'
import fontSize from '../../constants/font-size'

import { _isEmpty } from '../../utils/helper'
import ShareSongIcon from '../../assets/svg/sharesong.icon'
import {Image as FastImage} from 'expo-image'
import ShareDocIcon from '../../assets/svg/sharedoc.icon'
import Context from '../../context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface props {
    image?: any
    message?: any
    audio?: any
    isReplay?: boolean
    isUploading?: boolean
    onPressCancel: () => void
}

const MessagePreview = (props: props) => {
    const { image, isReplay, message, onPressCancel, audio, isUploading } = props
    const { colors } = useContext(Context)
    const [extension, setExtension] = useState<any>('')
    const progressAnim = useRef(new Animated.Value(0)).current;

    const getFileExtensionWithRegex = (url: string) => {
        const regex = /(?:\.([^.]+))?$/;
        const match: any = regex.exec(url);
        setExtension(match[1].toLowerCase())
        return match && match[1] ? match[1].toLowerCase() : 'No extension found';
    }

    useEffect(() => {
        if (image) {
            getFileExtensionWithRegex(image)
        }
    }, [])

    useEffect(() => {
        if (isUploading) {
            progressAnim.setValue(0);
            Animated.loop(
                Animated.timing(progressAnim, {
                    toValue: 1, duration: 1800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                })
            ).start();
        } else {
            progressAnim.stopAnimation();
        }
    }, [isUploading]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: ['0%', '80%', '0%'],
    });

    return (
        <View style={[styles.chatimageview, { backgroundColor: colors.inputBGColor, borderColor: '#9B7BFF' }]}>
            {isUploading && (
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                <View style={{ borderRadius: 12, overflow: 'hidden' }}>
                    {isUploading ? (
                        <View style={styles.uploadThumb}>
                            <ActivityIndicator size="small" color="#9B7BFF" />
                        </View>
                    ) : audio == 'image' ? <FastImage source={{ uri: image }} style={{ height: 46, width: 46, borderRadius: 12 }} /> :
                        audio == 'video' ? <View style={styles.mediaThumb}><ShareVideoIcon color="#9B7BFF" /></View> :
                            audio == 'audio' ? <View style={styles.mediaThumb}><ShareSongIcon color="#9B7BFF" /></View> :
                                audio == 'doc' ? <View style={styles.mediaThumb}><ShareDocIcon color="#9B7BFF" /></View> : null
                    }
                </View>
                <View style={{ flex: 1, paddingHorizontal: 12, maxWidth: SCREEN_WIDTH - 150 }}>
                    {isUploading ? (
                        <RNText numberOfLines={1} label="Sending..." fontWeight={fontWeight._600} fontSize={fontSize._14} color="#9B7BFF" />
                    ) : (
                        <RNText
                            numberOfLines={2}
                            label={!_isEmpty(message) ? message : isReplay ? 'Type your reply...' : ''}
                            fontWeight={fontWeight._600}
                            fontSize={fontSize._14}
                            color={!_isEmpty(message) ? colors.textColor : colors.grey}
                        />
                    )}
                </View>
            </View>
            {!isUploading && (
                <TouchableOpacity onPress={onPressCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <View style={styles.cancelBtn}>
                        <RNText label="✕" fontSize={fontSize._12} fontWeight={fontWeight._700} color={colors.grey} />
                    </View>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default MessagePreview

const styles = StyleSheet.create({
    chatimageview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginBottom: 4,
        borderLeftWidth: 4,
        borderRadius: 10,
        maxWidth: SCREEN_WIDTH - 24,
        overflow: 'hidden',
    },
    progressTrack: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 3,
        backgroundColor: 'rgba(155,123,255,0.1)',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#9B7BFF',
        borderRadius: 3,
    },
    uploadThumb: {
        height: 46, width: 46, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(155,123,255,0.12)',
    },
    mediaThumb: {
        height: 46, width: 46, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(155,123,255,0.12)',
    },
    cancelBtn: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(128,128,128,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
})