import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const AdminIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={` <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" fill="white"/>
        </svg>
            
     `}
        height={size ?? 25}
        width={size ?? 25}
    />
);

export default AdminIcon;
