import { View, ScrollView, StyleSheet, Dimensions } from 'react-native'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import Context from '../../../context'
import { useRoute } from '@react-navigation/native'
import { DeleteChanel, getChanelById } from '../../../apis/channel'
import useNavigationHook from '../../../hooks/use_navigation'
import { ProfileUperView } from './profileview'
import { useSelector } from 'react-redux'
import { Ghost } from 'lucide-react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const buildTheme = (colors: any) => ({
    bg: colors.bgColor ?? '#0A0A14',
    accent: colors.accentColor ?? '#9B7BFF',
})

const GHOST_POSITIONS = [
    { top: SCREEN_HEIGHT * 0.12, left: SCREEN_WIDTH * 0.1, size: 22, opacity: 0.06 },
    { top: SCREEN_HEIGHT * 0.3, right: SCREEN_WIDTH * 0.12, size: 28, opacity: 0.08 },
    { top: SCREEN_HEIGHT * 0.55, left: SCREEN_WIDTH * 0.18, size: 24, opacity: 0.07 },
    { top: SCREEN_HEIGHT * 0.78, right: SCREEN_WIDTH * 0.08, size: 18, opacity: 0.05 },
]

const ChanelProfileScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const { setLoader, setToastMsg, colors, setConversationType, setChanelId } = useContext(Context)
    const [data, setData] = useState<any>(route?.itemData)
    const [isAdmin, setIsAdmin] = useState(false)
    const userData: any = useSelector((state: any) => state.loginData)
    const THEME = useMemo(() => buildTheme(colors ?? {}), [colors])

    const { refetch: getChanel } = useQuery(
        ['get-chanel-by-id'],
        () => getChanelById(route?.itemData?.id),
        {
            onSuccess: (response: any) => {
                setChanelId(response.data._id)
                setConversationType('CHANEL')
                setData(response.data)
                const findIndex = response.data.chanelAdmin.findIndex(
                    (res: any) => res === userData?.data?._id
                )
                if (findIndex >= 0) setIsAdmin(true)
            },
            onError: () => {
                setLoader(false)
            },
        }
    )

    const { mutate: DelChanel } = useMutation(() => DeleteChanel(route?.itemData?.id), {
        onSuccess: (response: any) => {
            setToastMsg(response.message)
            navigation.navigate('MyDrawer')
            setLoader(false)
        },
        onError: () => {
            setLoader(false)
        },
    })

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => {
            getChanel()
        })
        return unsub
    }, [navigation])

    return (
        <View style={[styles.container, { backgroundColor: THEME.bg }]}>
            {/* Ghost background similar to uisample */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {GHOST_POSITIONS.map((pos, index) => (
                    <View
                        key={index}
                        style={[
                            styles.ghostPos,
                            {
                                top: pos.top,
                                left: pos.left,
                                right: pos.right,
                                opacity: pos.opacity,
                            },
                        ]}
                    >
                        <Ghost size={pos.size} color={THEME.accent} />
                    </View>
                ))}
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProfileUperView
                    data={data}
                    pencilHide
                    isSettingshow={isAdmin}
                    setShowSearch={() => navigation.navigate('ComingSoonScreen' as never)}
                    onCallIconPress={() => navigation.navigate('ComingSoonScreen' as never)}
                    onVideoIconPress={() => navigation.navigate('ComingSoonScreen' as never)}
                    onImageIconPress={() => {}}
                    onShareIconPress={() => {
                        const id = data?._id ?? data?.id
                        if (id) navigation.navigate('ProfileQRScreen' as never, { type: 'channel', id, name: data?.title } as never)
                    }}
                    onProfileIcon={() => {
                        navigation.navigate('AddGroupDetailsScreen' as never, { itemData: data, isEdit: true } as never)
                    }}
                    omHeaderRightIcon={() => {}}
                    onSettingIconPress={() => {
                        navigation.navigate('ChanelProfileSettingScreen' as never, { profileData: data } as never)
                    }}
                />
            </ScrollView>
        </View>
    )
}

export default ChanelProfileScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    ghostPos: {
        position: 'absolute',
    },
})
