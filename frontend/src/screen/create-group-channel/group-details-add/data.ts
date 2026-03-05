import { images } from "../../../constants/image";

export const DATA = [
    {
        id: '1',
        name: 'Jonathan',
        image: images.user
    },
    {
        id: '2',
        name: 'Jonathan',
        image: images.user
    },
    {
        id: '3',
        name: 'Jonathan',
        image: images.user
    },
    {
        id: '4',
        name: 'Jonathan',
        image: images.user
    },
]

export interface props {
    onName: (val: any) => void
    onBoi: (val: any) => void
    onRightIconPress?: () => void
    onProfileIconPress?: () => void
    image?: any
    bio?: any
    title?: any
    /** Signal only */
    username?: string
    onUsername?: (val: string) => void
}
