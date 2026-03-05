import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const CancelIcon = ({ size, color }: { size?: number, color?: any }) => (
    <SvgCss
        xml={`<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.32812 13.117L7.33701 7.00013L13.3459 13.117M13.3459 0.883301L7.33587 7.00013L1.32812 0.883301" stroke=${color ?? "#646464"} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
           
     `}
        height={size ?? 22}
        width={size ?? 20}
    />
);

export default CancelIcon;
