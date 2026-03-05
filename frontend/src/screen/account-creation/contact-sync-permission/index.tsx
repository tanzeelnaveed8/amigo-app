import { Image, PermissionsAndroid, Platform, View } from 'react-native'
import React, { useContext } from 'react'
import { getHeightInPercentage } from '../../../utils/dimensions'
import { images } from '../../../constants/image'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import Button from '../../../component/atoms/button'
import BackgroundContainer from '../../../component/atoms/bg-container'
import useNavigationHook from '../../../hooks/use_navigation'
import styles from './styles'
import Contacts from '../../../utils/contactsCompat';
import { useMutation } from 'react-query'
import { CheckContactList } from '../../../apis/contacts'
import Context from '../../../context'
import {Image as FastImage} from 'expo-image'

const ContactSyncPermission = () => {
    const navigation = useNavigationHook()
    const { setLoader, setToastMsg, colors } = useContext(Context)

    const { mutate } = useMutation(CheckContactList, {
        onSuccess: (res) => {
            setToastMsg(res.message)
            navigation.navigate('MyDrawer')
            setLoader(false)
        },
        onError: () => {
            console.log('CHECK_CONTACT_LIST_ERRPR');
            setLoader(false)
        },
    });

    const getContact = async () => {
        await Contacts.getAll()
            .then(contacts => {
                const contactSort = contacts.sort((a, b) =>
                    a.givenName.toLowerCase() > b.givenName.toLowerCase() ? 1 : -1
                );
                mutate({ contact: contactSort })
            })
            .catch(e => {
                console.warn('Permission to access contacts was denied');
            });
    }

    const requestContactsPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    {
                        title: "Contacts Permission",
                        message: "This app needs access to your contacts.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getContact()
                } else {
                    console.log('PERMISSION ERROR', granted);
                }
            } else {
                getContact()
            }
        } catch (err) {
            return false;
        }
    };


    return (
        <BackgroundContainer
            mainchildren={<FastImage source={images.contact} style={styles.image} contentFit='contain' />}
            children={
                <View style={styles.container}>
                    <RNText color={colors.textColor} marginTop={getHeightInPercentage(5)} label={'Amigo needs access to your contact so that you an connect with your friends. Contacts will be continuously synced with Amigo heavily encrypted cloud services.'} lineHeight={24} textAlign='center' paddingHorizontal={50} fontWeight={fontWeight._700} fontSize={fontSize._17} />
                    <Button
                        title='Not Now'
                        height={55}
                        width={'50%'}
                        alignSelf='center'
                        borderRadius={30}
                        color={colors.grey}
                        backgroundColor={colors.white}
                        borderColor={colors.primary}
                        fontWeight={fontWeight._700}
                        fontSize={fontSize._18}
                        marginTop={getHeightInPercentage(8)}
                        onPress={() => navigation.navigate('MyDrawer')}

                    />
                    <Button
                        title='Continue'
                        height={55}
                        width={'50%'}
                        alignSelf='center'
                        borderRadius={30}
                        color={colors.white}
                        backgroundColor={colors.primary}
                        borderColor={colors.primary}
                        fontWeight={fontWeight._700}
                        marginTop={15}
                        fontSize={fontSize._18}
                        onPress={requestContactsPermission}
                    />
                </View>
            }
        />
    )
}

export default ContactSyncPermission