import actions from "./action";
import { Lightcolors, Darkcolors, PurpleThemeColors } from "../constants/color";

type Action = {
    type: string;
    value: any;
};

const reducer = (state: any, action: Action) => {
    switch (action.type) {
        case actions.LOADER:
            return {
                ...state,
                loader: action.value,
            };
        case actions.GROUP_ID:
            return {
                ...state,
                groupId: action.value,
            };
        case actions.CHANEL_ID:
            return {
                ...state,
                chanelId: action.value,
            };
        case actions.CONTACT_LIST:
            return {
                ...state,
                contactList: action.value,
            };
        case actions.GROUP_CHANNEL:
            return {
                ...state,
                conversationType: action.value,
            };
        case actions.TOAST_MSG:
            return {
                ...state,
                toastMsg: action.value,
            };
        case actions.SHARE_MESSAGE:
            return {
                ...state,
                shareMsg: action.value,
            };
        case actions.DARK_MODE:
            return {
                ...state,
                darkMode: action.value,
            };
        case actions.THEME_MODE: {
            const mode = action.value === 'day' || action.value === 'ghost' ? action.value : 'dark';
            const colors = mode === 'day' ? Lightcolors : mode === 'ghost' ? PurpleThemeColors : Darkcolors;
            return {
                ...state,
                themeMode: mode,
                darkMode: mode !== 'day',
                colors,
            };
        }
        case actions.COLORS:
            return {
                ...state,
                colors: action.value,
            };
        case actions.GROUP_TYPE:
            return {
                ...state,
                groupType: action.value,
            };
        case actions.SELECTED_MEMBERS:
            return {
                ...state,
                selectedMembers: action.value,
            };
        case actions.LOCAL_CONVERSATIONS: {
            const list = state.localConversations || [];
            const item = action.value;
            const id = item?.id || item?.conversationId;
            if (!id) return state;
            const idx = list.findIndex((c: any) => (c.id === id || c.conversationId === id));
            const next = idx >= 0
                ? list.map((c: any, i: number) => i === idx ? { ...c, ...item, time: item.time ?? c.time, lastmsg: item.lastmsg ?? c.lastmsg } : c)
                : [{ ...item, type: 'dm' }, ...list];
            return { ...state, localConversations: next };
        }
        case actions.LOCAL_CHAT_MESSAGES: {
            const map = state.localChatMessages || {};
            const { key, messages, message } = action.value;
            if (!key) return state;
            if (message !== undefined) {
                const list = map[key] || [];
                return { ...state, localChatMessages: { ...map, [key]: [...list, message] } };
            }
            return { ...state, localChatMessages: { ...map, [key]: messages || [] } };
        }
        default:
            return state
    }


}
export default reducer