import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ReplayIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_306_2833)">
        <path d="M0.519305 11.8647L11.5196 2.36568C12.4824 1.53412 14 2.20918 14 3.50093V8.50424C24.0393 8.61918 32 10.6312 32 20.1454C32 23.9854 29.5262 27.7897 26.7917 29.7786C25.9384 30.3993 24.7222 29.6203 25.0369 28.6142C27.8709 19.5509 23.6927 17.1448 14 17.0053V22.5C14 23.7937 12.4812 24.4658 11.5196 23.6352L0.519305 14.1352C-0.172633 13.5376 -0.17357 12.4632 0.519305 11.8647Z" fill="black"/>
        </g>
        <defs>
        <clipPath id="clip0_306_2833">
        <rect width="32" height="32" fill="white"/>
        </clipPath>
        </defs>
        </svg>
        
          
     `}
        height={size ?? 30}
        width={size ?? 30}
    />
);

export default ReplayIcon;
