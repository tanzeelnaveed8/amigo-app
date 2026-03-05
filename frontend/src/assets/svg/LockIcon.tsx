import * as React from "react"
import Svg, { Path } from "react-native-svg"

function LockIcon(props) {
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
        d="M12.659 7.329H3.33c-.736 0-1.332.596-1.332 1.332v4.664c0 .736.596 1.333 1.332 1.333h9.328c.736 0 1.332-.597 1.332-1.333V8.661c0-.736-.596-1.332-1.332-1.332zM4.664 7.329V4.664a3.331 3.331 0 016.662 0v2.665"
        stroke={props.strokeColor || "orange"}
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default LockIcon
