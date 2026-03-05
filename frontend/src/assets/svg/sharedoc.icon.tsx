import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ShareDocIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={`<svg width="38" height="43" viewBox="0 0 38 43" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_653_1450)">
        <path d="M20.541 3.08301H20.9614C25.9891 3.08301 28.503 3.08301 30.2487 4.31301C30.749 4.66542 31.193 5.08335 31.5675 5.55413C32.8743 7.19721 32.8743 9.56319 32.8743 14.2951V18.2194C32.8743 22.7877 32.8743 25.0716 32.1515 26.8959C30.9892 29.8288 28.5313 32.142 25.4151 33.2358C23.477 33.9163 21.0501 33.9163 16.1963 33.9163C13.4228 33.9163 12.036 33.9163 10.9284 33.5275C9.14778 32.9025 7.74326 31.5806 7.07912 29.9048C6.66602 28.8623 6.66602 27.5571 6.66602 24.9466V18.4997" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/>
        </g>
        <g filter="url(#filter1_d_653_1450)">
        <path d="M32.8756 18.5C32.8756 21.3381 30.5749 23.6388 27.7368 23.6388C26.7104 23.6388 25.5003 23.4591 24.5022 23.7264C23.6156 23.964 22.923 24.6566 22.6854 25.5433C22.4181 26.5413 22.5978 27.7514 22.5978 28.7778C22.5978 31.6159 20.297 33.9167 17.459 33.9167" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"/>
        </g>
        <g filter="url(#filter2_d_653_1450)">
        <path d="M17.4583 9.24967H5.125M11.2917 3.08301V15.4163" stroke=${color ?? "white"} stroke-width="1.5" stroke-linecap="round" shape-rendering="crispEdges"/>
        </g>
        <defs>
        <filter id="filter0_d_653_1450" x="1.91602" y="2.33301" width="35.709" height="40.333" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_653_1450"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_653_1450" result="shape"/>
        </filter>
        <filter id="filter1_d_653_1450" x="12.709" y="17.75" width="24.916" height="24.917" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_653_1450"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_653_1450" result="shape"/>
        </filter>
        <filter id="filter2_d_653_1450" x="0.375" y="2.33301" width="21.834" height="21.833" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_653_1450"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_653_1450" result="shape"/>
        </filter>
        </defs>
        </svg>
        
        
     `}
        height={size ?? 50}
        width={size ?? 50}
    />
);

export default ShareDocIcon;
