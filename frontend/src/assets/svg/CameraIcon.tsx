import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CameraIcon(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M16.909 4.665h-5.83L8.162 8.163H4.665a2.332 2.332 0 00-2.333 2.332v10.496a2.332 2.332 0 002.333 2.332h18.658a2.332 2.332 0 002.332-2.332V10.495a2.332 2.332 0 00-2.332-2.332h-3.499L16.91 4.665z"
        stroke="#9B7BFF"
        strokeWidth={2.33228}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.994 18.658a3.498 3.498 0 100-6.997 3.498 3.498 0 000 6.997z"
        stroke="#9B7BFF"
        strokeWidth={2.33228}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default CameraIcon
