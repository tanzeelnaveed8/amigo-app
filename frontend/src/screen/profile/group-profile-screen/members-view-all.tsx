import React, { useContext, useMemo, useState } from 'react'
import { FlatList, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { Image as FastImage } from 'expo-image'
import { ChevronLeft, Search } from 'lucide-react-native'
import Context from '../../../context'
import useNavigationHook from '../../../hooks/use_navigation'
import RNText from '../../../component/atoms/text'
import fontSize from '../../../constants/font-size'
import fontWeight from '../../../constants/font-weight'
import { images } from '../../../constants/image'

const RoomMembersScreen = () => {
    const navigation = useNavigationHook()
    const route = useRoute<any>()
    const { colors } = useContext(Context)
    const styles = getStyles(colors)
    const [query, setQuery] = useState('')

    const itemData = route?.params?.itemData ?? {}
    const title = route?.params?.title ?? itemData?.title ?? 'Room'
    const participants = Array.isArray(itemData?.participants) ? itemData.participants : []

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return participants
        return participants.filter((m: any) => {
            const name = `${m?.firstName ?? ''} ${m?.lastName ?? ''}`.trim().toLowerCase()
            const uname = String(m?.userName ?? '').toLowerCase()
            return name.includes(q) || uname.includes(q)
        })
    }, [participants, query])

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={navigation.goBack} style={styles.backBtn} activeOpacity={0.85}>
                        <ChevronLeft size={24} color={colors.secondaryText} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleWrap}>
                        <RNText label="Members" fontSize={fontSize._18} fontWeight={fontWeight._700} color={colors.textColor} />
                        <RNText label={`${filtered.length} in ${title}`} fontSize={fontSize._11} fontWeight={fontWeight._500} color={colors.secondaryText} />
                    </View>
                    <View style={styles.rightSpacer} />
                </View>
            </SafeAreaView>

            <View style={styles.searchWrap}>
                <Search size={18} color={colors.secondaryText} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search members..."
                    placeholderTextColor={colors.secondaryText}
                    style={styles.searchInput}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item: any, index) => String(item?._id ?? index)}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }: any) => {
                    const fullName = `${item?.firstName ?? ''} ${item?.lastName ?? ''}`.trim() || item?.userName || 'Member'
                    const image = item?.userProfile ? { uri: item.userProfile } : images.dummyImage
                    return (
                        <View style={styles.row}>
                            <FastImage source={image} style={styles.avatar} />
                            <View style={styles.meta}>
                                <RNText label={fullName} fontSize={fontSize._15} fontWeight={fontWeight._600} color={colors.textColor} />
                                <RNText label={`@${item?.userName ?? 'member'}`} fontSize={fontSize._12} fontWeight={fontWeight._500} color={colors.secondaryText} />
                            </View>
                        </View>
                    )
                }}
            />
        </View>
    )
}

export default RoomMembersScreen

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
            paddingHorizontal: 18,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 6,
            marginBottom: 14,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
        },
        headerTitleWrap: {
            alignItems: 'center',
        },
        rightSpacer: {
            width: 36,
            height: 36,
        },
        searchWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.borderColor ?? 'rgba(255,255,255,0.08)',
            backgroundColor: colors.cardBg ?? colors.surfaceBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 14,
        },
        searchInput: {
            flex: 1,
            color: colors.textColor,
            paddingVertical: 11,
            fontSize: 14,
        },
        listContent: {
            paddingBottom: 22,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor ?? 'rgba(255,255,255,0.06)',
        },
        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 13,
        },
        meta: {
            flex: 1,
        },
    })
