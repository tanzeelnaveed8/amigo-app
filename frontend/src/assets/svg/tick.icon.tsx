import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const TickIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={` <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_331_2693)">
        <path d="M10.3667 12.2L14.9667 16.2L21.1 8.2M15.7333 23.4C14.3238 23.4 12.9281 23.1103 11.6259 22.5475C10.3236 21.9846 9.1404 21.1596 8.14372 20.1196C7.14704 19.0796 6.35643 17.8449 5.81703 16.4861C5.27763 15.1272 5 13.6708 5 12.2C5 10.7292 5.27763 9.27279 5.81703 7.91395C6.35643 6.5551 7.14704 5.32042 8.14372 4.2804C9.1404 3.24039 10.3236 2.4154 11.6259 1.85255C12.9281 1.2897 14.3238 1 15.7333 1C18.58 1 21.3101 2.18 23.3229 4.2804C25.3358 6.38081 26.4667 9.22958 26.4667 12.2C26.4667 15.1704 25.3358 18.0192 23.3229 20.1196C21.3101 22.22 18.58 23.4 15.7333 23.4Z" stroke=${color ?? "#EB5E5E"} stroke-width="2" shape-rendering="crispEdges"/>
        </g>
        <defs>
        <filter id="filter0_d_331_2693" x="0" y="0" width="31.4668" height="32.4004" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_331_2693"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_331_2693" result="shape"/>
        </filter>
        </defs>
        </svg>
            
     `}
        height={size ?? 30}
        width={size ?? 30}
    />
);

export default TickIcon;
