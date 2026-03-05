import { Image, Platform, Pressable, SafeAreaView, View } from 'react-native'
import React, { useCallback, useContext, useState } from 'react'
import { getHeightInPercentage } from '../../utils/dimensions'
import Button from '../atoms/button'
import fontWeight from '../../constants/font-weight'
import InputField from '../atoms/input-field'
import { DATA, profileSchema, userdetailProps } from './data'
import { images } from '../../constants/image'
import Header from '../atoms/header'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import useNavigationHook from '../../hooks/use_navigation'
import BackgroundContainer from '../atoms/bg-container'
import styles from './styles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as ImagePicker from '../../utils/imagePickerCompat';
import { openCropper as ImageCropPickerOpenCropper } from '../../utils/imagePickerCompat'
import Context from '../../context'
import {Image as FastImage} from 'expo-image'
import ImageAddIcon from '../../assets/svg/imageadd.icon'

const UserDetailComponent = (props: userdetailProps) => {
    const navigation = useNavigationHook()
    const { colors } = useContext(Context)
    const { onPress, onImage } = props
    const [image, setImage] = useState<any>('')
    const { control, formState: { errors }, handleSubmit } = useForm({ mode: 'onSubmit', resolver: yupResolver(profileSchema) });

    const onSubmit = (data: any) => {
        onPress(data)
    }

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
                        onImage(croppedImage)
                        setImage(croppedImage)
                    }, 600);
                }
            })
        } catch (err: any) {
            console.log(err.message);
        }
    }, [onImage]);

    return (
        <BackgroundContainer
            mainchildren={
                <SafeAreaView style={{ width: '100%', height: getHeightInPercentage(Platform.OS === 'android' ? 15 : 17) }}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Header title='Profile Detail' onLeftIconPress={navigation.goBack} />
                    </View>
                </SafeAreaView>
            }
            children={
                <View style={styles.container}>
                    <Pressable onPress={OpenGallery}>
                        <FastImage source={image ? { uri: 'file://' + image?.path } : images.user} style={styles.image} contentFit='cover' />
                        <View style={styles.addicon} >
                            <ImageAddIcon color={colors.primary} />
                        </View>
                    </Pressable>
                    <KeyboardAwareScrollView
                        bounces={true}
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        extraHeight={Platform.OS === 'android' ? 100 : 250}
                        extraScrollHeight={Platform.OS === 'android' ? 100 : 0}
                        contentContainerStyle={{
                            flexGrow: 1,
                            backgroundColor: colors.transparent,
                            paddingBottom: 30,
                        }}>
                        <View style={styles.inputfiledview}>
                            {
                                DATA.map((item) => {
                                    return (
                                        <InputField
                                            key={item.id}
                                            title={item.title}
                                            name={item.name}
                                            placeholder={item.placeholder}
                                            height={getHeightInPercentage(7)}
                                            width={'95%'}
                                            control={control}
                                            errors={errors}
                                            titleColor={colors.textColor}
                                            borderColor={colors.textinputBorder}
                                            borderRadius={8}
                                            backgroundColor={colors.white}
                                            onChangeText={() => { }}
                                        />
                                    )
                                })
                            }
                        </View>
                        <Button
                            title='Done'
                            height={60}
                            width={'82%'}
                            alignSelf='center'
                            borderRadius={8}
                            color={colors.white}
                            backgroundColor={colors.primary}
                            borderColor={colors.primary}
                            fontWeight={fontWeight._700}
                            marginTop={15}
                            onPress={handleSubmit(onSubmit)}
                        />
                    </KeyboardAwareScrollView>
                </View>
            }
        />
    )
}

export default UserDetailComponent