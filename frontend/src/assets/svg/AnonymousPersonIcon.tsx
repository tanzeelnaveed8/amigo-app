import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function AnonymousPersonIcon(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_12_400)"
        stroke="#9B7BFF"
        strokeWidth={1.66645}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M13.332 17.498V15.83a3.333 3.333 0 00-3.333-3.333h-5a3.333 3.333 0 00-3.333 3.333v1.667M7.5 9.166a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zM14.165 6.666l4.166 4.166M18.331 6.666l-4.166 4.166" />
      </G>
      <Defs>
        <ClipPath id="clip0_12_400">
          <Path fill="#fff" d="M0 0H19.9975V19.9975H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default AnonymousPersonIcon
