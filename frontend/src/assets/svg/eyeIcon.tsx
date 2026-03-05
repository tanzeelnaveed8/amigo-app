import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface props {
  size?: number;
  color?: string;
}
function EyeIcon(props: props) {
  const { size, color } = props;
  return (
    <Svg
      width={size ?? 24}
      height={size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      {...props}>
      <Path
        d="M23.271 9.419c-1.55-2.526-5.079-6.764-11.27-6.764-6.193 0-9.72 4.238-11.272 6.764a4.908 4.908 0 000 5.162C2.28 17.107 5.808 21.345 12 21.345c6.192 0 9.72-4.238 11.271-6.764a4.908 4.908 0 000-5.162zm-1.705 4.115C20.234 15.7 17.219 19.345 12 19.345S3.766 15.7 2.434 13.534a2.918 2.918 0 010-3.068C3.766 8.3 6.781 4.655 12 4.655s8.234 3.641 9.566 5.811a2.918 2.918 0 010 3.068z"
        fill={color ?? 'white'}
      />
      <Path
        d="M12 7a5 5 0 105 5 5.006 5.006 0 00-5-5zm0 8a3 3 0 110-5.999A3 3 0 0112 15z"
        fill={color ?? 'white'}
      />
    </Svg>
  );
}

export default EyeIcon;
