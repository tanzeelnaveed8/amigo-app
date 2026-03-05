import React, { useContext } from 'react';
import { TouchableWithoutFeedback, View, StyleSheet, Modal, Platform, FlatList, TouchableOpacity, Text, Alert } from 'react-native';
import * as ExpoContacts from 'expo-contacts';
import * as ImagePicker from '../../../utils/imagePickerCompat';
import DocumentPicker from '../../../utils/documentPickerCompat';
import { Data, ATTACH_IDS, AttachRowStyles, ModalPorpsType } from './data';
import socketServics from '../../../utils/socket';
import Context from '../../../context';

const DocPickModal = (props: ModalPorpsType) => {
    const { onPressOut, visible, ref, onPressItem } = props;
    const { colors } = useContext(Context);

    const OpenDocumentPicker = async () => {
        socketServics.startMediaOperation();
        try {
            const response: any = await DocumentPicker.pick({
                presentationStyle: 'fullScreen',
            });
            onPressItem(response, response?.[0]?.type == 'audio/mpeg' ? 'audio' : 'doc');
            onPressOut();
        } catch (err) {
            onPressOut();
            console.log(err);
        } finally {
            socketServics.endMediaOperation();
        }
    };

    const OpenGallery = async (mediaType: 'image' | 'video') => {
        socketServics.startMediaOperation();
        try {
            await ImagePicker.launchImageLibrary(
                { mediaType },
                (response: any) => {
                    if (!response.didCancel) {
                        onPressItem(response.assets, mediaType);
                        onPressOut();
                    }
                    socketServics.endMediaOperation();
                }
            );
        } catch (err: any) {
            onPressOut();
            console.log(err?.message);
            socketServics.endMediaOperation();
        }
    };

    const OpenCamera = () => {
        socketServics.startMediaOperation();
        ImagePicker.launchCamera(
            { mediaType: 'photo' },
            (response: any) => {
                if (!response.didCancel && response.assets) {
                    onPressItem(response.assets, 'image');
                    onPressOut();
                }
                socketServics.endMediaOperation();
            }
        );
    };

    const OpenContactPicker = async () => {
        try {
            const { status } = await ExpoContacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Contacts',
                    'Permission to access contacts is required to share a contact.',
                    [{ text: 'OK', onPress: onPressOut }]
                );
                return;
            }
            const contact = await ExpoContacts.presentContactPickerAsync();
            if (contact) {
                const phones = (contact.phoneNumbers || []).map((p: any) => p.number || '').filter(Boolean);
                const payload = {
                    name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
                    phoneNumbers: phones,
                    emails: (contact.emails || []).map((e: any) => e.email || '').filter(Boolean),
                };
                onPressItem([payload], 'contact');
            }
            onPressOut();
        } catch (err: any) {
            if (err?.message?.toLowerCase?.().includes('cancel') || err?.code === 'E_NO_CONTACT_SELECTED') {
                onPressOut();
                return;
            }
            Alert.alert('Error', err?.message || 'Could not open contact picker.');
            onPressOut();
        }
    };

    const onClickItem = (id: string) => {
        switch (id) {
            case ATTACH_IDS.GALLERY:
                OpenGallery('image');
                break;
            case ATTACH_IDS.CAMERA:
                OpenCamera();
                break;
            case ATTACH_IDS.FILES:
                OpenDocumentPicker();
                break;
            case ATTACH_IDS.CONTACT:
                OpenContactPicker();
                break;
            default:
                onPressOut();
                break;
        }
    };

    const cardBg = colors?.cardBg ?? '#1A1A2E';
    const borderColor = 'rgba(255,255,255,0.1)';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            ref={ref}
        >
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={onPressOut}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
                </TouchableWithoutFeedback>
                <View style={[styles.mainview, { backgroundColor: cardBg, borderColor }]}>
                    <FlatList
                        data={Data}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => {
                            const Icon = item.Icon;
                            return (
                                <TouchableOpacity
                                    onPress={() => onClickItem(item.id)}
                                    style={[AttachRowStyles.row, { backgroundColor: 'transparent' }]}
                                    activeOpacity={0.7}
                                >
                                    <View style={[AttachRowStyles.iconCircle, { backgroundColor: item.iconBg }]}>
                                        <Icon size={18} color={item.iconColor} strokeWidth={2} />
                                    </View>
                                    <View style={AttachRowStyles.textCol}>
                                        <Text style={AttachRowStyles.title}>{item.title}</Text>
                                        <Text style={AttachRowStyles.subtitle}>{item.subtitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default DocPickModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    mainview: {
        width: '100%',
        minWidth: 200,
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 75 : 95,
        borderRadius: 16,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    listContent: {
        paddingVertical: 4,
    },
});
