import { StyleSheet } from "react-native";
import colors from "../../../../constants/color";
import { getHeightInPercentage, getWidthInPercentage } from "../../../../utils/dimensions";

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
        backgroundColor: '#9B7BFF',
        borderRadius: 15,
        shadowOpacity: 0.3,
        shadowOffset: { height: 8, width: 5 }
    },
    smallbox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: getHeightInPercentage(15),
        width: getWidthInPercentage(37),
        backgroundColor: colors.inputBGColor,
        borderRadius: 15
    },
    flatlist: {
        paddingHorizontal: 20,
        marginTop: getHeightInPercentage(7)
    }
})

export default useMergedStyle