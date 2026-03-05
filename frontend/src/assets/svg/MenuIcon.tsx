import * as React from "react"
import Svg, { Path } from "react-native-svg"

function MenuIcon(props) {
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
        d="M9.992 10.824a.833.833 0 100-1.665.833.833 0 000 1.665zM9.992 4.996a.833.833 0 100-1.665.833.833 0 000 1.665zM9.992 16.653a.833.833 0 100-1.666.833.833 0 000 1.666z"
        stroke="#fff"
        strokeOpacity={0.8}
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default MenuIcon
