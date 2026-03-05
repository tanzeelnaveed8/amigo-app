import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const RightIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.875 2.62527L8.375 19.1253L0.8125 11.5628L2.75125 9.62402L8.375 15.234L22.9362 0.686523L24.875 2.62527Z" fill="white"/>
        </svg>
          
     `}
        height={size ?? 25}
        width={size ?? 25}
    />
);

export default RightIcon;
