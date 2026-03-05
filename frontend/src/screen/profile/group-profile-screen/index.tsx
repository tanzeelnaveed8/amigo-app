import { View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { DeleteGroup, getGroupById } from '../../../apis/group'
import Context from '../../../context'
import { useRoute } from '@react-navigation/native'
import { ProfileUperView } from './profileuperview'
import { _isEmpty } from '../../../utils/helper'
import useNavigationHook from '../../../hooks/use_navigation'
import { useSelector } from 'react-redux'

const ProfileScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const { setLoader, setGroupId, setToastMsg, colors, setConversationType } = useContext(Context)
    const [isAdmin, setIsAdmin] = useState(false)
    const [data, setData] = useState<any>(route?.itemData)
    const userData: any = useSelector((state: any) => state.loginData)

    const { refetch: getGroup } = useQuery(
        ['get-group-by-id'],
        () => getGroupById(route?.itemData?._id),
        {
            onSuccess: (response: any) => {
                setConversationType('GROUP')
                setData(response.data)
                setGroupId(response.data._id)
                setLoader(false)
                const findIndex = response.data.groupAdmin.findIndex((res: any) => res === userData?.data?._id)
                if (findIndex >= 0) setIsAdmin(true)
            },
            onError: () => setLoader(false),
            enabled: !_isEmpty(route?.itemData?._id),
        }
    )

    const { mutate: DelGroup } = useMutation(() => DeleteGroup(route?.itemData?.id), {
        onSuccess: (response: any) => {
            setToastMsg(response.message)
            navigation.navigate('MyDrawer')
            setLoader(false)
        },
        onError: () => setLoader(false),
    })

    useEffect(() => {
        const unsub = navigation.addListener('focus', () => { getGroup() })
        return unsub
    }, [navigation])

    return (
        <View style={{ flex: 1, backgroundColor: colors?.primary }}>
            <ProfileUperView
                data={data}
                pencilHide
                isSettingshow={isAdmin}
                onCallIconPress={() => navigation.navigate('ComingSoonScreen' as never)}
                onVideoIconPress={() => navigation.navigate('ComingSoonScreen' as never)}
                onImageIconPress={() => {}}
                onShareIconPress={() => {
                    const id = data?._id
                    if (id) navigation.navigate('ProfileQRScreen' as never, { type: 'group', id, name: data?.title } as never)
                }}
                onProfileIcon={() => {
                    navigation.navigate('AddGroupDetailsScreen' as never, { itemData: data, isEdit: true } as never)
                }}
                omHeaderRightIcon={() => {}}
                setShowSearch={() => {}}
                onSettingIconPress={() => {
                    navigation.navigate('ProfileSettingScreen' as never, { profileData: data } as never)
                }}
            />
        </View>
    )
}

export default ProfileScreen
