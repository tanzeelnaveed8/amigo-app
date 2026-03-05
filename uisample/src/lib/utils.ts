import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const THEME = {
  colors: {
    background: "#050509",
    backgroundAlt: "#070716",
    card: "#141422",
    cardAlt: "#181830",
    primary: "#9B7BFF",
    primaryStrong: "#B88DFF",
    textPrimary: "#FFFFFF",
    textSecondary: "#C5C6E3",
    textMuted: "#8B8CAD",
    border: "rgba(255,255,255,0.12)",
    input: "#0E0E18",
    bubbleOwn: "#7B5CFF",
    bubbleOther: "#1F2033",
    danger: "#FF6363",
    success: "#5BE7A9",
  },
  animation: {
    spring: {
      type: "spring",
      stiffness: 260,
      damping: 30,
      mass: 1,
    },
  },
};
