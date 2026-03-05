import { Platform, StyleSheet } from "react-native";
import { getHeightInPercentage, getWidthInPercentage } from "../../../utils/dimensions";

const useMergedStyle = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary
    },
    secondcontainer: {
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: getHeightInPercentage(5)
    },
    bigbox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: getHeightInPercentage(18),
        width: getWidthInPercentage(40),
        backgroundColor: colors.primary,
        borderColor: colors.white,
        borderWidth: 1,
        borderRadius: 15,
        shadowOpacity: 0.3,
        shadowOffset: { height: 8, width: 5 }
    },
    smallbox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: getHeightInPercentage(Platform.OS == 'android' ? 16 : 15),
        width: getWidthInPercentage(37),
        backgroundColor: colors.inputBGColor,
        borderRadius: 15
    }
})

export default useMergedStyle