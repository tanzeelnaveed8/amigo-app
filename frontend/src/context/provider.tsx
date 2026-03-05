import { useMemo, useReducer } from "react"
import reducer from "./reducer"
import initialState from "./initialstate"
import actions from "./action"
import Context from './index';
import { contextStateType } from "./type";

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const value: contextStateType = useMemo(() => ({
        loader: state.loader,
        setLoader: (val: boolean) => dispatch({
            type: actions.LOADER,
            value: val,
        }),
        groupId: state.groupId,
        setGroupId: (val: any) => dispatch({
            type: actions.GROUP_ID,
            value: val,
        }),
        chanelId: state.chanelId,
        setChanelId: (val: any) => dispatch({
            type: actions.CHANEL_ID,
            value: val,
        }),
        contactList: state.contactList,
        setConatctList: (val: any[]) => dispatch({
            type: actions.CONTACT_LIST,
            value: val,
        }),
        conversationType: state.conversationType,
        setConversationType: (val: string) => dispatch({
            type: actions.GROUP_CHANNEL,
            value: val,
        }),
        toastMsg: state.toastMsg,
        setToastMsg: (val: string) => {
            dispatch({ type: actions.TOAST_MSG, value: val });
        },
        shareMsg: state.shareMsg,
        setShareMsg: (val: string) => {
            dispatch({ type: actions.SHARE_MESSAGE, value: val });
        },
        darkMode: state.darkMode,
        setDarkMode: (val: boolean) => {
            dispatch({ type: actions.DARK_MODE, value: val });
        },
        themeMode: state.themeMode ?? 'dark',
        setThemeMode: (val: 'day' | 'dark' | 'ghost') => {
            dispatch({ type: actions.THEME_MODE, value: val });
        },
        colors: state.colors,
        setColors: (val: any) => {
            dispatch({ type: actions.COLORS, value: val });
        },
        groupType: state.groupType,
        setGroupType: (val: string) => {
            dispatch({ type: actions.GROUP_TYPE, value: val });
        },
        selectedMembers: state.selectedMembers,
        setSelectedMembers: (val: any[]) => {
            dispatch({ type: actions.SELECTED_MEMBERS, value: val });
        },
        localConversations: state.localConversations ?? [],
        addOrUpdateLocalConversation: (item: any) => {
            dispatch({ type: actions.LOCAL_CONVERSATIONS, value: item });
        },
        localChatMessages: state.localChatMessages ?? {},
        getLocalMessages: (key: string) => (state.localChatMessages ?? {})[key] ?? [],
        appendLocalMessage: (key: string, message: any) => {
            dispatch({ type: actions.LOCAL_CHAT_MESSAGES, value: { key, message } });
        },
        setLocalMessagesForKey: (key: string, messages: any[]) => {
            dispatch({ type: actions.LOCAL_CHAT_MESSAGES, value: { key, messages } });
        },
    }), [state])

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export default ContextProvider