import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const VideoCallingIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={`<svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.875 3.42857C13.875 2.51926 13.5194 1.64719 12.8865 1.00421C12.2535 0.361223 11.3951 0 10.5 0H3.375C2.47989 0 1.62145 0.361223 0.988515 1.00421C0.355579 1.64719 0 2.51926 0 3.42857V12.5714C0 13.4807 0.355579 14.3528 0.988515 14.9958C1.62145 15.6388 2.47989 16 3.375 16H10.5C11.3951 16 12.2535 15.6388 12.8865 14.9958C13.5194 14.3528 13.875 13.4807 13.875 12.5714V3.42857ZM15 10.8952L18.7598 13.76C19.6823 14.4632 21 13.7943 21 12.6225V3.37829C21 2.20571 19.683 1.53676 18.7598 2.24L15 5.10476V10.8952Z" fill="${color ?? '#F9F9F9'}"/>
        </svg>
            
     `}
        height={size ?? 23}
        width={size ?? 23}
    />
);

export default VideoCallingIcon;
