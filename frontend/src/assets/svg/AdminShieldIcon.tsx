import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function AdminShieldIcon(props: any) {
  return (
    <Svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_43_371)">
        <Path
          d="M11.662 7.58c0 2.915-2.041 4.373-4.467 5.218a.583.583 0 01-.39-.005c-2.432-.84-4.472-2.298-4.472-5.213V3.498a.583.583 0 01.583-.583c1.166 0 2.623-.7 3.638-1.586a.682.682 0 01.886 0c1.02.893 2.472 1.586 3.639 1.586a.583.583 0 01.583.583V7.58z"
          stroke={props.strokeColor || "#8B8CAD"}
          strokeWidth={1.16614}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_43_371">
          <Path fill="#fff" d="M0 0H13.9937V13.9937H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default AdminShieldIcon
