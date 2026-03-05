import AdminIcon from "../../../../assets/svg/admin.icon";
import MemberIcon from "../../../../assets/svg/member.icon";
import NotificationIcon from "../../../../assets/svg/notification.icon";

export const getDATA = (colors: any) => [
    {
        id: "1",
        name: "Notifications",
        desc: null,
        icon1: <NotificationIcon color={colors.textColor} size={35} />,
        icon2: null,
        switch: true,
        istoggle: false
    },
    {
        id: "2",
        name: "Add members",
        desc: null,
        icon1: <MemberIcon size={30} color={colors.textColor} />,
        icon2: null,
        switch: false
    },
    {
        id: "3",
        name: "Admins",
        desc: null,
        icon1: <AdminIcon size={35} />,
        icon2: null,
        switch: false
    },
]