import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ShareVideoIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={`<svg width="38" height="43" viewBox="0 0 38 43" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_12_120)">
        <path d="M29.0208 26.4339L29.1179 26.3639C30.7487 25.1864 31.5642 24.5976 32.2196 24.8819C32.8749 25.1662 32.8749 26.1086 32.8749 27.9934V29.0482C32.8749 30.9331 32.8749 31.8755 32.2196 32.1598C31.5642 32.4441 30.7487 31.8553 29.1179 30.6778L29.0208 30.6078M22.8541 33.9167H23.6249C26.1685 33.9167 27.4404 33.9167 28.2305 33.2252C29.0208 32.5338 29.0208 31.421 29.0208 29.1953V27.8464C29.0208 25.6207 29.0208 24.5079 28.2305 23.8164C27.4404 23.125 26.1685 23.125 23.6249 23.125H22.8541C20.3105 23.125 19.0386 23.125 18.2485 23.8164C17.4583 24.5079 17.4583 25.6207 17.4583 27.8464V29.1953C17.4583 31.421 17.4583 32.5338 18.2485 33.2252C19.0386 33.9167 20.3105 33.9167 22.8541 33.9167Z" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round"/>
        <path d="M31.3333 18.5219V12.0658C31.3333 9.45167 31.3333 8.14462 30.9202 7.1007C30.256 5.42247 28.8516 4.09868 27.0709 3.47274C25.9634 3.08337 24.5767 3.08337 21.8031 3.08337C16.9493 3.08337 14.5224 3.08337 12.5841 3.76476C9.46809 4.86018 7.01017 7.17678 5.84795 10.1137C5.125 11.9406 5.125 14.2279 5.125 18.8027V22.7324C5.125 27.471 5.125 29.8404 6.43187 31.4858C6.80631 31.9572 7.25037 32.3758 7.75057 32.7287C8.92257 33.5556 10.4408 33.8274 12.8333 33.9167" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5.125 18.5C5.125 15.662 7.42575 13.3612 10.2639 13.3612C11.2903 13.3612 12.5004 13.541 13.4984 13.2736C14.3851 13.036 15.0776 12.3434 15.3152 11.4567C15.5826 10.4588 15.4028 9.24868 15.4028 8.22226C15.4028 5.38413 17.7036 3.08337 20.5417 3.08337" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <defs>
        <filter id="filter0_d_12_120" x="-3.5" y="0" width="45" height="45" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_12_120"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_12_120" result="shape"/>
        </filter>
        </defs>
        </svg>
        
     `}
        height={size ?? 50}
        width={size ?? 50}
    />
);

export default ShareVideoIcon;
