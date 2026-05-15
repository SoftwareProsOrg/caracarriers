import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2563eb",
          width: 32,
          height: 32,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 18-wheeler side-view silhouette */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="18"
          viewBox="0 0 26 18"
          fill="white"
        >
          {/* Trailer body */}
          <rect x="0" y="0" width="16" height="10" rx="1.5" />
          {/* Cab/tractor */}
          <path d="M16 3.5 L16 11 L25 11 L25 6.5 L22 3.5 Z" />
          {/* Cab windshield */}
          <rect
            x="17.5"
            y="4.5"
            width="4.5"
            height="3.5"
            rx="0.6"
            fill="#1e3a8a"
            opacity="0.85"
          />
          {/* Fifth-wheel coupler */}
          <rect x="14.5" y="9.5" width="2.5" height="1.5" fill="#93c5fd" />
          {/* Exhaust stack */}
          <rect x="22.5" y="1" width="1.2" height="3" rx="0.5" />
          {/* Trailer axle wheels */}
          <circle cx="4" cy="13.5" r="2.5" />
          <circle cx="4" cy="13.5" r="1.1" fill="#2563eb" />
          <circle cx="10.5" cy="13.5" r="2.5" />
          <circle cx="10.5" cy="13.5" r="1.1" fill="#2563eb" />
          {/* Drive axle wheels */}
          <circle cx="18.5" cy="13.5" r="2.5" />
          <circle cx="18.5" cy="13.5" r="1.1" fill="#2563eb" />
          {/* Steer axle wheel */}
          <circle cx="23.5" cy="13.5" r="2" />
          <circle cx="23.5" cy="13.5" r="0.85" fill="#2563eb" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
