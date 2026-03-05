import { Platform, StyleSheet } from "react-native"
import { getHeightInPercentage, getWidthInPercentage } from "../../utils/dimensions"
import colors from "../../constants/color"
import fontSize from "../../constants/font-size"

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    image: {
        height: getHeightInPercentage(Platform.OS === 'android' ? 28 : 25),
        width: getWidthInPercentage(55),
        marginTop: Platform.OS === 'android' ? 0 : 35,
        alignSelf: 'center'
    },
    textview: {
        paddingHorizontal: Platform.OS === 'android' ? 35 : 35,
        marginTop: Platform.OS === 'android' ? 15 : 20
    },
    inputview: {
        alignSelf: 'center',
        marginTop: Platform.OS === 'android' ? 35 : 35,
        paddingHorizontal: 10
    },
    termsview: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 5
    },
    circle: {
        height: 25,
        width: 25,
        borderRadius: 50,
        backgroundColor: colors.grey,
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectcircle: {
        height: 15,
        width: 15,
        borderRadius: 50,
        backgroundColor: colors.primary
    },
    defftext1: {
        fontSize: fontSize._17,
        fontWeight: '700',
        marginHorizontal: 10,
        color: colors.grey
    },
    defftext2: {
        fontSize: fontSize._17,
        fontWeight: '700',
        color: colors.primary
    },
})

export default styles