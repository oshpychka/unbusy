import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function ogImage(title: string, kicker: string) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f4f3ef",
        backgroundImage:
          "radial-gradient(circle, #c4c0b5 1.5px, transparent 1.6px)",
        backgroundSize: "24px 24px",
        color: "#15171a",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "#15171a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#ffc21a",
            }}
          />
        </div>
        Unbusy
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 30, color: "#5a5f67" }}>{kicker}</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 10,
          width: 240,
          background: "#2140c8",
          borderRadius: 5,
        }}
      />
    </div>,
    ogSize,
  );
}
