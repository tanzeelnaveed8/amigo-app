import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function InfoIcon(props) {
  const { stroke = "#9B7BFF", ...restProps } = props;
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <G
        clipPath="url(#clip0_1_208)"
        stroke={stroke}
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M7.995 14.658a6.663 6.663 0 100-13.326 6.663 6.663 0 000 13.326zM7.995 10.66V7.995M7.995 5.33h.007" />
      </G>
      <Defs>
        <ClipPath id="clip0_1_208">
          <Path fill="#fff" d="M0 0H15.9902V15.9902H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default InfoIcon
