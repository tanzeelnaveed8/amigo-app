import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function UnlockIcon(props) {
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
        clipPath="url(#clip0_43_379)"
        stroke="#717182"
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M12.659 7.329H3.33c-.736 0-1.332.596-1.332 1.332v4.664c0 .736.596 1.333 1.332 1.333h9.328c.736 0 1.332-.597 1.332-1.333V8.661c0-.736-.596-1.332-1.332-1.332zM4.664 7.329V4.664a3.331 3.331 0 016.595-.666" />
      </G>
      <Defs>
        <ClipPath id="clip0_43_379">
          <Path fill="#fff" d="M0 0H15.9902V15.9902H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default UnlockIcon
