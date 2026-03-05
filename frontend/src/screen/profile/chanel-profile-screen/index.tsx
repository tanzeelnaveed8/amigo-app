import { View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import Context from '../../../context'
import { useRoute } from '@react-navigation/native'
import { DeleteChanel, getChanelById } from '../../../apis/channel'
import useNavigationHook from '../../../hooks/use_navigation'
import { ProfileUperView } from './profileview'
import { useSelector } from 'react-redux'

const ChanelProfileScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const { setLoader, setToastMsg, colors, setConversationType, setChanelId } = useContext(Context)
    const [data, setData] = useState<any>(route?.itemData)
    const [isAdmin, setIsAdmin] = useState(false)
    const userData: any = useSelector((state: any) => state.loginData)

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
        <View style={{ flex: 1, backgroundColor: colors?.primary }}>
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
        </View>
    )
}

export default ChanelProfileScreen
