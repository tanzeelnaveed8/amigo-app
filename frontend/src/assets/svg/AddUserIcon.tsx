import * as React from "react"
import Svg, { Path } from "react-native-svg"

function AddUserIcon(props) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M11.997 15.746v-1.5a3 3 0 00-3-2.999H4.5a3 3 0 00-3 3v1.5M6.748 8.248a3 3 0 100-5.998 3 3 0 000 5.998zM14.247 5.999v4.499M16.496 8.248h-4.499"
        stroke="#9B7BFF"
        strokeWidth={1.49966}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default AddUserIcon
