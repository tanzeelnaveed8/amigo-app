import * as React from "react"
import Svg, { Path } from "react-native-svg"

function PinIcon(props) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8 11.333v3.334M6 7.173a1.333 1.333 0 01-.74 1.194l-1.186.6a1.333 1.333 0 00-.74 1.193v.507a.667.667 0 00.666.666h8a.667.667 0 00.667-.666v-.507a1.332 1.332 0 00-.74-1.193l-1.187-.6A1.334 1.334 0 0110 7.173V4.667A.667.667 0 0110.667 4a1.333 1.333 0 100-2.667H5.334a1.333 1.333 0 000 2.667.667.667 0 01.666.667v2.506z"
        stroke="#9B7BFF"
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default PinIcon
