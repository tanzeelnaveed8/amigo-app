export type contextStateType = {
    loader: boolean;
    setLoader: (value: boolean) => any;
    groupId: string;
    setGroupId: (value: string) => any;
    chanelId: string;
    setChanelId: (value: string) => any;
    contactList: any;
    setConatctList: (value: any) => any;
    conversationType: any,
    setConversationType: (value: any) => any,
    toastMsg: '';
    setToastMsg: (value: string) => any;
    shareMsg: any;
    setShareMsg: (value: any) => any;
    darkMode: boolean;
    setDarkMode: (value: boolean) => any;
    themeMode?: 'day' | 'dark' | 'ghost';
    setThemeMode?: (value: 'day' | 'dark' | 'ghost') => any;
    colors: {
        primary: string,
        bgColor: string,
        textColor: string,
        whiteDark: string,
        white: string,
        black: string,
        grey: string,
        lightgrey: string,
        inputBGColor: string,
        lightText: string,
        inputBorderColor: string,
        red: string,
        transparent: string,
        textinputBorder: string,
        imagebordercolor: string,
        senderBubble: string,
        receiverBubble: string,
        deletedBubble: string,
        bubbleText: string,
        cardBg: string,
        surfaceBg: string,
        borderColor: string,
        secondaryText: string,
        accentColor: string,
        greenDotBorder: string,
    };
    setColors: (value: any) => any;
    groupType: string;
    setGroupType: (value: string) => any;
    selectedMembers: any[];
    setSelectedMembers: (value: any[]) => any;
    localConversations: any[];
    addOrUpdateLocalConversation: (item: any) => any;
    localChatMessages: Record<string, any[]>;
    getLocalMessages: (key: string) => any[];
    appendLocalMessage: (key: string, message: any) => any;
    setLocalMessagesForKey: (key: string, messages: any[]) => any;
};