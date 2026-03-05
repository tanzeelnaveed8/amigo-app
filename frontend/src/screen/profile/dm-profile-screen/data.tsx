import ProfileCallIcon from "../../../assets/svg/profilecall.icon";
import ProfileImageIcon from "../../../assets/svg/profileimage.icon";
import ProfileSettingIcon from "../../../assets/svg/profilesetting.icon";
import ProfileShareIcon from "../../../assets/svg/profileshare.icon";
import ProfileVideoIcon from "../../../assets/svg/profilevideo.icon";
import { images } from "../../../constants/image";


export const DATA = [
    {
        id: '1',
        name: 'Jonathan',
        desc: ' @jonathan1011',
        image: images.user,
        admin: true
    },
    {
        id: '2',
        name: 'Jonathan',
        desc: ' @jonathan1011',
        image: images.user
    },
    {
        id: '3',
        name: 'Jonathan',
        desc: ' @jonathan1011',
        image: images.user
    },
    {
        id: '4',
        name: 'Jonathan',
        desc: ' @jonathan1011',
        image: images.user
    },
]

export const userAction = [{ id: '1', name: 'Kick' }, { id: '2', name: 'Make admin' }, { id: '3', name: 'Report' }]

export interface props2 {
    isvisible?: boolean
    item?: any
    dropdown?: any
}

export interface props {
    onBio?: (val: any) => void
    setShowSearch: () => void
    isSettingshow?: boolean
    pencilHide?: boolean
    data: any
    onCallIconPress: () => void
    onVideoIconPress: () => void
    onImageIconPress: () => void
    onShareIconPress: () => void
    onSettingIconPress: () => void
    omHeaderRightIcon?: () => void
}

export const getIconData = (colors: any) => [
    {
        id: '1',
        icon: <ProfileCallIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '2',
        icon: <ProfileVideoIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '3',
        icon: <ProfileImageIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '4',
        icon: <ProfileShareIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '5',
        icon: <ProfileSettingIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
]
export const getIconDataNoSetting = (colors: any) => [
    {
        id: '1',
        icon: <ProfileCallIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '2',
        icon: <ProfileVideoIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '3',
        icon: <ProfileImageIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
    {
        id: '4',
        icon: <ProfileShareIcon color={colors.textColor} rectColor={colors.accentColor} rectOpacity={'0.2'} />
    },
]