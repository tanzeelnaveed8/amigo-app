import * as React from 'react';
import Svg, {G, Path} from 'react-native-svg';

function WhiteGhostIcon(props) {
  return (
    <Svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <G
        opacity={0.9}
        stroke={props.strokeColor ?? '#FFFFFF'}
        strokeWidth={6.66561}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M29.995 33.328h.034M49.992 33.328h.033M39.994 6.666A26.663 26.663 0 0013.33 33.328v39.994l9.999-9.999 8.332 8.332 8.332-8.332 8.332 8.332 8.332-8.332 9.998 9.999V33.328A26.662 26.662 0 0039.994 6.666z" />
      </G>
    </Svg>
  );
}

export default WhiteGhostIcon;
