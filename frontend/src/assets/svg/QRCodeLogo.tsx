import * as React from "react"
import Svg, { G, Mask, Path, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function QRCodeLogo(props: any) {
  return (
    <Svg
      width={76}
      height={76}
      viewBox="0 0 76 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_dd_171_33)">
        <Mask id="a" fill="#fff">
          <Path d="M12 27.864C12 13.58 23.58 2 37.864 2 52.15 2 63.728 13.58 63.728 27.864c0 14.285-11.58 25.864-25.864 25.864S12 42.148 12 27.864z" />
        </Mask>
        <Path
          d="M12 27.864C12 13.58 23.58 2 37.864 2 52.15 2 63.728 13.58 63.728 27.864c0 14.285-11.58 25.864-25.864 25.864S12 42.148 12 27.864z"
          fill="#0A0A14"
          shapeRendering="crispEdges"
        />
        <Path
          d="M37.864 53.728v-1.875c-13.249 0-23.989-10.74-23.989-23.989h-3.75c0 15.32 12.42 27.74 27.74 27.74v-1.876zm25.864-25.864h-1.875c0 13.25-10.74 23.99-23.989 23.99v3.749c15.32 0 27.74-12.419 27.74-27.739h-1.876zM37.864 2v1.875c13.25 0 23.99 10.74 23.99 23.99h3.749c0-15.32-12.419-27.74-27.739-27.74V2zm0 0V.125c-15.32 0-27.739 12.42-27.739 27.74h3.75c0-13.25 10.74-23.99 23.99-23.99V2z"
          fill="#9B7BFF"
          mask="url(#a)"
        />
        <Path d="M34.865 25.865h.01-.01z" fill="#9B7BFF" />
        <Path
          d="M34.865 25.865h.01"
          stroke="#9B7BFF"
          strokeWidth={2.49939}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M40.863 25.865h.01-.01z" fill="#9B7BFF" />
        <Path
          d="M40.863 25.865h.01"
          stroke="#9B7BFF"
          strokeWidth={2.49939}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M37.864 17.867a7.998 7.998 0 00-7.998 7.998v11.997l3-3 2.499 2.5 2.5-2.5 2.499 2.5 2.499-2.5 3 3V25.865a7.998 7.998 0 00-7.999-7.998z"
          fill="#9B7BFF"
          stroke="#9B7BFF"
          strokeWidth={2.49939}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs></Defs>
    </Svg>
  )
}

export default QRCodeLogo
