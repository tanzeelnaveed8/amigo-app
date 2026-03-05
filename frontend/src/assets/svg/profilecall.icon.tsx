import * as React from 'react';
import { View } from 'react-native';
import Svg, { SvgCss } from 'react-native-svg/css';

const ProfileCallIcon = ({ size, color, rectColor, rectOpacity }: { size?: number, color?: string, rectColor?: string, rectOpacity?: string }) => (
    <SvgCss
        xml={`<svg width="46" height="48" viewBox="0 0 46 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_404_2719)">
            <rect x="1" width="38" height="38" rx="15" fill="${rectColor ?? 'white'}" fill-opacity="${rectOpacity ?? '0.25'}" shape-rendering="crispEdges"/>
            <path d="M28.01 22.38C26.78 22.38 25.59 22.18 24.48 21.82C24.3061 21.7611 24.1191 21.7523 23.9405 21.7948C23.7618 21.8372 23.5988 21.9291 23.47 22.06L21.9 24.03C19.07 22.68 16.42 20.13 15.01 17.2L16.96 15.54C17.23 15.26 17.31 14.87 17.2 14.52C16.83 13.41 16.64 12.22 16.64 10.99C16.64 10.45 16.19 10 15.65 10H12.19C11.65 10 11 10.24 11 10.99C11 20.28 18.73 28 28.01 28C28.72 28 29 27.37 29 26.82V23.37C29 22.83 28.55 22.38 28.01 22.38Z" fill="${color ?? 'white'}"/>
            </g>
            <defs>
            <filter id="filter0_d_404_2719" x="0" y="0" width="46" height="48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="3" dy="6"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_404_2719"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_404_2719" result="shape"/>
            </filter>
            </defs>
            </svg>  `}
        height={size ?? 55}
        width={size ?? 55}
    />
);

export default ProfileCallIcon;
