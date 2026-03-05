import ProfileIcon from "../../assets/svg/profile.icon"

// Uisample-style tabs: Direct | Rooms | Signals
export const DATA = [
    { id: '1', lable: 'Direct', newMsg: '0', type: 'dm' as const },
    { id: '2', lable: 'Rooms', newMsg: '0', type: 'group' as const },
    { id: '3', lable: 'Signals', newMsg: '0', type: 'chanel' as const },
]

export const OnlineData = [
    {
        id: '1',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '2',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '3',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '4',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '5',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '6',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '7',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '8',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
    {
        id: '9',
        name: 'Ashish',
        icon: <ProfileIcon />
    },
]

export const memberList = [
    {
        id: '1',
        title: 'Pinned Message(2)',
        data: [
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            }
        ]
    },
    {
        id: '2',
        title: 'All Message(8)',
        data: [
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
            {
                id: '1',
                name: 'Ashish',
                time: '10:00 am',
                lastmsg: 'Hello Sir'
            },
        ]
    }
]

export interface HomeProps {
    username?: string
    totalmessages?: string
    onlinestatus?: string
    Data?: any
    messageCount?: any
    listEmptyComponent?: any
    onlineUserData?: any
    onRightIconPress?: () => void
    refetch?: () => void
    onLablePress: (val: any) => void
    onTextValue: (val: any) => void
    onClickItem: (val: any) => void
}