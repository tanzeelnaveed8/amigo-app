import { SafeAreaView, StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import Context from '../../../context'

interface props {
    children?: any
    mainchildren?: any
    Imageheight?: any
    Imgwidth?: any
    Whitebgheight?: any
    Whitebgwidth?: any
    image?: any
    ImgmarginTop?: any
    paddingVertical?: any
    KeybordAware?: any
}

const BackgroundContainer = (props: props) => {
    const { colors } = useContext(Context)
    const { Whitebgheight, Whitebgwidth, children, mainchildren, paddingVertical } = props

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bgColor }]}>
            {mainchildren}
            <View style={[styles.contentView, { flex: 1, width: Whitebgwidth ?? '100%', paddingVertical: paddingVertical ?? 20, backgroundColor: colors.bgColor }]}>
                {children}
            </View>
        </SafeAreaView>
    )
}

export default BackgroundContainer

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        flex: 1
    },
    contentView: {
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingVertical: 20,
        width: '100%',
    },
})
