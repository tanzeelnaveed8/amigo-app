import * as React from "react"
import Svg, { Path } from "react-native-svg"

function RightArrowIcon(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M4.163 9.992H15.82M9.992 4.163l5.828 5.829-5.828 5.828"
        stroke="#fff"
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default RightArrowIcon
