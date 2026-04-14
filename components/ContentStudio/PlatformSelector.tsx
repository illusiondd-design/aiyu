import React from "react";
import type { Platform } from "./ContentStudio";

type Props = {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
  multiSelect?: boolean;
};

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

export default function PlatformSelector({
  selected,
  onChange,
  multiSelect = false,
}: Props) {
  const togglePlatform = (platform: Platform) => {
    if (multiSelect) {
      if (selected.includes(platform)) {
        onChange(selected.filter((p) => p !== platform));
      } else {
        onChange([...selected, platform]);
      }
    } else {
      onChange([platform]);
    }
  };

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {PLATFORM_OPTIONS.map((platform) => {
        const isActive = selected.includes(platform.value);

        return (
          <button
            key={platform.value}
            type="button"
            onClick={() => togglePlatform(platform.value)}
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
            {platform.label}
          </button>
        );
      })}
    </div>
  );
}
