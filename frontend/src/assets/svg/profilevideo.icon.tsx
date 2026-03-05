import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ProfileVideoIcon = ({ size, color, rectColor, rectOpacity }: { size?: number, color?: string, rectColor?: string, rectOpacity?: string }) => (
    <SvgCss
        xml={`<svg width="46" height="48" viewBox="0 0 46 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_365_4130)">
        <rect width="38" height="38" rx="15" fill="${rectColor ?? 'white'}" fill-opacity="${rectOpacity ?? '0.25'}" shape-rendering="crispEdges"/>
        <path d="M21.875 14.4286C21.875 13.5193 21.5194 12.6472 20.8865 12.0042C20.2535 11.3612 19.3951 11 18.5 11H11.375C10.4799 11 9.62145 11.3612 8.98851 12.0042C8.35558 12.6472 8 13.5193 8 14.4286V23.5714C8 24.4807 8.35558 25.3528 8.98851 25.9958C9.62145 26.6388 10.4799 27 11.375 27H18.5C19.3951 27 20.2535 26.6388 20.8865 25.9958C21.5194 25.3528 21.875 24.4807 21.875 23.5714V14.4286ZM23 21.8952L26.7598 24.76C27.6823 25.4632 29 24.7943 29 23.6225V14.3783C29 13.2057 27.683 12.5368 26.7598 13.24L23 16.1048V21.8952Z" fill="${color ?? '#F9F9F9'}"/>
        </g>
        <defs>
        <filter id="filter0_d_365_4130" x="0" y="0" width="46" height="48" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="4" dy="6"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_365_4130"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_365_4130" result="shape"/>
        </filter>
        </defs>
        </svg>
        
        `}
        height={size ?? 55}
        width={size ?? 55}
    />
);

export default ProfileVideoIcon;
