import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const MoreIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="7" height="25" viewBox="0 0 7 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="3.5" cy="3.5" r="3.5" fill="grey"/>
        <circle cx="3.5" cy="12.5" r="3.5" fill="grey"/>
        <circle cx="3.5" cy="21.5" r="3.5" fill="grey"/>
        </svg>
         `}
        height={size ?? 23}
        width={size ?? 23}
    />
);

export default MoreIcon;
