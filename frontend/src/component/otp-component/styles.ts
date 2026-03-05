import { Platform, StyleSheet } from "react-native";
import { getHeightInPercentage, getWidthInPercentage } from "../../utils/dimensions";
import colors from "../../constants/color";

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%'
    },
    image: {
        height: getHeightInPercentage(Platform.OS === 'android' ? 35 : 30),
        width: getWidthInPercentage(45),
        marginTop: Platform.OS === 'android' ? getHeightInPercentage(1) : getHeightInPercentage(3),
        alignSelf: 'center'
    },
    keybordaware: {
        flexGrow: 1,
        backgroundColor: colors.transparent,
        paddingBottom: 30,
    }
})

export default styles
