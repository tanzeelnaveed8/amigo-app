import { Platform, StyleSheet } from "react-native";
import { getHeightInPercentage, getWidthInPercentage } from "../../../utils/dimensions";

const styles = StyleSheet.create({
    container: {
        width: getWidthInPercentage(100)
    },
    image: {
        height: getHeightInPercentage(Platform.OS === 'android' ? 35 : 35),
        width: getWidthInPercentage(70),
        marginTop: Platform.OS === 'android' ? getHeightInPercentage(5) : getHeightInPercentage(7),
        alignSelf: 'center'
    },
})

export default styles