import { Pressable, SafeAreaView, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Header from '../../../component/atoms/header'
import useNavigationHook from '../../../hooks/use_navigation'
import RightIcon from '../../../assets/svg/right.icon'
import { getHeightInPercentage } from '../../../utils/dimensions'
import PrivetGroupIcon from '../../../assets/svg/privetgroup.icon'
import RNText from '../../../component/atoms/text'
import PublicGroupIcon from '../../../assets/svg/publicgroup.icon'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import { useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { UpdateProfile } from '../../../apis/auth'
import { loginAction } from '../../../redux/actions'
import Context from '../../../context'
import useMergedStyle from './styles'

const GroupTypeScreen = () => {
    const route: any = useRoute().params
    const [isSelect, setIsSelect] = useState(false)
    const { setLoader, setGroupType, conversationType, colors } = useContext(Context)
    const [type, setType] = useState(conversationType == 'GROUP' ? 'Public Group' : 'Public Chanel')
    const navigation = useNavigationHook()
    const userData: any = useSelector((state: any) => state.loginData);
    const styles = useMergedStyle(colors)
    const dispatch = useDispatch();

    const { mutate } = useMutation(UpdateProfile, {
        onSuccess: (res) => {
            const arr: any[] = {
                ...userData
            }
            userData.data.acountPrivacy = res.data.acountPrivacy
            dispatch(loginAction({ ...arr }));
            setLoader(false)
            navigation.goBack()
        },
        onError: () => {
            console.log('UPDATE_PROFILE_ERRPR');
            setLoader(false)
        },
    });

    useEffect(() => {
        if (route?.isPrivecy) {
            setIsSelect(userData.data.acountPrivacy == 'Public Acount' ? false : true)
        }
    }, [userData])

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ width: '100%', }}>
                <View style={{ paddingHorizontal: 20 }}>
                    <Header
                        title={route?.isPrivecy ? 'Privacy' : conversationType == 'GROUP' ? 'Group Type' : 'Chanel Type'}
                        onLeftIconPress={navigation.goBack}
                        onRightIconPress={() => {
                            if (route?.isPrivecy) {
                                setLoader(true)
                                const obj = {
                                    acountPrivacy: isSelect ? 'Private Account' : 'Public Account',
                                    isPublic: !isSelect
                                }
                                mutate(obj)
                            } else {
                                // Save type in context and navigate - don't create group yet
                                setGroupType(type)
                                navigation.navigate('AddMemberScreen')
                            }
                        }}
                        rightImageSource={<RightIcon />} />
                </View>
                <View style={styles.secondcontainer}>
                    <Pressable style={isSelect ? styles.bigbox : styles.smallbox}
                        onPress={() => {
                            setType(conversationType == 'GROUP' ? 'Private Group' : 'Private Chanel')
                            setIsSelect(true)
                        }} >
                        <PrivetGroupIcon />
                        <RNText label={conversationType == 'GROUP' ? 'Private Account' : 'Private Chanel'} marginTop={10} color={!isSelect ? colors.grey : colors.white} />
                    </Pressable>
                    <Pressable style={!isSelect ? styles.bigbox : styles.smallbox}
                        onPress={() => {
                            setType(conversationType == 'GROUP' ? 'Public Group' : 'Public Chanel')
                            setIsSelect(false)
                        }} >
                        <PublicGroupIcon />
                        <RNText label={conversationType == 'GROUP' ? 'Public Account' : 'Public Chanel'} color={isSelect ? colors.grey : colors.white} />
                    </Pressable>
                </View>
                <RNText label={'When your account is private. Nobody can add you in any Group or channel.'} lineHeight={25} marginTop={getHeightInPercentage(7)} paddingHorizontal={50} textAlign='center' color={colors.white} alignSelf={'center'} fontWeight={fontWeight._700} fontSize={fontSize._18} />
            </SafeAreaView>
        </View>
    )
}

export default GroupTypeScreen