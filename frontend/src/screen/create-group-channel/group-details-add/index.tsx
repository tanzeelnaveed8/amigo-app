import { FlatList, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import BackgroundContainer from '../../../component/atoms/bg-container'
import { getHeightInPercentage } from '../../../utils/dimensions'
import useNavigationHook from '../../../hooks/use_navigation'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import ContactContainer from '../../../component/atoms/contact-container'
import TickIcon from '../../../assets/svg/tick.icon'
import Forwardicon from '../../../assets/svg/forward.icon'
import GroupDetaile from './GroupDetaile'
import styles from './styles'
import { useRoute } from '@react-navigation/native'
import Context from '../../../context'
import { useMutation } from 'react-query'
import { CreateGroup, UpdateGroup, UpdateGroupProfilepic } from '../../../apis/group'
import { CreateChanel, UpdateChanel, UpdateChanelProfilepic } from '../../../apis/channel'
import { _isEmpty } from '../../../utils/helper'
import { incrementRoomsCreatedToday } from '../../../utils/roomsCreatedToday'
import * as ImagePicker from '../../../utils/imagePickerCompat';
import { openCropper as ImageCropPickerOpenCropper } from '../../../utils/imagePickerCompat';

const AddGroupDetailsScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>().params
    const { contactList, setLoader, groupId, chanelId, conversationType, setToastMsg, colors, darkMode, groupType, selectedMembers, setGroupId, setChanelId } = useContext(Context)
    const [members, setMembers] = useState<any>([])
    const [name, setName] = useState(route?.createForm?.name ?? route?.itemData?.title ?? '')
    const [username, setUsername] = useState(route?.createForm?.username ?? route?.itemData?.username ?? '')
    const [images, setImages] = useState(route?.createForm?.imageAsset?.uri ?? '')
    const [bio, setBio] = useState(route?.createForm?.bio ?? route?.itemData?.bio ?? '')
    const pendingImageRef = useRef<any>(null)

    useEffect(() => {
        if (route?.createForm?.imageAsset) {
            pendingImageRef.current = {
                image: {
                    uri: route.createForm.imageAsset.uri,
                    type: route.createForm.imageAsset.type,
                    name: route.createForm.imageAsset.name,
                }
            }
        }
    }, [route?.createForm])

    // For editing existing group
    const { mutate: updateGroup } = useMutation(UpdateGroup, {
        onSuccess: (res) => {
            navigation.navigate('MyDrawer', { isSocketRefetch: true })
            setToastMsg('Group updated successfully')
            setLoader(false)
        },
        onError: () => {
            console.log('UPDATE_GROUP_ERROR');
            setLoader(false)
        },
    });

    // For editing existing channel
    const { mutate: updateChanel } = useMutation(UpdateChanel, {
        onSuccess: (res) => {
            navigation.navigate('MyDrawer', { isSocketRefetch: true })
            setToastMsg('Chanel updated successfully')
            setLoader(false)
        },
        onError: () => {
            console.log('UPDATE_CHANEL_ERROR');
            setLoader(false)
        },
    });

    // For creating new group - Step 1: Create group with type
    const { mutate: createNewGroup } = useMutation(CreateGroup, {
        onSuccess: (res) => {
            const newGroupId = res.data
            setGroupId(newGroupId)
            // Step 2: Update with details and members
            const updateObj = {
                groupId: newGroupId,
                bio: bio,
                title: name,
                participants: selectedMembers
            }
            finalizeGroup(updateObj)
        },
        onError: () => {
            console.log('CREATE_GROUP_ERROR');
            setLoader(false)
        },
    });

    // For creating new channel - Step 1: Create channel with type
    const { mutate: createNewChanel } = useMutation(CreateChanel, {
        onSuccess: (res) => {
            const newChanelId = res.data
            setChanelId(newChanelId)
            // Step 2: Update with details and members
            const updateObj = {
                chanelId: newChanelId,
                bio: bio,
                title: name,
                ...(username !== undefined && username !== '' && { username: username.replace(/^@/, '') }),
                participants: selectedMembers
            }
            finalizeChanel(updateObj)
        },
        onError: () => {
            console.log('CREATE_CHANEL_ERROR');
            setLoader(false)
        },
    });

    // Step 2: Finalize group with all details
    const { mutate: finalizeGroup } = useMutation(UpdateGroup, {
        onSuccess: (res) => {
            // Upload profile image if selected
            if (pendingImageRef.current) {
                const formData = new FormData()
                formData.append('groupId', res.data?._id || groupId)
                formData.append('images', pendingImageRef.current.image)
                updateGroupProfile(formData)
            }
            incrementRoomsCreatedToday()
            navigation.navigate('MyDrawer', { isSocketRefetch: true })
            setToastMsg('Group created successfully')
            setLoader(false)
        },
        onError: () => {
            console.log('FINALIZE_GROUP_ERROR');
            setLoader(false)
        },
    });

    // Step 2: Finalize channel with all details
    const { mutate: finalizeChanel } = useMutation(UpdateChanel, {
        onSuccess: (res) => {
            // Upload profile image if selected
            if (pendingImageRef.current) {
                const formData = new FormData()
                formData.append('chanelId', res.data?._id || chanelId)
                formData.append('images', pendingImageRef.current.image)
                updateChanelProfile(formData)
            }
            navigation.navigate('MyDrawer', { isSocketRefetch: true })
            setToastMsg('Chanel created successfully')
            setLoader(false)
        },
        onError: () => {
            console.log('FINALIZE_CHANEL_ERROR');
            setLoader(false)
        },
    });

    const { mutate: updateGroupProfile } = useMutation(UpdateGroupProfilepic, {
        onSuccess: (res) => {
            console.log(res);
        },
        onError: () => {
            console.log('UPDATE_GROUP_PIC_ERROR');
        },
    });

    const { mutate: updateChanelProfile } = useMutation(UpdateChanelProfilepic, {
        onSuccess: (res) => {
            console.log(res);
        },
        onError: () => {
            console.log('UPDATE_CHANEL_PIC_ERROR');
        },
    });

    const OpenGallery = useCallback(async () => {
        try {
            await ImagePicker.launchImageLibrary({
                mediaType: 'photo'
            }, response => {
                if (!response.didCancel) {
                    setTimeout(async () => {
                        const croppedImage = await ImageCropPickerOpenCropper({
                            width: 300,
                            height: 400,
                            mediaType: 'photo',
                            path: `${response?.assets?.[0]?.uri}`,
                            freeStyleCropEnabled: true,
                            compressImageQuality: 0.7,
                            cropperCircleOverlay: true,
                            compressImageMaxWidth: 1024,
                            compressImageMaxHeight: 1024,
                            avoidEmptySpaceAroundImage: true,
                            showCropFrame: true
                        });
                        setImages(croppedImage?.path)
                        // Store image for upload after group/channel creation
                        pendingImageRef.current = {
                            image: {
                                uri: croppedImage?.path,
                                type: croppedImage?.mime,
                                name: 'userImage.jpg'
                            }
                        }
                        // If editing existing group/channel, upload immediately
                        if (route?.isEdit) {
                            const formData = new FormData()
                            formData.append(conversationType == 'GROUP' ? 'groupId' : 'chanelId', conversationType == 'GROUP' ? groupId : chanelId)
                            formData.append('images', {
                                uri: croppedImage?.path,
                                type: croppedImage?.mime,
                                name: 'userImage.jpg'
                            })
                            if (conversationType === 'GROUP') {
                                updateGroupProfile(formData)
                            } else {
                                updateChanelProfile(formData)
                            }
                        }
                    }, 600);
                }
            })
        } catch (err: any) {
            console.log(err.message);
        }
    }, [route?.isEdit, conversationType, groupId, chanelId]);

    const onPressDone = () => {
        if ((!_isEmpty(name) && !_isEmpty(bio)) || (!_isEmpty(route?.itemData?.title) && !_isEmpty(route?.itemData?.bio))) {
            setLoader(true)

            if (route?.isEdit) {
                // Editing existing group/channel
                if (conversationType == 'GROUP') {
                    const obj = {
                        groupId: groupId || route?.itemData?._id,
                        bio: bio || route?.itemData?.bio,
                        title: name || route?.itemData?.title
                    }
                    updateGroup(obj)
                } else {
                    const obj = {
                        chanelId: chanelId || route?.itemData?._id,
                        bio: bio || route?.itemData?.bio,
                        title: name || route?.itemData?.title,
                        ...(username !== undefined && username !== '' && { username: username.replace(/^@/, '') })
                    }
                    updateChanel(obj)
                }
            } else {
                // Creating new group/channel - First create, then update with details
                if (conversationType == 'GROUP') {
                    createNewGroup({ groupType: groupType })
                } else {
                    createNewChanel({ chanelType: groupType })
                }
            }
        } else {
            setToastMsg('Please fill name and bio...')
        }
    }

    useEffect(() => {
        const arr = [...contactList]
        const newArr: any[] = []
        for (let index = 0; index < route?.selectedUser?.length; index++) {
            const findIndex = contactList.findIndex((res: any) => res.id == route?.selectedUser?.[index])
            if (findIndex >= 0) {
                newArr.push(arr[findIndex])
            }
        }
        setMembers(newArr);
    }, [])

    return (
        <BackgroundContainer
            paddingVertical={0}
            Whitebgheight={getHeightInPercentage(60)}
            mainchildren={
                <GroupDetaile
                    onBoi={(value) => setBio(value)}
                    onName={(value) => setName(value)}
                    onProfileIconPress={OpenGallery}
                    onRightIconPress={() => onPressDone()}
                    image={images || (route?.itemData?.groupProfile?.includes('motorcycle-bike') ? '' : route?.itemData?.groupProfile) || (route?.itemData?.chanelProfile?.includes('motorcycle-bike') ? '' : route?.itemData?.chanelProfile)}
                    bio={route?.itemData?.bio ?? bio}
                    title={route?.itemData?.title ?? name}
                    username={conversationType !== 'GROUP' ? (route?.itemData?.username ?? username) : undefined}
                    onUsername={conversationType !== 'GROUP' ? (value) => setUsername(value) : undefined}
                />
            }
            children={
                <View style={styles.secondcontainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                        <RNText label={'Members'} fontSize={fontSize._17} fontWeight={fontWeight._700} color={colors.textColor} />
                        <RNText label={`${(route?.itemData?.participants ?? members).length}`} fontSize={fontSize._15} fontWeight={fontWeight._600} color={'#8B8CAD'} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={route?.itemData?.participants ?? members}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item, index) => `member-${index}`}
                            initialNumToRender={10}
                            renderItem={({ item }: any) => {
                                return (
                                    <ContactContainer
                                        image={item.userProfile ?? item.profileImage}
                                        name={item.userName ?? item.name}
                                        namecolor={colors.textColor}
                                        desc={item.userName ?? item.name}
                                        icon={<TickIcon color={darkMode ? colors.white : colors.primary} />}
                                    />
                                )
                            }}
                        />
                    </View>
                    <TouchableOpacity
                        style={{ position: 'absolute', bottom: 20, right: 20 }}
                        onPress={() => onPressDone()}
                        activeOpacity={0.8}
                    >
                        <Forwardicon />
                    </TouchableOpacity>
                </View>
            }
        />
    )
}

export default AddGroupDetailsScreen
