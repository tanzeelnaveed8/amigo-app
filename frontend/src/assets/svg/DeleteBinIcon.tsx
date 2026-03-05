import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function DeleteBinIcon(props) {
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
        clipPath="url(#clip0_43_408)"
        stroke="#717182"
        strokeWidth={1.33252}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M1.999 3.998H13.99M12.659 3.998v9.327c0 .666-.667 1.333-1.333 1.333H4.664c-.667 0-1.333-.667-1.333-1.333V3.998M5.33 3.998V2.665c0-.666.666-1.332 1.333-1.332h2.665c.666 0 1.332.666 1.332 1.332v1.333M6.663 7.329v3.997M9.328 7.329v3.997" />
      </G>
      <Defs>
        <ClipPath id="clip0_43_408">
          <Path fill="#fff" d="M0 0H15.9902V15.9902H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default DeleteBinIcon
