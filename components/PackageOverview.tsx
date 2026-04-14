"use client";

import React from "react";
import { PACKAGES } from "@/lib/packages";

export default function PackageOverview(props: any) {
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
      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>
        Paketübersicht
      </h2>

      <div style={{ display: "grid", gap: "12px" }}>
        {Object.entries(PACKAGES).map(([key, pkg]) => (
          <div
            key={key}
            style={{
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "16px",
              background: "#181818",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "18px" }}>{pkg.label}</div>
            <div style={{ color: "#bbb", marginTop: "6px" }}>
              {(pkg.priceMonthly / 100).toLocaleString("de-DE")} € / Monat
            </div>
            <div style={{ color: "#999", marginTop: "8px", fontSize: "14px" }}>
              Posts: {pkg.limits.posts_total === -1 ? "Unbegrenzt" : pkg.limits.posts_total}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
