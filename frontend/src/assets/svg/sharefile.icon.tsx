import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ShareFileIcon(props: any) {
  const { color = "#9B7BFF", ...restProps } = props;
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
    >
      <Path
        d="M14.99 1.999H5.995a1.999 1.999 0 00-1.999 1.998v15.988a1.998 1.998 0 001.999 2h11.991a1.998 1.998 0 001.998-2V6.995L14.99 1.999z"
        stroke={color}
        strokeWidth={1.99855}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.99 1.999v3.997a1.999 1.999 0 001.998 1.998h3.998M9.993 8.994H7.994M15.988 12.99H7.994M15.988 16.988H7.994"
        stroke={color}
        strokeWidth={1.99855}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ShareFileIcon
