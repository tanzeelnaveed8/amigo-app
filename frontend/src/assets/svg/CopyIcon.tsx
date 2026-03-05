import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function CopyIcon(props: any) {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_166_156)"
        stroke={props.strokeColor || "#9B7BFF"}
        strokeWidth={1.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M13.334 5.333H6.667c-.737 0-1.333.597-1.333 1.334v6.666c0 .737.596 1.334 1.333 1.334h6.667c.736 0 1.333-.597 1.333-1.334V6.667c0-.737-.597-1.334-1.333-1.334z" />
        <Path d="M2.667 10.667c-.733 0-1.333-.6-1.333-1.334V2.667c0-.734.6-1.334 1.333-1.334h6.667c.733 0 1.333.6 1.333 1.334" />
      </G>
      <Defs>
        <ClipPath id="clip0_166_156">
          <Path fill="#fff" d="M0 0H16V16H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default CopyIcon
