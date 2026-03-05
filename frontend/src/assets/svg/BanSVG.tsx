import * as React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

function BanSvg(props: any) {
  const {strokeColor = '#FF6363', ...restProps} = props;

  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <Circle
        cx={12}
        cy={12}
        r={10}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.9 4.9l14.2 14.2"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default BanSvg;
