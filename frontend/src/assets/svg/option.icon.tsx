import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const OptionIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_302_2967)">
        <rect x="4" width="40" height="40" rx="20" fill="#00A3FF"/>
        <circle cx="18" cy="14" r="4" fill="white"/>
        <circle cx="18" cy="26" r="4" fill="white"/>
        <circle cx="30" cy="14" r="4" fill="white"/>
        <circle cx="30" cy="26" r="4" fill="white"/>
        </g>
        <defs>
        <filter id="filter0_d_302_2967" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_302_2967"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_302_2967" result="shape"/>
        </filter>
        </defs>
        </svg>
                    
     `}
        height={size ?? 45}
        width={size ?? 60}
    />
);

export default OptionIcon;
