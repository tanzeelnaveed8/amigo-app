import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const ShareIcon = ({ size, color, colorIcon }: { size?: number, color?: string, colorIcon?: string }) => (
    <SvgCss
        xml={`<svg width="48" height="47" viewBox="0 0 48 47" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_1_53)">
        <ellipse cx="23.8933" cy="19.501" rx="19.8933" ry="19.501" fill=${color ?? "#9B7BFF"}/>
        </g>
        <path d="M28.5474 23.7982C27.4933 23.7982 26.5436 24.2534 25.8845 24.9775L19.956 21.3057C20.1187 20.8896 20.2022 20.4467 20.202 20C20.2022 19.5532 20.1188 19.1103 19.956 18.6943L25.8845 15.0223C26.5436 15.7464 27.4933 16.2018 28.5474 16.2018C30.533 16.2018 32.1483 14.5864 32.1483 12.6008C32.1483 10.6152 30.533 9 28.5474 9C26.5618 9 24.9464 10.6154 24.9464 12.601C24.9463 13.0477 25.0298 13.4906 25.1924 13.9066L19.2641 17.5785C18.605 16.8544 17.6553 16.399 16.6012 16.399C14.6156 16.399 13.0003 18.0145 13.0003 20C13.0003 21.9856 14.6156 23.601 16.6012 23.601C17.6553 23.601 18.605 23.1458 19.2641 22.4215L25.1925 26.0933C25.0298 26.5095 24.9463 26.9523 24.9464 27.3991C24.9464 29.3846 26.5617 31 28.5474 31C30.533 31 32.1483 29.3846 32.1483 27.3992C32.1483 25.4135 30.533 23.7982 28.5474 23.7982ZM26.2594 12.601C26.2594 11.3394 27.2858 10.3131 28.5474 10.3131C29.8089 10.3131 30.8353 11.3394 30.8353 12.601C30.8353 13.8626 29.8089 14.8889 28.5474 14.8889C27.2858 14.8889 26.2594 13.8625 26.2594 12.601ZM16.6012 22.2879C15.3395 22.2879 14.3132 21.2615 14.3132 20C14.3132 18.7385 15.3395 17.7121 16.6012 17.7121C17.8628 17.7121 18.889 18.7385 18.889 20C18.889 21.2615 17.8628 22.2879 16.6012 22.2879ZM26.2594 27.399C26.2594 26.1375 27.2858 25.1111 28.5474 25.1111C29.8089 25.1111 30.8353 26.1375 30.8353 27.399C30.8353 28.6605 29.8089 29.6869 28.5474 29.6869C27.2858 29.6869 26.2594 28.6605 26.2594 27.399V27.399Z" fill=${colorIcon ?? "white"}/>
        <defs>
        <filter id="filter0_d_1_53" x="0" y="0" width="47.7867" height="47.002" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_53"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_53" result="shape"/>
        </filter>
        </defs>
        </svg>
        
        
     `}
        height={size ?? 60}
        width={size ?? 60}
    />
);

export default ShareIcon;
