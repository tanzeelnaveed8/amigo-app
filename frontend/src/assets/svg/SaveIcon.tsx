import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SaveIcon(props) {
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
        d="M17.5 12.5v3.333a1.666 1.666 0 01-1.667 1.667H4.167A1.667 1.667 0 012.5 15.833V12.5M5.833 8.334L10 12.5l4.167-4.166M10 12.5v-10"
        stroke="#fff"
        strokeWidth={1.66667}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SaveIcon
