import BioIcon from "../../assets/svg/bio.icon";
import CallingIcon from "../../assets/svg/calling.icon";
import EyeIcon from "../../assets/svg/eye.icon";
import DarkModeIcon from "../../assets/svg/mode.icon";
import NameIcon from "../../assets/svg/name.icon";
import NotificationIcon from "../../assets/svg/notification.icon";
import PencilIcon from "../../assets/svg/pencil.icon";
import PrivecyIcon from "../../assets/svg/privecy.icon";
import UserNameIcon from "../../assets/svg/username.icon";
import colors from "../../constants/color";

export const DATA = [
    {
        id: '1',
        name: 'Account',
        data: [{
            id: "1",
            name: "Name",
            desc: "My Name",
            icon1: <NameIcon size={35} />,
            icon2: <PencilIcon color={colors.grey} />,
            switch: false
        },
        {
            id: "2",
            name: "Username",
            desc: "you cannot change his username more than 3 times.",
            icon1: <UserNameIcon size={35} />,
            icon2: <PencilIcon color={colors.grey} />,
            switch: false
        },
        {
            id: "3",
            name: "Bio",
            desc: "Bio",
            icon1: <BioIcon />,
            icon2: <PencilIcon color={colors.grey} />,
            switch: false
        },
        {
            id: "4",
            name: "Phone",
            desc: "Nobody can see your phone number in any group or channel",
            icon1: <CallingIcon color={colors.primary} sizeh={25} sizew={35} />,
            icon2: null,
            switch: true,
            istoggle: false
        },]
    },
    {
        id: '2',
        name: 'Settings',
        data: [{
            id: "1",
            name: "Notifications & Sounds",
            icon1: <NotificationIcon size={35} />,
            icon2: null,
            switch: true,
            istoggle: false,
            desc: "",

        },
        {
            id: "2",
            name: "Privacy",
            icon1: <PrivecyIcon size={35} />,
            icon2: null,
            switch: false,
            desc: "",

        },
        {
            id: "3",
            name: "Dark Mode",
            icon1: <DarkModeIcon />,
            icon2: <EyeIcon />,
            switch: false,
            desc: "",

        }]
    }
]