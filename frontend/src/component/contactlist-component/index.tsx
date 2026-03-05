import { FlatList, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import useNavigationHook from '../../hooks/use_navigation'
import { DATA, creteData, props } from './data'
import ContactContainer from '../atoms/contact-container'
import Context from '../../context'
import { _isEmpty, removeCopyItem, searchData } from '../../utils/helper'
import { Searchuser } from '../../apis/auth'
import { ArrowLeft, Search, X } from 'lucide-react-native'
import { FontFamily } from '../../../GlobalStyles'
import ListemptyComponent from '../atoms/listEmptyComponent'

const ContactListComponent = (props: props) => {
    const { onItemPress, data, listEmty } = props
    const navigation = useNavigationHook()
    const [showsearch, setShowSearch] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [contactdata, setContactData] = useState(data)
    const { setConversationType, shareMsg, colors } = useContext(Context)

    useEffect(() => {
        setContactData(data)
    }, [data])

    const handleSearch = useCallback(
        (text: string) => {
            setSearchText(text)
            if (text.length === 0) {
                setContactData(data)
                return;
            }
            Searchuser({ userName: text }).then((res) => {
                const arr = [...(data || [])]
                for (let index = 0; index < res.data.length; index++) {
                    const obj = { ...res.data[index] }
                    obj.name = res.data[index].userName
                    obj.desc = res.data[index].firstName
                    obj.profileImage = res.data[index].userProfile
                    obj.id = res.data[index]._id
                    obj.blockUser = []
                    obj.conversationId = ''
                    arr.push(obj)
                }
                const filteredData = searchData(arr, text, 'name');
                const filter = removeCopyItem(filteredData, 'id')
                setContactData(filter)
            })
        },
        [data],
    );

    return (
        <SafeAreaView style={[s.safeArea, { backgroundColor: colors.bgColor }]}>
            <View style={[s.container, { backgroundColor: colors.bgColor }]}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
                        <ArrowLeft size={22} color={colors.textColor} />
                    </TouchableOpacity>
                    <Text style={[s.headerTitle, { color: colors.textColor }]}>New Message</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search Bar */}
                <View style={s.searchContainer}>
                    <View style={[s.searchBox, { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.borderColor }]}>
                        <Search size={18} color={colors.secondaryText} />
                        <TextInput
                            style={[s.searchInput, { color: colors.textColor }]}
                            placeholder="Search contacts or users..."
                            placeholderTextColor={colors.secondaryText}
                            value={searchText}
                            onChangeText={handleSearch}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchText(''); setContactData(data); }}>
                                <X size={18} color={colors.secondaryText} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* New Group / New Channel */}
                {_isEmpty(shareMsg.message) && (
                    <View style={s.actionsContainer}>
                        {creteData.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.7}
                                style={s.actionItem}
                                onPress={() => {
                                    setConversationType(item.type)
                                    navigation.navigate('GroupTypeScreen')
                                }}>
                                {item.icone}
                                <Text style={[s.actionText, { color: colors.textColor }]}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={[s.divider, { backgroundColor: colors.borderColor }]} />
                    </View>
                )}

                {/* Contacts Label */}
                <View style={s.sectionHeader}>
                    <Text style={[s.sectionTitle, { color: colors.secondaryText }]}>Contacts on Amigo</Text>
                </View>

                {/* Contact List */}
                <FlatList
                    data={contactdata ?? DATA}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item.name}_${item.id}_${index}`}
                    initialNumToRender={10}
                    contentContainerStyle={s.listContent}
                    ListEmptyComponent={listEmty || <ListemptyComponent isLoading={false} />}
                    renderItem={({ item }) => (
                        <ContactContainer
                            onPress={() => onItemPress(item)}
                            image={item.profileImage}
                            namecolor={colors.textColor}
                            name={item.name}
                            desc={item.desc}
                            desccolor={colors.secondaryText}
                            icon={undefined}
                        />
                    )}
                />
            </View>
        </SafeAreaView>
    )
}

export default ContactListComponent

const s = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 15 : 5,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: FontFamily.robotoBold,
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141422',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: FontFamily.robotoRegular,
        fontSize: 15,
        color: '#FFFFFF',
        paddingVertical: 0,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 14,
    },
    actionText: {
        fontFamily: FontFamily.robotoBold,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginTop: 8,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    sectionTitle: {
        fontFamily: FontFamily.robotoBold,
        fontSize: 13,
        fontWeight: '700',
        color: '#8B8CAD',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 30,
    },
})
