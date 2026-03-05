import { Pressable, StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import InputField from '../input-field'
import { getHeightInPercentage, getWidthInPercentage } from '../../../utils/dimensions'
import CancelIcon from '../../../assets/svg/cancel.icon'
import { useForm } from 'react-hook-form'
import Context from '../../../context'

interface props {
    onColse: () => void
    onTextValue: (val: any) => void
    iconcolor?: any
    placeholder?: string
}

const SearchBar = (props: props) => {
    const { iconcolor, onColse, onTextValue, placeholder } = props
    const { colors: themeColors } = useContext(Context)
    const { control, formState: { errors }, handleSubmit } = useForm({ mode: 'onSubmit' });

    return (
        <View style={styles.container}>
            <InputField
                name={'search'}
                placeholder={placeholder ?? 'Search Contacts...'}
                height={getHeightInPercentage(6)}
                width={getWidthInPercentage(80)}
                control={control}
                errors={errors}
                borderColor={themeColors.inputBorderColor}
                borderRadius={25}
                backgroundColor={themeColors.inputBGColor}
                color={themeColors.textColor}
                onChangeText={(e: any) => onTextValue(e)}
                returnKeyType='search'
            />
            <Pressable onPress={onColse} style={styles.mt}>
                <CancelIcon color={iconcolor ?? themeColors.textColor} />
            </Pressable>
        </View>
    )
}

export default SearchBar

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '92%',
        height: 40,
        marginHorizontal: 5,
    },
    mt: {
        marginTop: 15
    }
})