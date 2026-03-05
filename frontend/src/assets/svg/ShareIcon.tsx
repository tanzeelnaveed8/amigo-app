import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ShareIcon(props) {
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
        d="M14.987 6.661a2.498 2.498 0 100-4.996 2.498 2.498 0 000 4.996zM4.996 12.49a2.498 2.498 0 100-4.996 2.498 2.498 0 000 4.995zM14.987 18.318a2.498 2.498 0 100-4.996 2.498 2.498 0 000 4.996zM7.152 11.249l5.687 3.314M12.83 5.42L7.153 8.734"
        stroke="#fff"
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ShareIcon
