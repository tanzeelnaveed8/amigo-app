import * as React from "react"
import Svg, { Path } from "react-native-svg"

function GhostIcon(props: any) {
  return (
    <Svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M44.996 49.996h.05M74.994 49.996h.05M59.995 10a39.997 39.997 0 00-39.997 39.996v59.995l15-14.999 12.498 12.499 12.499-12.499 12.499 12.499 12.499-12.499 14.999 14.999V49.996A39.997 39.997 0 0059.995 9.999z"
        stroke={props.strokeColor || "#9B7BFF"}
        strokeWidth={9.99917}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default GhostIcon
