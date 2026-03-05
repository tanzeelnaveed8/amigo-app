import { StyleSheet, StatusBar } from "react-native";
import { windowHeight, windowWidth } from "./commonstyle";

export const style = StyleSheet.create({
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    height: windowWidth,
    width: windowHeight,
    justifyContent: 'center',
    alignItems: 'center'
})