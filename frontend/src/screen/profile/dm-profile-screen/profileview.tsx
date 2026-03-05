import { Image, Platform, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import Header from '../../../component/atoms/header'
import useNavigationHook from '../../../hooks/use_navigation'
import SettingIcon from '../../../assets/svg/setting.icon'
import styles from './styles'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import BioTextInput from '../../../component/atoms/bio-text-input'
import MemberIcon from '../../../assets/svg/member.icon'
import SearchIcon from '../../../assets/svg/search.icon'
import { getHeightInPercentage } from '../../../utils/dimensions'
import { images } from '../../../constants/image'
import { BlurView } from 'expo-blur'
import ContactContainer from '../../../component/atoms/contact-container'
import { getIconData, getIconDataNoSetting, props, props2 } from './data'
import Context from '../../../context'
import useMergedStyle from './styles'
import {Image as FastImage} from 'expo-image'

export const ProfileUperView = (props: props) => {
    const navigation = useNavigationHook()
    const { isSettingshow, data, onSettingIconPress, omHeaderRightIcon, pencilHide, onBio, setShowSearch, onCallIconPress, onImageIconPress, onShareIconPress, onVideoIconPress } = props
    const { colors } = useContext(Context)
    const Icondata = isSettingshow ? getIconData(colors) : getIconDataNoSetting(colors)
    const styles = useMergedStyle(colors)

    const OnClickIcon = (id: any) => {
        switch (id.toString()) {
            case '1':
                onCallIconPress()
                break;
            case '2':
                onVideoIconPress()
                break;
            case '3':
                onImageIconPress()
                break;
            case '4':
                onShareIconPress()
                break;
            case '5':
                onSettingIconPress()
                break;
        }
    }

    return (
        <View>
            <SafeAreaView>
                <Header title=''
                    onLeftIconPress={navigation.goBack}
                    onRightIconPress={omHeaderRightIcon}
                    rightImageSource={<SettingIcon sizeh={25} sizew={35} color={colors.textColor} />} />
            </SafeAreaView>
            <View style={styles.iconview}>
                <FastImage source={data.profileImage ? { uri: data.profileImage } : images.dummyImage} style={{ height: 85, width: 85, borderRadius: 50, borderWidth: 2, borderColor: '#9B7BFF' }} />
                <RNText label={data.name ?? 'Bike Gang'} fontSize={fontSize._20} fontWeight={fontWeight._600} color={colors.textColor} marginTop={10} />
                <View style={styles.icon}>
                    {Icondata.map((item) => {
                        return (
                            <TouchableOpacity onPress={() => OnClickIcon(item.id)} key={item.id}>
                                {item.icon}
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <BioTextInput height={getHeightInPercentage(Platform.OS === 'android' ? 17 : 15)} defualtValue={data.desc} pencilHide={pencilHide} onBio={(value) => console.log(value)} />
            </View>
            {/* <View style={styles.searchbar}>
                <View style={styles.membericon}>
                    <MemberIcon />
                    <RNText label={'Members'} fontSize={fontSize._20} fontWeight={fontWeight._600} color={colors.white} paddingHorizontal={20} />
                </View>
                <Pressable onPress={() => setShowSearch()}>
                    <SearchIcon color={colors.white} />
                </Pressable>
            </View> */}
        </View>
    )
}

export const ModalContent = (props: props2) => {
    const { dropdown, isvisible, item } = props
    const { colors } = useContext(Context)
    const styles = useMergedStyle(colors)
    return (
        <>
            {isvisible && <BlurView
                style={styles.absolute}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor={colors.transparent}
            />}
            {isvisible && <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? dropdown + 30 : dropdown - 15, left: 20 }}>
                <ContactContainer
                    name={item.firstName + ' ' + item.lastName}
                    desc={item.userName}
                    image={item.userProfile}
                    desccolor={colors.secondaryText}
                    namecolor={colors.textColor}
                    textpaddingHorizontal={15}
                />
            </View>}
        </>
    )
}


