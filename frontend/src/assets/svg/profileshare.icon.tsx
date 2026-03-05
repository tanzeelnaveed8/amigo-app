import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ProfileShareIcon = ({ size, color, rectColor, rectOpacity }: { size?: number, color?: string, rectColor?: string, rectOpacity?: string }) => (
    <SvgCss
        xml={`<svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_404_2725)">
        <rect width="38" height="38" rx="15" fill="${rectColor ?? 'white'}" fill-opacity="${rectOpacity ?? '0.25'}" shape-rendering="crispEdges"/>
        <path d="M25 29C24.1667 29 23.4583 28.7083 22.875 28.125C22.2917 27.5417 22 26.8333 22 26C22 25.8833 22.0083 25.7623 22.025 25.637C22.0417 25.5117 22.0667 25.3993 22.1 25.3L15.05 21.2C14.7667 21.45 14.45 21.646 14.1 21.788C13.75 21.93 13.3833 22.0007 13 22C12.1667 22 11.4583 21.7083 10.875 21.125C10.2917 20.5417 10 19.8333 10 19C10 18.1667 10.2917 17.4583 10.875 16.875C11.4583 16.2917 12.1667 16 13 16C13.3833 16 13.75 16.071 14.1 16.213C14.45 16.355 14.7667 16.5507 15.05 16.8L22.1 12.7C22.0667 12.6 22.0417 12.4877 22.025 12.363C22.0083 12.2383 22 12.1173 22 12C22 11.1667 22.2917 10.4583 22.875 9.875C23.4583 9.29167 24.1667 9 25 9C25.8333 9 26.5417 9.29167 27.125 9.875C27.7083 10.4583 28 11.1667 28 12C28 12.8333 27.7083 13.5417 27.125 14.125C26.5417 14.7083 25.8333 15 25 15C24.6167 15 24.25 14.9293 23.9 14.788C23.55 14.6467 23.2333 14.4507 22.95 14.2L15.9 18.3C15.9333 18.4 15.9583 18.5127 15.975 18.638C15.9917 18.7633 16 18.884 16 19C16 19.1167 15.9917 19.2377 15.975 19.363C15.9583 19.4883 15.9333 19.6007 15.9 19.7L22.95 23.8C23.2333 23.55 23.55 23.3543 23.9 23.213C24.25 23.0717 24.6167 23.0007 25 23C25.8333 23 26.5417 23.2917 27.125 23.875C27.7083 24.4583 28 25.1667 28 26C28 26.8333 27.7083 27.5417 27.125 28.125C26.5417 28.7083 25.8333 29 25 29Z" fill="${color ?? 'white'}"/>
        </g>
        <defs>
        <filter id="filter0_d_404_2725" x="0" y="0" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dx="5" dy="5"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_404_2725"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_404_2725" result="shape"/>
        </filter>
        </defs>
        </svg>
        

     `}
        height={size ?? 55}
        width={size ?? 55}
    />
);

export default ProfileShareIcon;
