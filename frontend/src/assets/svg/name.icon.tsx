import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const NameIcon = ({ size }: { size?: number }) => (
    <SvgCss
        xml={` <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.8189 11.1445C15.6717 11.8705 17.268 13.8189 17.268 13.8189C17.9294 14.965 17.268 16.5414 17.268 16.5414C15.0337 19.323 11.6436 19.6152 9.50135 19.6152C7.35979 19.6152 3.96973 19.323 1.73535 16.5414C1.73535 16.5414 1.07398 14.965 1.73535 13.8189C1.73535 13.8189 3.33173 11.8712 7.18448 11.1445" stroke="#9B7BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.50055 11.8711C12.0217 11.8711 14.0655 9.52409 14.0655 6.62891C14.0655 3.73373 12.0217 1.38672 9.50055 1.38672C6.97937 1.38672 4.93555 3.73373 4.93555 6.62891C4.93555 9.52409 6.97937 11.8711 9.50055 11.8711Z" stroke="#9B7BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        
        
         `}
        height={size ?? 20}
        width={size ?? 20}
    />
);

export default NameIcon;
