import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image as ImageIcon, Camera, FileText, Users } from "lucide-react-native";

export const ATTACH_IDS = {
    GALLERY: '0',
    CAMERA: '1',
    FILES: '2',
    CONTACT: '3',
} as const;

export const Data = [
    {
        id: ATTACH_IDS.GALLERY,
        iconBg: 'rgba(168, 85, 247, 0.2)',
        iconColor: '#A855F7',
        Icon: ImageIcon,
        title: 'Gallery / Photos',
        subtitle: 'Choose from photos',
    },
    {
        id: ATTACH_IDS.CAMERA,
        iconBg: 'rgba(236, 72, 153, 0.2)',
        iconColor: '#EC4899',
        Icon: Camera,
        title: 'Camera',
        subtitle: 'Take a new photo',
    },
    {
        id: ATTACH_IDS.FILES,
        iconBg: 'rgba(59, 130, 246, 0.2)',
        iconColor: '#3B82F6',
        Icon: FileText,
        title: 'Files / Documents',
        subtitle: 'Share documents',
    },
    {
        id: ATTACH_IDS.CONTACT,
        iconBg: 'rgba(34, 197, 94, 0.2)',
        iconColor: '#22C55E',
        Icon: Users,
        title: 'Contact',
        subtitle: 'Share contact',
    },
];

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textCol: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    subtitle: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
});

export const AttachRowStyles = s;

export interface ModalPorpsType {
    visible: boolean;
    onPressOut: () => void;
    onPressItem: (e: any, c: any) => void;
    children?: React.ReactNode;
    box?: boolean;
    backgroundOpacity?: number;
    animationType?: 'fade' | 'none' | 'slide';
    boxWidth?: any;
    padding?: any;
    paddingVertical?: any;
    ref?: any;
    bgColor?: any;
    height?: any;
    overflow?: "visible" | "hidden" | "scroll";
    isCenter?: boolean;
}
