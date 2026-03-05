import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ShareImageIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M18.986 2.998H4.996a1.999 1.999 0 00-1.998 1.998v13.99c0 1.104.895 1.999 1.998 1.999h13.99a1.999 1.999 0 001.999-1.999V4.996a1.999 1.999 0 00-1.999-1.998z"
        stroke="#9B7BFF"
        strokeWidth={1.99855}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.993 10.992a1.999 1.999 0 100-3.997 1.999 1.999 0 000 3.997zM20.985 14.99L17.9 11.904a1.999 1.999 0 00-2.826 0l-9.08 9.08"
        stroke="#9B7BFF"
        strokeWidth={1.99855}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ShareImageIcon
