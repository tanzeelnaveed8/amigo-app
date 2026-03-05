import * as React from "react"
import Svg, { Path } from "react-native-svg"

function QRCodeIcon(props) {
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
        d="M4.664 1.999h-2A.666.666 0 002 2.665v1.999c0 .368.298.666.666.666h1.999a.666.666 0 00.666-.666V2.665a.666.666 0 00-.666-.666zM13.325 1.999h-1.999a.666.666 0 00-.666.666v1.999c0 .368.299.666.666.666h2a.666.666 0 00.665-.666V2.665a.666.666 0 00-.666-.666zM4.664 10.66h-2a.666.666 0 00-.665.666v2c0 .367.298.665.666.665h1.999a.666.666 0 00.666-.666v-1.999a.666.666 0 00-.666-.666zM13.991 10.66h-1.998a1.333 1.333 0 00-1.333 1.333v1.998M13.991 13.992v.006M7.995 4.664v1.999a1.333 1.333 0 01-1.333 1.332H4.664M1.999 7.995h.006M7.995 1.999h.007M7.995 10.66v.007M10.66 7.995h.667M13.991 7.995v.007M7.995 13.992v-.667"
        stroke="#717182"
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default QRCodeIcon
