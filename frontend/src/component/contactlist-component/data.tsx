import React from "react"
import { View } from "react-native"
import { UsersRound, Megaphone } from "lucide-react-native"

const IconBox = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        {children}
    </View>
)

export const creteData = [
    {
        id: '1',
        name: 'New Group',
        type: 'GROUP',
        icone: <IconBox bg="rgba(155, 123, 255, 0.15)"><UsersRound size={22} color="#9B7BFF" strokeWidth={2} /></IconBox>
    },
    {
        id: '2',
        name: 'New Channel',
        type: 'CHANEL',
        icone: <IconBox bg="rgba(59, 130, 246, 0.15)"><Megaphone size={22} color="#3B82F6" strokeWidth={2} /></IconBox>
    }
]

export const DATA: any[] = []

export interface props {
    data?: any
    listEmty?: any
    onItemPress: (e: any) => void
}