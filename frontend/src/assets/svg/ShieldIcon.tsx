import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const ShieldIcon = ({width = 24, height = 24, color = '#FFFFFF'}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ShieldIcon;
