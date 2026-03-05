import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ContactIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_310_3073)">
        <g clip-path="url(#clip0_310_3073)">
        <g filter="url(#filter1_d_310_3073)">
        <ellipse cx="23.8933" cy="20.9883" rx="19.8933" ry="19.501" fill="#9B7BFF"/>
        </g>
        <path d="M26.8112 21.0732C31.4812 21.9291 33.4162 24.226 33.4162 24.226C34.2179 25.5771 33.4162 27.4356 33.4162 27.4356C30.7079 30.7148 26.5987 31.0593 24.0021 31.0593C21.4062 31.0593 17.2971 30.7148 14.5887 27.4356C14.5887 27.4356 13.7871 25.5771 14.5887 24.226C14.5887 24.226 16.5237 21.9299 21.1937 21.0732" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24.0021 21.9303C27.0581 21.9303 29.5354 19.1634 29.5354 15.7503C29.5354 12.3372 27.0581 9.57031 24.0021 9.57031C20.9461 9.57031 18.4688 12.3372 18.4688 15.7503C18.4688 19.1634 20.9461 21.9303 24.0021 21.9303Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        </g>
        <defs>
        <filter id="filter0_d_310_3073" x="0" y="0.862305" width="48" height="46.9033" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_310_3073"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_310_3073" result="shape"/>
        </filter>
        <filter id="filter1_d_310_3073" x="0" y="1.4873" width="47.7871" height="47.002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_310_3073"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_310_3073" result="shape"/>
        </filter>
        <clipPath id="clip0_310_3073">
        <path d="M4 20.8623C4 9.81662 12.9543 0.862305 24 0.862305C35.0457 0.862305 44 9.81661 44 20.8623V39.7658H4V20.8623Z" fill="white"/>
        </clipPath>
        </defs>
        </svg>
         `}
        height={size ?? 60}
        width={size ?? 60}
    />
);

export default ContactIcon;
