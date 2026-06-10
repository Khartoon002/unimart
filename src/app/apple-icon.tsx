import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
        fontSize: 96,
        fontFamily: "sans-serif",
        letterSpacing: "-4px",
      }}
    >
      U
    </div>,
    { ...size }
  );
}
