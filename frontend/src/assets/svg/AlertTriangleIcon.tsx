import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const AlertTriangleIcon = ({width = 24, height = 24, color = '#FFFFFF'}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55298 18.6453 1.55199 18.9945C1.55101 19.3437 1.64145 19.6871 1.81442 19.9905C1.98738 20.2939 2.23674 20.5467 2.53771 20.7239C2.83868 20.9011 3.18 20.9962 3.53 21H20.46C20.81 20.9962 21.1513 20.9011 21.4523 20.7239C21.7533 20.5467 22.0026 20.2939 22.1756 19.9905C22.3486 19.6871 22.439 19.3437 22.438 18.9945C22.437 18.6453 22.3446 18.3024 22.17 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.981 3.15448C12.6812 2.98585 12.3432 2.89725 12 2.89725C11.6568 2.89725 11.3188 2.98585 11.019 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9V13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 17H12.01"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AlertTriangleIcon;
