import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const LogOutIcon = ({ size, color }: { size?: number, color?: any }) => (
    <SvgCss
        xml={`<svg width="26" height="27" viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_310_3064)">
        <path d="M18 5.83657L16.59 7.20791L18.17 8.75433H10V10.6995H18.17L16.59 12.2362L18 13.6173L22 9.72691L18 5.83657ZM6 2.91881H13V0.973633H6C4.9 0.973633 4 1.84896 4 2.91881V16.535C4 17.6049 4.9 18.4802 6 18.4802H13V16.535H6V2.91881Z" fill=${color ?? "#232323"}/>
        </g>
        <defs>
        <filter id="filter0_d_310_3064" x="0" y="0.973633" width="26" height="25.5068" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_310_3064"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_310_3064" result="shape"/>
        </filter>
        </defs>
        </svg>
        
         `}
        height={size ?? 30}
        width={size ?? 30}
    />
);

export default LogOutIcon;
