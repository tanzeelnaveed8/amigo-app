import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function ClockIcon(props: any) {
  const { strokeColor = "#9B7BFF", ...restProps } = props;
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <G
        clipPath="url(#clip0_12_413)"
        stroke={strokeColor}
        strokeWidth={1.66645}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M9.999 18.331a8.332 8.332 0 100-16.665 8.332 8.332 0 000 16.665z" />
        <Path d="M9.999 5v4.999l3.333 1.666" />
      </G>
      <Defs>
        <ClipPath id="clip0_12_413">
          <Path fill="#fff" d="M0 0H19.9975V19.9975H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default ClockIcon
