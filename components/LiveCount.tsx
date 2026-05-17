"use client";

import { useEffect, useState } from "react";

export default function LiveCount() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/waitlist", { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as { total?: number };
        if (!cancelled && typeof data.total === "number") setTotal(data.total);
      } catch {
        /* silent — count is decorative */
      }
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (total === null) {
    return <span className="opacity-60">Loading…</span>;
  }
  if (total === 0) {
    return <span>Be the first to join.</span>;
  }
  return (
    <span>
      <span className="font-medium text-[color:var(--ink)] tabular-nums">
        {total.toLocaleString()}
      </span>{" "}
      {total === 1 ? "person" : "people"} already in line.
    </span>
  );
}
