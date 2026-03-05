import { Platform, StyleSheet } from "react-native";
import colors from "../../constants/color";
import { getHeightInPercentage } from "../../utils/dimensions";

const styles = StyleSheet.create({
    maincontainer: {
        marginHorizontal: 20,
        marginTop: Platform.OS === 'android' ? 10 : 0
    },
    mainsecondview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    fdrow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    secondcontainer: {
        width: '100%',
        paddingHorizontal: 0,
        paddingVertical: 5,
        flex: 1,
    },
    secondview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    tabsRow: {
        marginBottom: 4,
        marginTop: 2,
    },
    ph: {
        paddingHorizontal: 5
    },
    flatlistlablebox: {
        flexDirection: 'row',
        borderRadius: 22,
        height: 38,
        paddingHorizontal: 14,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    lablelength: {
        marginLeft: 6,
        justifyContent: 'center',
        alignItems: 'center',
        height: 22,
        minWidth: 22,
        paddingHorizontal: 4,
        borderRadius: 11
    },
    optionshadow: {
        shadowOpacity: 0.5,
        shadowOffset: { height: 2, width: 2 }
    },
    line: {
        width: 125,
        borderWidth: 1,
        borderColor: colors.white,
        marginTop: 3
    },
    addicon: {
        position: 'absolute',
        bottom: getHeightInPercentage(3),
        right: 20
    },
    image: {
        height: 48,
        width: 48,
        borderRadius: 24,
    },
    greendot: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#34D399',
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    onlinemainview: {
        marginVertical: 10,
        marginHorizontal: 8,
        alignItems: 'center',
    }
})

export default styles