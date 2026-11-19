import type { SVGProps } from "react";
const paths = {
  shield: "M12 3 4 6v5c0 5 4 8 8 10 4-2 8-5 8-10V6l-8-3Zm-4 9 3 3 5-6",
  overview: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  scan: "M4 9V4h5m6 0h5v5m0 6v5h-5M9 20H4v-5M4 12h16",
  reports: "M14 3H5v18h14V8l-5-5Zm0 0v6h5M8 13h8m-8 4h6",
  plus: "M12 5v14M5 12h14",
  search: "M21 21l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  close: "m6 6 12 12M6 18 18 6",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  refresh: "M20 7V3l-3 3a8 8 0 1 0 3 10M20 3h-5",
  bell: "M5 16h14l-2-3V9a5 5 0 0 0-10 0v4l-2 3Zm5 4h4",
  logout: "M9 4H4v16h5m6-13 5 5-5 5m-7-5h12",
  check: "m5 12 4 4L19 6",
  clock: "M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  info: "M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  alert: "m12 3 10 18H2L12 3Zm0 6v5m0 3h.01",
  globe:
    "M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Zm9 9a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  calendar: "M7 3v4m10-4v4M4 10h16M4 5h16v16H4z",
  play: "m9 5 11 7-11 7V5Z",
  pause: "M8 5v14M16 5v14",
  book: "M12 5v16M3 4l9 2 9-2v15l-9 2-9-2V4Z",
  mail: "M3 5h18v14H3zM3 5l9 8 9-8",
  lock: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5zM12 15v3",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
} as const;
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  size = 20,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
