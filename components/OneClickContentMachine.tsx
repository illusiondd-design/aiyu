"use client";

import React from "react";

export default function OneClickContentMachine(props: any) {
  return (
    <section
      style={{
        background: "#111",
        border: "1px solid #333",
        borderRadius: "16px",
        padding: "24px",
        color: "#fff",
      }}
    >
      <h2 style={{ margin: "0 0 12px 0", fontSize: "20px" }}>
        One-Click Content Machine
      </h2>
      <p style={{ margin: 0, color: "#bbb", lineHeight: 1.5 }}>
        Launch-Version aktiv. Dieses Modul wird nach dem Go-Live sauber auf das
        neue Paketsystem umgestellt.
      </p>
    </section>
  );
}
