import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    secondcontainer: {
        height: Platform.OS === 'android' ? '95%' : '90%',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    searchview: {
        flexDirection: 'row',
        width: '92%',
        marginTop: 20,
        marginHorizontal: 5
    }
})

export default styles