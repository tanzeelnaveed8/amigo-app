import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';

function MailSvg(props: any) {
  const {strokeColor = '#fff', ...restProps} = props;

  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}>
      <Rect
        x={2}
        y={4}
        width={20}
        height={16}
        rx={2}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default MailSvg;
