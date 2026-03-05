import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function UserGroupIcon(props) {
  return (
    <Svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_1_162)"
        stroke="#8B8CAD"
        strokeWidth={0.831878}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M6.655 8.735v-.832A1.664 1.664 0 004.99 6.239H2.496A1.664 1.664 0 00.832 7.903v.832M3.743 4.575a1.664 1.664 0 100-3.327 1.664 1.664 0 000 3.327zM9.15 8.735v-.832a1.664 1.664 0 00-1.247-1.61M6.655 1.302a1.664 1.664 0 010 3.223" />
      </G>
      <Defs>
        <ClipPath id="clip0_1_162">
          <Path fill="#fff" d="M0 0H9.98253V9.98253H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default UserGroupIcon
