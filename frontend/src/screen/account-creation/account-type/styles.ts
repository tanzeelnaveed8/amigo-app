import { StyleSheet } from "react-native";
import { getHeightInPercentage } from "../../../utils/dimensions";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20
    },
    secondmainView: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginBottom: getHeightInPercentage(8)
    },
    flatlistview: {
        paddingVertical: 30,
        alignItems: 'center'
    }
})

export default styles