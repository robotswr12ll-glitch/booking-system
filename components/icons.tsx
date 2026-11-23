import type { SVGProps } from "react";

export type IconName =
  | "Basketball"
  | "Football"
  | "Tennis"
  | "Badminton"
  | "Swimming"
  | "Clock"
  | "Calendar"
  | "User"
  | "Check"
  | "X";

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...shared} {...props}>
      {name === "Basketball" && (
        <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M5 5c4 3 10 3 14 0M5 19c4-3 10-3 14 0" /></>
      )}
      {name === "Football" && (
        <><circle cx="12" cy="12" r="9" /><path d="m12 8 3 2-1 4h-4l-1-4 3-2ZM12 3v5M9 10 5 8M10 14l-3 4M14 14l3 4M15 10l4-2M4 16l3 2M20 16l-3 2" /></>
      )}
      {name === "Tennis" && (
        <><circle cx="9" cy="9" r="6" /><path d="m14 14 6 6M17 17l-2 2M4 9h10M9 4v10" /></>
      )}
      {name === "Badminton" && (
        <><ellipse cx="9" cy="7" rx="5" ry="6" transform="rotate(-35 9 7)" /><path d="m12 12 7 8M15 16l-3 2M6 3l5 8M3 8l9-1M18 4l2-2M18 4l-1 5M18 4l4 2M18 4l-4-1" /></>
      )}
      {name === "Swimming" && (
        <><circle cx="16" cy="5" r="2" /><path d="m3 12 4-3 4 3 3-2 4 2M3 16c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 3 1M3 20c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 3 1" /></>
      )}
      {name === "Clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
      {name === "Calendar" && <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 3v4M17 3v4M3 10h18" /></>}
      {name === "User" && <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3-7 8-7s8 3 8 7" /></>}
      {name === "Check" && <path d="m5 12 4 4L19 6" />}
      {name === "X" && <path d="m6 6 12 12M18 6 6 18" />}
    </svg>
  );
}
