import * as React from "react"
import Svg, { Path } from "react-native-svg"

function FlagIcon(props: any) {
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
        d="M2.667 10s.666-.667 2.666-.667 3.333 1.334 5.333 1.334S13.333 10 13.333 10V2s-.667.667-2.667.667c-2 0-3.333-1.334-5.333-1.334S2.666 2 2.666 2v8zM2.667 14.667V10"
        stroke={props.strokeColor || "#717182"}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default FlagIcon
