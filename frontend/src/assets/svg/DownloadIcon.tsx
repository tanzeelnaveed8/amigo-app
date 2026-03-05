import * as React from "react"
import Svg, { Path } from "react-native-svg"

function DownloadIcon(props) {
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
        d="M10 13.333V3.333M10 13.333L6.667 10M10 13.333L13.333 10M3.333 16.667h13.334"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default DownloadIcon

