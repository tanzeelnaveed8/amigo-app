import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ShareSongIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={`<svg width="40" height="42" viewBox="0 0 40 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_653_1599)">
        <path d="M5.35352 18.5003C5.35352 11.5962 5.35352 8.14416 7.49834 5.99932C9.64319 3.85449 13.0952 3.85449 19.9993 3.85449C26.9034 3.85449 30.3555 3.85449 32.5004 5.99932C34.6452 8.14416 34.6452 11.5962 34.6452 18.5003C34.6452 25.4044 34.6452 28.8565 32.5004 31.0014C30.3555 33.1462 26.9034 33.1462 19.9993 33.1462C13.0952 33.1462 9.64319 33.1462 7.49834 31.0014C5.35352 28.8565 5.35352 25.4044 5.35352 18.5003Z" stroke=${color ?? "white"} stroke-width="1.5"/>
        <path d="M21.5423 22.3545C21.5423 24.4831 19.8167 26.2087 17.6882 26.2087C15.5596 26.2087 13.834 24.4831 13.834 22.3545C13.834 20.2259 15.5596 18.5003 17.6882 18.5003C19.8167 18.5003 21.5423 20.2259 21.5423 22.3545ZM21.5423 22.3545V10.792C22.0562 11.5628 22.4673 14.8003 26.1673 15.417" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <defs>
        <filter id="filter0_d_653_1599" x="-2.5" y="0" width="45" height="45" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_653_1599"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_653_1599" result="shape"/>
        </filter>
        </defs>
        </svg>
        
     `}
        height={size ?? 50}
        width={size ?? 50}
    />
);

export default ShareSongIcon;
