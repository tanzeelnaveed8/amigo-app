import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function RemoveUserIcon(props: any) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_43_401)"
        stroke={props.strokeColor || "#717182"}
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M10.66 13.991V12.66a2.665 2.665 0 00-2.665-2.665H3.998a2.665 2.665 0 00-2.665 2.665v1.332M5.996 7.329a2.665 2.665 0 100-5.33 2.665 2.665 0 000 5.33zM14.658 7.329H10.66" />
      </G>
      <Defs>
        <ClipPath id="clip0_43_401">
          <Path fill="#fff" d="M0 0H15.9902V15.9902H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default RemoveUserIcon
