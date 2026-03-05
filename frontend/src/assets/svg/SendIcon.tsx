import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SendIcon(props) {
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
        d="M12.103 18.056a.416.416 0 00.78-.02l5.413-15.82a.413.413 0 00-.53-.528L1.947 7.1a.416.416 0 00-.02.78l6.604 2.648a1.666 1.666 0 01.925.924l2.648 6.604zM18.196 1.788l-9.109 9.108"
        stroke="#fff"
        strokeWidth={1.66527}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SendIcon
