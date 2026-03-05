import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SettingsIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12.217 2h-.44a2 2 0 00-2 2v.179a2 2 0 01-1 1.73l-.429.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.729.73l-.22.38a2 2 0 00.73 2.729l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.739l-.15.09a2 2 0 00-.73 2.73l.22.379a2 2 0 002.73.73l.15-.08a2 2 0 011.999 0l.43.25a2 2 0 011 1.73v.18a2 2 0 002 1.999h.44a2 2 0 001.999-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 011.999 0l.15.08a1.999 1.999 0 002.73-.729l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.739v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.729l-.22-.38a2 2 0 00-2.73-.73l-.15.08a1.999 1.999 0 01-2 0l-.43-.25a2 2 0 01-1-1.729v-.18a2 2 0 00-1.999-2z"
        stroke="#8B8CAD"
        strokeWidth={1.99953}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.997 14.996a3 3 0 100-5.998 3 3 0 000 5.998z"
        stroke="#8B8CAD"
        strokeWidth={1.99953}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SettingsIcon
