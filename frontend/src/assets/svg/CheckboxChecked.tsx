import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';

const CheckboxChecked = ({width = 20, height = 20}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Rect
      x="0.5"
      y="0.5"
      width="19"
      height="19"
      rx="4.5"
      fill="#9B7BFF"
      stroke="#9B7BFF"
    />
    <Path
      d="M15 6L8 13L5 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckboxChecked;
