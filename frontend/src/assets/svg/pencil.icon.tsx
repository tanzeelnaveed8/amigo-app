import * as React from 'react';
import Svg, { SvgCss } from 'react-native-svg/css';

const PencilIcon = ({ size, color }: { size?: number, color?: string }) => (
    <SvgCss
        xml={` <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.9457 6.42877L12.5273 2.05616L13.9828 0.59863C14.3813 0.199543 14.871 0 15.4518 0C16.0326 0 16.5219 0.199543 16.9197 0.59863L18.3752 2.05616C18.7737 2.45525 18.9816 2.93693 18.9989 3.50121C19.0162 4.06548 18.8257 4.54681 18.4271 4.94521L16.9457 6.42877ZM15.4382 7.96438L4.41835 19H0V14.5753L11.0199 3.53973L15.4382 7.96438Z" fill=${color ?? "white"}/>
        </svg>
        
                    
     `}
        height={size ?? 20}
        width={size ?? 20}
    />
);

export default PencilIcon;
