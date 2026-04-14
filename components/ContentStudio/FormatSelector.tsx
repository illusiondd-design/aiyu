import React from "react";
import type { Platform, Format } from "./ContentStudio";

type Props = {
  platform: Platform;
  selected: Format;
  onChange: (format: Format) => void;
};

const FORMAT_OPTIONS: Record<Platform, Format[]> = {
  instagram: ["post", "reel", "story"],
  tiktok: ["short"],
  youtube: ["short"],
  facebook: ["post", "story"],
  linkedin: ["post"],
};

export default function FormatSelector({
  platform,
  selected,
  onChange,
}: Props) {
  const options = FORMAT_OPTIONS[platform] ?? ["post"];

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {options.map((format) => {
        const isActive = selected === format;

        return (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              border: isActive ? "1px solid #fff" : "1px solid #444",
              background: isActive ? "#333" : "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {format}
          </button>
        );
      })}
    </div>
  );
}
