import { Platform, StyleSheet, TextInput, View } from 'react-native'
import React, { useContext } from 'react'
import PencilIcon from '../../../assets/svg/pencil.icon';
import { getHeightInPercentage } from '../../../utils/dimensions';
import RNText from '../text';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';
import Context from '../../../context';

interface props {
    onBio: (val: any) => void
    width?: any
    defualtValue?: any
    height?: any
    pencilHide?: boolean
}

const BioTextInput = (props: props) => {
    const { height, defualtValue, pencilHide, onBio, width } = props
    const { colors } = useContext(Context)

    return (
        <View style={[styles.bio, { width: width ?? '95%', height: height ?? getHeightInPercentage(20), backgroundColor: colors.cardBg, borderColor: colors.inputBorderColor }]}>
            <View style={styles.pencil}>
                <RNText label={'Bio'} color={colors.textColor} fontSize={fontSize._18} fontWeight={fontWeight._700} />
                {pencilHide ? '' : <PencilIcon />}
            </View>
            <TextInput
                onChangeText={(e: any) => onBio(e)}
                placeholder="Enter you bio..."
                placeholderTextColor={colors.lightText}
                style={[styles.inputStyle, { color: colors.textColor }]}
                multiline
                editable={!pencilHide}
                defaultValue={defualtValue}
                textAlignVertical='center'
            />
        </View>
    )
}

export default BioTextInput

const styles = StyleSheet.create({
    bio: {
        padding: 10,
        marginHorizontal: 30,
        marginTop: 15,
        borderRadius: 10,
        borderWidth: 1,
        height: getHeightInPercentage(18),
        width: '95%'
    },
    pencil: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    inputStyle: {
        width: '100%',
        maxHeight: 85,
        minHeight: 42,
        borderRadius: 15,
        backgroundColor: 'transparent',
        paddingHorizontal: 15,
        paddingVertical: 0,
        paddingTop: 12,
        marginTop: Platform.OS === 'android' ? 0 : 10,
        fontSize: fontSize._16
    },
})