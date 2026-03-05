import { Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useState } from 'react'
import Header from '../../../component/atoms/header'
import useNavigationHook from '../../../hooks/use_navigation'
import ImageAddIcon from '../../../assets/svg/imageadd.icon'
import RightIcon from '../../../assets/svg/right.icon'
import { props } from './data'
import { images } from '../../../constants/image'
import Context from '../../../context'
import { Image as FastImage } from 'expo-image'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'

const GroupDetaile = (props: props) => {
    const { bio, title, image, onBoi, onName, onRightIconPress, onProfileIconPress, username, onUsername } = props
    const navigation = useNavigationHook()
    const { conversationType, colors } = useContext(Context)
    const [nameValue, setNameValue] = useState(title ?? '')
    const [bioValue, setBioValue] = useState(bio ?? '')
    const [usernameValue, setUsernameValue] = useState(username ?? '')

    const isChannel = conversationType !== 'GROUP'

    return (
        <SafeAreaView style={{ width: '100%' }}>
            <View style={{ paddingHorizontal: 20 }}>
                <Header title='' onLeftIconPress={navigation.goBack} onRightIconPress={onRightIconPress} rightImageSource={<RightIcon />} />
            </View>

            <View style={localStyles.container}>
                <TouchableOpacity onPress={onProfileIconPress} activeOpacity={0.8} style={[localStyles.avatarWrapper, { backgroundColor: colors.inputBGColor }]}>
                    <FastImage
                        source={image ? { uri: image } : images.user}
                        style={localStyles.avatar}
                    />
                    <View style={[localStyles.cameraOverlay, { backgroundColor: colors.bgColor }]}>
                        <ImageAddIcon size={24} color={colors.accentColor} />
                    </View>
                </TouchableOpacity>

                <RNText
                    label={isChannel ? 'New Channel' : 'New Group'}
                    fontSize={fontSize._20}
                    fontWeight={fontWeight._700}
                    color={colors.textColor}
                    marginTop={14}
                />
                <RNText
                    label="Add a name, profile photo and bio"
                    fontSize={fontSize._13}
                    fontWeight={fontWeight._400}
                    color={colors.secondaryText}
                    marginTop={4}
                />

                <View style={localStyles.inputGroup}>
                    <RNText label={isChannel ? 'Display Name' : 'Name'} fontSize={fontSize._12} fontWeight={fontWeight._600} color={colors.secondaryText} />
                    <TextInput
                        value={nameValue}
                        onChangeText={(text) => { setNameValue(text); onName(text) }}
                        placeholder={isChannel ? 'Channel name' : 'Group name'}
                        placeholderTextColor={colors.grey}
                        style={[localStyles.nameInput, { backgroundColor: colors.inputBGColor, borderColor: colors.inputBorderColor, color: colors.textColor }]}
                        maxLength={50}
                        defaultValue={title}
                    />
                </View>

                {isChannel && onUsername != null && (
                    <View style={localStyles.inputGroup}>
                        <RNText label="Username" fontSize={fontSize._12} fontWeight={fontWeight._600} color={colors.secondaryText} />
                        <TextInput
                            value={usernameValue}
                            onChangeText={(text) => { setUsernameValue(text.replace(/^@/, '')); onUsername(text.replace(/^@/, '')) }}
                            placeholder="e.g. tech_updates"
                            placeholderTextColor={colors.grey}
                            style={[localStyles.nameInput, { backgroundColor: colors.inputBGColor, borderColor: colors.inputBorderColor, color: colors.textColor }]}
                            maxLength={40}
                            defaultValue={username}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <RNText label={`@${usernameValue || 'username'}`} fontSize={fontSize._11} fontWeight={fontWeight._400} color={colors.grey} marginTop={4} />
                    </View>
                )}

                <View style={localStyles.inputGroup}>
                    <RNText label="Bio" fontSize={fontSize._12} fontWeight={fontWeight._600} color={colors.secondaryText} />
                    <TextInput
                        value={bioValue}
                        onChangeText={(text) => { setBioValue(text); onBoi(text) }}
                        placeholder="Write a short description..."
                        placeholderTextColor={colors.grey}
                        style={[localStyles.bioInput, { backgroundColor: colors.inputBGColor, borderColor: colors.inputBorderColor, color: colors.textColor }]}
                        multiline
                        maxLength={200}
                        textAlignVertical="top"
                        defaultValue={bio}
                    />
                    <RNText
                        label={`${bioValue?.length ?? 0}/200`}
                        fontSize={fontSize._11}
                        fontWeight={fontWeight._400}
                        color={colors.grey}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default GroupDetaile

const localStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
    },
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#9B7BFF',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 55,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#9B7BFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputGroup: {
        width: '100%',
        marginTop: 18,
    },
    nameInput: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 16,
        marginTop: 6,
    },
    bioInput: {
        width: '100%',
        minHeight: 80,
        maxHeight: 120,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 15,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        marginTop: 6,
    },
})
