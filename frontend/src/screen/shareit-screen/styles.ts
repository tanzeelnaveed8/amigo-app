import { Platform, StyleSheet } from "react-native";
import colors from "../../constants/color";

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    textview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    line: {
        borderWidth: 1,
        borderColor: colors.white,
    },
    lastimageview: {
        flex: 1,
        marginTop: 15,
        justifyContent: 'space-evenly',
    },
    lastview: {
        marginBottom: Platform.OS === 'ios' ? 30 : 15,
        marginHorizontal: 25,
    },
})

export default styles