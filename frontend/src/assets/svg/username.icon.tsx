import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const UserNameIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={` <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 18C15.9853 18 18 15.9853 18 13.5C18 11.0147 15.9853 9 13.5 9C11.0147 9 9 11.0147 9 13.5C9 15.9853 11.0147 18 13.5 18Z" stroke="#9B7BFF" stroke-width="2"/>
        <path d="M24.75 13.5C24.75 7.28663 19.7134 2.25 13.5 2.25C7.28663 2.25 2.25 7.28663 2.25 13.5C2.25 19.7134 7.28663 24.75 13.5 24.75C16.0335 24.75 18.3712 23.913 20.2511 22.5" stroke="#9B7BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 9V13.5C18 14.625 18.675 16.875 21.375 16.875C24.075 16.875 24.75 14.625 24.75 13.5" stroke="#9B7BFF" stroke-width="2" stroke-linecap="round"/>
        </svg>
        
            
     `}
        height={size ?? 20}
        width={size ?? 20}
    />
);

export default UserNameIcon;
