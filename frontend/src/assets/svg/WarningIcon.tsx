import * as React from "react"
import Svg, { Path } from "react-native-svg"

function WarningIcon(props: any) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M28.972 24L18.306 5.332a2.667 2.667 0 00-4.64 0L3 24a2.666 2.666 0 002.333 4h21.332a2.666 2.666 0 002.307-4zM15.999 12v5.333M15.999 22.666h.013"
        stroke={props.strokeColor || "orange"}
        strokeWidth={2.66655}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default WarningIcon
