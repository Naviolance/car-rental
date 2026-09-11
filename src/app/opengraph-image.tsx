import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at request time from JSX rather than a static asset — no
// image file to keep in sync with the brand colors below if they ever
// change, and no binary to commit.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          backgroundColor: "#100c08",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <svg width="88" height="88" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#ff9408" />
            <path
              d="M8 21.5V19a2 2 0 0 1 1.5-1.94l1.2-3.3A2.5 2.5 0 0 1 13.05 12h5.9a2.5 2.5 0 0 1 2.35 1.76l1.2 3.3A2 2 0 0 1 24 19v2.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V21H10v.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1Z"
              fill="#100c08"
            />
            <circle cx="11.5" cy="20.5" r="1.6" fill="#ff9408" />
            <circle cx="20.5" cy="20.5" r="1.6" fill="#ff9408" />
          </svg>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: "#ff9408" }}>
            Car Rental
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#f3f4f5" }}>
          Browse the fleet. Book by the day. No hidden fees.
        </div>
      </div>
    ),
    { ...size }
  );
}
