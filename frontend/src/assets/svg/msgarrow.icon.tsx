import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const MsgArrowIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 17.5C12.7877 20.5335 8 21 4.6725 18.4487C-1 15 -0.327502 10.9483 1.67346 6.44648C4.88578 3.41297 -1.13073 -3.31882 8.99955 2.00021C8.99955 6 7.5 15.001 16 17.5Z" fill="#141422"/>
        </svg>        
         `}
        height={size ?? 23}
        width={size ?? 23}
    />
);

export default MsgArrowIcon;
