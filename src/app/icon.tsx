import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        color: "#fff",
        fontWeight: 800,
        fontSize: 20,
        fontFamily: "sans-serif",
        letterSpacing: "-1px",
      }}
    >
      U
    </div>,
    { ...size }
  );
}
