import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ProfileImageIcon = ({ size, color, rectColor, rectOpacity }: { size?: number, color?: string, rectColor?: string, rectOpacity?: string }) => (
    <SvgCss
        xml={`<svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_404_2722)">
        <rect width="38" height="38" rx="15" fill="${rectColor ?? 'white'}" fill-opacity="${rectOpacity ?? '0.25'}" shape-rendering="crispEdges"/>
        <path d="M12 28C11.45 28 10.979 27.804 10.587 27.412C10.195 27.02 9.99934 26.5493 10 26V12C10 11.45 10.196 10.979 10.588 10.587C10.98 10.195 11.4507 9.99934 12 10H26C26.55 10 27.021 10.196 27.413 10.588C27.805 10.98 28.0007 11.4507 28 12V26C28 26.55 27.804 27.021 27.412 27.413C27.02 27.805 26.5493 28.0007 26 28H12ZM13 24H25L21.25 19L18.25 23L16 20L13 24Z" fill="${color ?? 'white'}"/>
        </g>
        <defs>
        <filter id="filter0_d_404_2722" x="0" y="0" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="5" dy="5"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_404_2722"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_404_2722" result="shape"/>
        </filter>
        </defs>
        </svg>
        

     `}
        height={size ?? 55}
        width={size ?? 55}
    />
);

export default ProfileImageIcon;
