import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    secondcontainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 5,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ph: {
        paddingHorizontal: 20
    },
    main: {
        width: '100%', height: Platform.select({ android: 50, ios: 90 })
    }
})

export default styles