import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function SvgComponent(props: any) {
  const {strokeColor = '#fff', ...restProps} = props;
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <Path
        d="M12.49 2.498h3.33a1.665 1.665 0 011.665 1.665V15.82a1.665 1.665 0 01-1.665 1.665h-3.33M8.326 14.155l4.163-4.163-4.163-4.164M12.49 9.992H2.497"
        stroke={strokeColor}
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
