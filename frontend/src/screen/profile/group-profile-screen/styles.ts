import { StyleSheet } from "react-native";

const useMergedStyle = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingHorizontal: 20
    },
    iconview: {
        alignItems: 'center',
        bottom: 20,
        marginTop: 15
    },
    icon: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        justifyContent: 'space-evenly'
    },
    searchbar: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    membericon: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputview: {
        flexDirection: 'row',
        width: '92%',
        marginTop: 20,
        marginHorizontal: 5
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    addicon: {
        position: 'absolute',
        bottom: 5,
        right: 0
    },
})

export default useMergedStyle