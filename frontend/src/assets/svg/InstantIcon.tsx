import * as React from "react"
import Svg, { Path } from "react-native-svg"

function InstantIcon(props) {
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
        d="M3.333 11.665a.832.832 0 01-.65-1.358l8.249-8.499a.417.417 0 01.716.383l-1.6 5.016a.833.833 0 00.784 1.125h5.832a.833.833 0 01.65 1.358l-8.248 8.5a.417.417 0 01-.717-.384l1.6-5.016a.834.834 0 00-.784-1.125H3.333z"
        fill={props.fill || "none"}
        stroke={props.strokeColor || "#9B7BFF"}
        strokeWidth={1.66645}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default InstantIcon
