import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const DobleTickIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="14" height="7" viewBox="0 0 14 7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4.07692L3.4 6M6.76 2.92308L9.16 1M4.84 4.07692L7.24 6L13 1" stroke="#717171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
         `}
        height={size ?? 15}
        width={size ?? 17}
    />
);

export default DobleTickIcon;
