import { Platform, StyleSheet } from "react-native";
import { getHeightInPercentage, getWidthInPercentage } from "../../utils/dimensions";
import colors from "../../constants/color";

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    image: {
        height: 110,
        width: 110,
        marginTop: Platform.OS === 'android' ? getHeightInPercentage(-10) : getHeightInPercentage(-9),
        borderRadius: 100, borderWidth: 2, borderColor: '#9B7BFF'
    },
    whiteview: {
        height: getHeightInPercentage(Platform.OS === 'android' ? 83 : 81),
        width: '100%',
        borderTopRightRadius: 50,
        borderTopLeftRadius: 50, alignItems: 'center'
    },
    inputfiledview: {
        alignSelf: 'center',
        marginTop: Platform.OS === 'android' ? getHeightInPercentage(1) : getHeightInPercentage(1)
    },
    addicon: {
        position: 'absolute',
        bottom: 5,
        right: 0
    },
})

export default styles