import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AddIcon(props) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M13.994 25.655c6.44 0 11.661-5.22 11.661-11.661 0-6.44-5.22-11.662-11.661-11.662-6.44 0-11.662 5.221-11.662 11.662 0 6.44 5.221 11.661 11.662 11.661zM9.33 13.994h9.328M13.994 9.33v9.328"
        stroke="#9B7BFF"
        strokeWidth={2.33228}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default AddIcon
