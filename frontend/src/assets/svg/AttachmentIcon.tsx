import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AttachmentIcon(props) {
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
        d="M15.833 9.167v4.166a5 5 0 01-5 5h-1.666a5 5 0 01-5-5V5.833a3.333 3.333 0 016.666 0v5a1.667 1.667 0 11-3.333 0V6.667"
        stroke={props.color || "#9B7BFF"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default AttachmentIcon





