import * as React from 'react';
import Svg, {Rect} from 'react-native-svg';

const CheckboxUnchecked = ({width = 20, height = 20}) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Rect
      x="0.5"
      y="0.5"
      width="19"
      height="19"
      rx="4.5"
      fill="transparent"
      stroke="rgba(255, 255, 255, 0.3)"
      strokeWidth="1"
    />
  </Svg>
);

export default CheckboxUnchecked;
