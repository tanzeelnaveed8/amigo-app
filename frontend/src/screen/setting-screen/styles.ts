import { Platform, StyleSheet } from "react-native";
import colors from "../../constants/color";
import { getHeightInPercentage } from "../../utils/dimensions";

const useMergedStyle = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'space-between',
    },
    whiteview: {
        flex: 1,
        backgroundColor: colors.bgColor,
        paddingTop: 20,
        paddingHorizontal: 20
    },
    header: {
        marginHorizontal: 20,
        marginTop: 5,
        marginVertical: 15
    },
    profileview: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    image: {
        height: 55,
        width: 55,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: colors.imagebordercolor
    },
    addicon: {
        position: 'absolute',
        bottom: 0,
        right: -5
    },
})

export default useMergedStyle