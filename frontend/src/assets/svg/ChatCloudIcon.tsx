import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ChatCloudIcon(props) {
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
        d="M6.578 16.653a7.494 7.494 0 10-3.247-3.247l-1.666 4.912 4.913-1.665z"
        stroke="#fff"
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ChatCloudIcon
