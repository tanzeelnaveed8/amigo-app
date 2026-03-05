import { GestureResponderEvent, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import RNText from '../text'
import colors from '../../../constants/color'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import { images } from '../../../constants/image'
import { getWidthInPercentage } from '../../../utils/dimensions'
import {Image as FastImage} from 'expo-image'
import Context from '../../../context'

interface props {
    image?: any
    name?: string
    namecolor?: string
    desc?: string
    desccolor?: string
    icon?: any
    icon1?: any
    imagesize?: any
    textpaddingHorizontal?: any
    titlecolor?: any
    onPress?: () => void
    onLongPress?: (event: GestureResponderEvent) => void;
}

const ContactContainer = (props: props) => {
    const { onLongPress, desc, image, onPress, name, icon, icon1, namecolor, desccolor, imagesize, textpaddingHorizontal } = props
    const { colors: themeColors } = useContext(Context)

    return (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress} style={styles.container}>
            <TouchableOpacity onLongPress={onLongPress} style={styles.secondview}
                onPress={onPress}>
                {icon1 ? icon1 : <FastImage source={image ? { uri: image } : images.dummyImage} style={styles.image} contentFit='cover' />}
                <View style={{ paddingHorizontal: textpaddingHorizontal ?? 20 }}>
                    <RNText label={name} maxWidth={getWidthInPercentage(50)} numberOfLines={1} color={namecolor ?? themeColors.textColor} fontSize={fontSize._18} fontWeight={fontWeight._700} />
                    {desc && <RNText maxWidth={240} label={desc} color={desccolor ?? colors.grey} fontSize={fontSize._16} fontWeight={fontWeight._600} marginTop={5} />}
                </View>
            </TouchableOpacity>
            {icon}
        </TouchableOpacity>
    )
}

export default ContactContainer

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 15,
    },
    secondview: {
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        height: 55,
        width: 55,
        borderRadius: 30
    }
})