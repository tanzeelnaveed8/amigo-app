import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function LeaveDoorIcon(props) {
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
        clipPath="url(#clip0_43_417)"
        stroke="#717182"
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M8.661 2.665h1.999a1.332 1.332 0 011.332 1.333v9.327M1.333 13.325H3.33M8.661 13.325h5.997M6.663 7.995v.007M8.661 3.04v10.764a.666.666 0 01-.827.646L3.33 13.325v-9.62a1.333 1.333 0 011.01-1.292l2.664-.666a1.333 1.333 0 011.656 1.292z" />
      </G>
      <Defs>
        <ClipPath id="clip0_43_417">
          <Path fill="#fff" d="M0 0H15.9902V15.9902H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default LeaveDoorIcon
