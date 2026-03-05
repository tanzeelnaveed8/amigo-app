import { Darkcolors } from "../constants/color";

export type ThemeMode = 'day' | 'dark' | 'ghost';

const initialState = {
    loader: false,
    setLoader: (value: boolean) => value,
    groupId: '',
    setGroupId: (value: string) => value,
    chanelId: '',
    setChanelId: (value: string) => value,
    contactList: [],
    setConatctList: (value: any[]) => value,
    conversationType: 'GROUP',
    setConversationType: (value: string) => value,
    toastMsg: '',
    setToastMsg: (value: string) => value,
    shareMsg: { image: '', audio: '', doc: '', message: '', video: '' },
    setShareMsg: (value: any) => value,
    darkMode: true,
    setDarkMode: (value: boolean) => value,
    themeMode: 'dark' as ThemeMode,
    setThemeMode: (value: ThemeMode) => value,
    colors: Darkcolors,
    setColors: (value: any) => value,
    socketConnected: false,
    setSocketConnected: (value: boolean) => value,
    groupType: '',
    setGroupType: (value: string) => value,
    selectedMembers: [],
    setSelectedMembers: (value: any[]) => value,
    localConversations: [] as any[],
    addOrUpdateLocalConversation: (_item: any) => {},
    localChatMessages: {} as Record<string, any[]>,
    getLocalMessages: (_key: string) => [] as any[],
    appendLocalMessage: (_key: string, _message: any) => {},
    setLocalMessagesForKey: (_key: string, _messages: any[]) => {},
}

export default initialState