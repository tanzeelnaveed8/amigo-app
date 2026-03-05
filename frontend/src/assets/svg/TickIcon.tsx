import * as React from "react"
import Svg, { Path } from "react-native-svg"

function TickIcon(props) {
  const { stroke = "#9B7BFF", ...restProps } = props;
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <Path
        d="M25.423 11.662a11.661 11.661 0 11-5.599-7.773M10.495 12.828l3.499 3.498L25.655 4.665"
        stroke={stroke}
        strokeWidth={2.33228}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default TickIcon
