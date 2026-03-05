import * as React from "react"
import Svg, { Path } from "react-native-svg"

function BackButtonIcon(props) {
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
        d="M17.492 20.99l-6.997-6.996 6.997-6.997"
        stroke="#C5C6E3"
        strokeWidth={2.33228}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default BackButtonIcon
