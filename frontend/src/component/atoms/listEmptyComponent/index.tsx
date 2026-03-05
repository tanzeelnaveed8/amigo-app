import { ActivityIndicator, Animated, View, Text, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserSearch } from 'lucide-react-native'
import Context from '../../../context'
import { FontFamily } from '../../../../GlobalStyles'

const ListemptyComponent = ({ isLoading, onPress, color }: { isLoading: boolean, onPress?: () => void, color?: string }) => {
    const [load, setLoad] = useState<any>(isLoading)
    const { colors } = useContext(Context)
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        setLoad(isLoading)
    }, [isLoading, load])

    useEffect(() => {
        if (!load) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [load])

    return (
        load ?
            <ActivityIndicator animating size={'large'} color={colors.accentColor ?? '#9B7BFF'} style={{ marginTop: 30 }} /> :
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.iconBox}>
                    <UserSearch size={28} color="#9B7BFF" />
                </View>
                <Text style={[styles.title, { color: color ?? colors.textColor }]}>No contacts yet</Text>
                <Text style={[styles.subtitle, { color: colors.secondaryText ?? '#8B8CAD' }]}>
                    Sync your contacts or search for users to start chatting
                </Text>
            </Animated.View>
    )
}

export default ListemptyComponent

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 30,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(155, 123, 255, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: FontFamily.robotoBold,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: FontFamily.robotoRegular,
        fontSize: 14,
        color: '#8B8CAD',
        textAlign: 'center',
        lineHeight: 20,
    },
})
