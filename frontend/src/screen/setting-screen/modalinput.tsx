import { StyleSheet, View } from 'react-native'
import React from 'react'
import { useForm } from 'react-hook-form';
import InputField from '../../component/atoms/input-field';
import { getHeightInPercentage } from '../../utils/dimensions';
import colors from '../../constants/color';
import Button from '../../component/atoms/button';
import fontWeight from '../../constants/font-weight';
import fontSize from '../../constants/font-size';
import { _isEmpty } from '../../utils/helper';

interface props {
    name: string
    defaultValue: string
    onDone: (val: any) => void
    onClose: () => void
}

const ModalInput = (props: props) => {
    const { defaultValue, onDone, name, onClose } = props
    const { control, formState: { errors }, handleSubmit, getValues } = useForm({ mode: 'onSubmit' });

    const onSubmit = (data: any) => {
        onDone(data)
        onClose()
    }

    return (
        <View style={{ width: '100%', alignSelf: 'center', paddingHorizontal: 30 }}>
            <InputField
                title={name}
                name={name}
                placeholder={'Enter Your ' + name}
                placeholderTextColor={colors.lightText}
                height={getHeightInPercentage(6)}
                defaultValue={defaultValue}
                width={'100%'}
                control={control}
                errors={errors}
                borderColor={colors.textinputBorder}
                borderRadius={8}
                backgroundColor={colors.white}
                onChangeText={() => { }}
            />
            <Button
                title='Done'
                height={50}
                width={'50%'}
                alignSelf='center'
                borderRadius={30}
                color={colors.white}
                backgroundColor={colors.primary}
                borderColor={colors.primary}
                fontWeight={fontWeight._700}
                fontSize={fontSize._18}
                onPress={handleSubmit(onSubmit)}
            />
        </View>
    )
}

export default ModalInput