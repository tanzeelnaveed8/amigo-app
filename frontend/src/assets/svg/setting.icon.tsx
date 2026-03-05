import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const SettingIcon = ({ sizeh, sizew, color }: { sizeh?: number, sizew?: number, color?: string }) => (
    <SvgCss
        xml={`<svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_302_2974)">
        <path d="M5 3H14M18 3H21M12 11H21M5 11H8" stroke="${color ?? 'white'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 13C11.1046 13 12 12.1046 12 11C12 9.89543 11.1046 9 10 9C8.89543 9 8 9.89543 8 11C8 12.1046 8.89543 13 10 13Z" stroke="${color ?? 'white'}" stroke-width="2"/>
        <path d="M16 5C17.1046 5 18 4.10457 18 3C18 1.89543 17.1046 1 16 1C14.8954 1 14 1.89543 14 3C14 4.10457 14.8954 5 16 5Z" stroke="${color ?? 'white'}" stroke-width="2"/>
        </g>
        <defs>
        <filter id="filter0_d_302_2974" x="0" y="0" width="26" height="22" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_302_2974"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_302_2974" result="shape"/>
        </filter>
        </defs>
        </svg>         
     `}
        height={sizeh ?? 26}
        width={sizew ?? 25}
    />
);

export default SettingIcon;
