import * as React from "react"
import Svg, { Path } from "react-native-svg"

function RandomIcon(props) {
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
        d="M12.659 1.999H3.33C2.595 1.999 2 2.595 2 3.33v9.328c0 .736.596 1.332 1.332 1.332h9.328c.736 0 1.332-.596 1.332-1.332V3.33c0-.736-.596-1.332-1.332-1.332zM10.66 5.33h.007M5.33 5.33h.007M5.33 10.66h.007M10.66 10.66h.007M7.995 7.995h.007"
        stroke="#9B7BFF"
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default RandomIcon
