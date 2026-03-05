import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const NoMessageIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="123" height="123" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <rect width="123" height="123" fill="url(#pattern0_306_2805)"/>
        <defs>
        <pattern id="pattern0_306_2805" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlink:href="#image0_306_2805" transform="scale(0.015625)"/>
        </pattern>
        <image id="image0_306_2805" width="64" height="64" xlink:href="data:image/png;base64,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"/>
        </defs>
        </svg>
        
                    
     `}
        height={size ?? 150}
        width={size ?? 150}
    />
);

export default NoMessageIcon;
