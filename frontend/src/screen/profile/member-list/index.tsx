import { FlatList, Platform, Pressable, SafeAreaView, TouchableOpacity, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useSelector } from 'react-redux'
import BackgroundContainer from '../../../component/atoms/bg-container'
import Header from '../../../component/atoms/header'
import useNavigationHook from '../../../hooks/use_navigation'
import { getHeightInPercentage, getWidthInPercentage } from '../../../utils/dimensions'
import SearchIcon from '../../../assets/svg/search.icon'
import TickIcon from '../../../assets/svg/tick.icon'
import Forwardicon from '../../../assets/svg/forward.icon'
import ContactContainer from '../../../component/atoms/contact-container'
import { useRoute } from '@react-navigation/native'
import { useForm } from 'react-hook-form'
import InputField from '../../../component/atoms/input-field'
import CancelIcon from '../../../assets/svg/cancel.icon'
import Context from '../../../context'
import { AddAdminInGroup, AddMemberInGroup } from '../../../apis/group'
import { useMutation, useQuery } from 'react-query'
import ListemptyComponent from '../../../component/atoms/listEmptyComponent'
import { _isEmpty } from '../../../utils/helper'
import styles from './styles'
import { getAllContact } from '../../../apis/contacts'
import { AddAdminInChanel, AddMemberInChanel } from '../../../apis/channel'

const EditFlowMemberList = () => {
    const route = useRoute<any>().params
    const { contactList, groupId, chanelId, setLoader, conversationType, setConatctList, colors } = useContext(Context)
    const [data, setData] = useState<any>(contactList)
    const [members, setMembers] = useState<any>([])
    const navigation = useNavigationHook()
    const [showsearch, setShowSearch] = useState(false)
    const { control, formState: { errors }, handleSubmit } = useForm({ mode: 'onSubmit' });
    const userData: any = useSelector((state: any) => state.loginData)
    const token = userData?.data?.token ?? userData?.token

    const { isFetching } = useQuery(
        ['get-allcontact', token],
        () => getAllContact(token),
        {
            enabled: !!token,
            onSuccess: response => {
                const arr: any[] = []
                for (let index = 0; index < response?.data?.contactDetails?.length; index++) {
                    const obj = {
                        name: response.data.contactDetails[index].firstName,
                        desc: response.data.contactDetails[index].firstName,
                        image: response.data.contactDetails[index].userProfile,
                        id: response.data.contactDetails[index]._id,
                    }
                    arr.push(obj)
                }
                setData(arr);
                setConatctList(arr)
                setLoader(false)
            },
            onError: err => {
                setLoader(false)
            },
        },
    )

    const { mutate: AddGroupMember } = useMutation(AddMemberInGroup, {
        onSuccess: (res) => {
            navigation.goBack()
            setLoader(false)
        },
        onError: () => {
            console.log('ADD_GROUP_MEMBER_ERRPR');
            setLoader(false)
        },

    });

    const { mutate: AddGroupAdmin } = useMutation(AddAdminInGroup, {
        onSuccess: (res) => {
            navigation.goBack()
            setLoader(false)
        },
        onError: () => {
            console.log('ADD_GROUP_ADMIN_ERRPR');
            setLoader(false)
        },
    });

    const { mutate: AddChanelMember } = useMutation(AddMemberInChanel, {
        onSuccess: (res) => {
            navigation.goBack()
            setLoader(false)
        },
        onError: () => {
            console.log('ADD_CHANEL_MEMBER_ERRPR');
            setLoader(false)
        },

    });

    const { mutate: AddChanelAdmin } = useMutation(AddAdminInChanel, {
        onSuccess: (res) => {
            navigation.goBack()
            setLoader(false)
        },
        onError: () => {
            console.log('ADD_CHANEL_ADMIN_ERRPR');
            setLoader(false)
        },
    });

    const AddMembers = (item: any) => {
        if (members.includes(item)) {
            setMembers(members.filter((selectedId: string) => selectedId !== item));
        } else {
            setMembers([...members, item]);
        }
    }

    return (
        <BackgroundContainer
            paddingVertical={0}
            Whitebgheight={getHeightInPercentage(100)}
            mainchildren={
                <SafeAreaView style={{ width: '100%', height: Platform.OS === 'android' ? 65 : 100 }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Header
                            title={route?.member ? 'Add Members' : route?.admin ? 'Administration' : 'New Message'}
                            onLeftIconPress={navigation.goBack}
                            onRightIconPress={() => setShowSearch(e => !e)}
                            rightImageSource={<SearchIcon color={'#FFFFFF'} size={30} />} />
                    </View>
                </SafeAreaView>
            }
            children={
                <View style={styles.secondcontainer}>
                    {showsearch && <View style={styles.searchview}>
                        <InputField
                            name={'search'}
                            placeholder={'Search Contacts...'}
                            height={getHeightInPercentage(6)}
                            width={getWidthInPercentage(80)}
                            control={control}
                            errors={errors}
                            borderColor={colors.textinputBorder}
                            borderRadius={25}
                            backgroundColor={colors.inputBGColor}
                            onChangeText={() => { }}
                            returnKeyType='search'
                        />
                        <Pressable onPress={() => setShowSearch(false)} style={{ marginTop: 15 }}>
                            <CancelIcon />
                        </Pressable>
                    </View>}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={data}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => `_${index}`}
                            initialNumToRender={1}
                            ListEmptyComponent={<ListemptyComponent isLoading={isFetching} />}
                            renderItem={({ item, index }: any) => {
                                return (
                                    <ContactContainer
                                        image={item.image}
                                        name={item.name}
                                        desc={item.name}
                                        namecolor={colors.textColor}
                                        icon={item.isSelected && <TickIcon />}
                                        onPress={() => {
                                            const arr: any[] = [...data]
                                            arr[index].isSelected = !arr[index].isSelected
                                            setData(arr)
                                            AddMembers(item.id)
                                        }}
                                    />
                                )
                            }}
                        />
                    </View>
                    <TouchableOpacity style={{ position: 'absolute', bottom: 10, right: 20 }}
                        onPress={() => {
                            if (conversationType === 'GROUP') {
                                const obj = {
                                    groupId: groupId,
                                    userId: members
                                }
                                setLoader(true)
                                if (route.member) {
                                    AddGroupMember(obj)
                                } else {
                                    AddGroupAdmin(obj)
                                }
                            } else {
                                const obj = {
                                    chanelId: chanelId,
                                    userId: members
                                }
                                console.log(obj);

                                setLoader(true)
                                if (route.member) {
                                    AddChanelMember(obj)
                                } else {
                                    AddChanelAdmin(obj)
                                }
                            }
                        }}>
                        <Forwardicon />
                    </TouchableOpacity>
                </View>
            }
        />
    )
}

export default EditFlowMemberList