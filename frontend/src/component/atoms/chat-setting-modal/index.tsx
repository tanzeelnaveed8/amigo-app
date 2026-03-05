import { FlexAlignType, Pressable, StyleSheet, View } from 'react-native'
import React, { memo, useContext } from 'react'
import { getWidthInPercentage } from '../../../utils/dimensions'
import fontWeight from '../../../constants/font-weight'
import fontSize from '../../../constants/font-size'
import RNText from '../text'
import Context from '../../../context'

interface props {
    data: any
    isvisible: any
    top?: any
    right?: any
    left?: any
    width?: any
    alignItems?: FlexAlignType
    onClickItem: (val: any) => void
}

const ICON_SIZE = 18;

const ChatSetting = (props: props) => {
    const { left, data, onClickItem, isvisible, top, right, alignItems, width } = props
    const { colors } = useContext(Context)
    const accent = colors.accentColor ?? '#9B7BFF';
    const textClr = colors.textColor ?? '#FFFFFF';
    const redClr = colors.red ?? '#FF6363';
    const cardBg = colors.cardBg ?? '#141422';
    const borderClr = colors.borderColor ?? 'rgba(255,255,255,0.08)';
    const hoverBg = colors.surfaceBg ?? 'rgba(255,255,255,0.06)';

    if (!isvisible) return null

    return (
        <View style={[styles.container, {
            top: top ?? 8,
            right: right ?? 16,
            left: left,
            alignItems: alignItems,
            width: width ?? getWidthInPercentage(48),
            backgroundColor: cardBg,
            borderColor: borderClr,
        }]}>
            {data.map((item: any, index: number) => {
                const isDestructive = !!item.destructive;
                const iconColor = isDestructive ? redClr : accent;
                const labelColor = isDestructive ? redClr : textClr;
                const IconComp = item.Icon;
                const showSep = index < data.length - 1;
                return (
                    <View key={index.toString()}>
                        <Pressable
                            onPress={() => onClickItem(index)}
                            style={({ pressed }) => [
                                styles.item,
                                pressed && { backgroundColor: hoverBg },
                                index === 0 && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                                index === data.length - 1 && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
                            ]}
                        >
                            <View style={styles.iconWrap}>
                                {IconComp
                                    ? <IconComp size={ICON_SIZE} color={iconColor} strokeWidth={2} />
                                    : item.icon}
                            </View>
                            <RNText
                                label={item.name}
                                fontSize={fontSize._14}
                                fontWeight={fontWeight._600}
                                color={labelColor}
                                style={styles.label}
                            />
                        </Pressable>
                        {showSep && (
                            <View style={[styles.separator, { backgroundColor: borderClr }]} />
                        )}
                    </View>
                )
            })}
        </View>
    )
}

export default memo(ChatSetting)

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        position: 'absolute',
        zIndex: 999,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowOffset: { height: 8, width: 0 },
        shadowRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    iconWrap: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    label: {
        flex: 1,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 16,
    },
})