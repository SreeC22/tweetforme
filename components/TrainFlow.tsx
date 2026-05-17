"use client";

import { useEffect, useState } from "react";
import type { VoiceProfile } from "@/lib/types";

const STORAGE_KEY = "tweetforme:voice-profile";

const PLACEHOLDER = `Paste one of your past posts here.

Then a blank line.

Then your next post.

(Aim for 10–20 posts. Minimum 3.)`;

export default function TrainFlow() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const samples = raw
    .split(/\n\s*\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  async function train() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Training failed.");
      const p: VoiceProfile = data.profile;
      setProfile(p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Training failed.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
    setRaw("");
  }

  if (profile) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-ink-900 bg-white p-6 shadow-[6px_6px_0_0_#0e0e0c]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-accent">
                voice profile trained
              </div>
              <h3 className="mt-1 font-display text-2xl">{profile.summary}</h3>
            </div>
            <button
              onClick={reset}
              className="rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
            >
              retrain
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProfileChips title="tone" items={profile.tone} />
            <ProfileChips title="vocabulary" items={profile.vocabulary} />
            <ProfileChips title="signature moves" items={profile.signature_moves} />
            <ProfileChips title="structures" items={profile.structures} />
            <ProfileChips title="do's" items={profile.dos} accent />
            <ProfileChips title="dont's" items={profile.donts} />
          </div>
        </div>

        <a
          href="/generate"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink-900 bg-ink-900 px-5 py-3 text-white hover:bg-ink-800"
        >
          generate posts in this voice →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-ink-900 bg-white p-2 shadow-[6px_6px_0_0_#0e0e0c]">
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={14}
          className="w-full resize-y rounded-xl bg-transparent p-4 text-base outline-none placeholder:text-ink-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={train}
          disabled={loading || samples.length < 3}
          className="rounded-full bg-ink-900 px-5 py-3 text-base font-medium text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "extracting your voice…" : `train on ${samples.length} post${samples.length === 1 ? "" : "s"}`}
        </button>
        <span className="text-sm text-ink-600">
          Separate posts with a <span className="font-mono">blank line</span>. Minimum 3.
        </span>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function ProfileChips({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-ink-400">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(items || []).map((t, i) => (
          <span
            key={i}
            className={
              accent
                ? "rounded-full border border-accent bg-accent-soft px-2.5 py-1 text-xs text-ink-900"
                : "rounded-full border border-ink-200 bg-ink-50 px-2.5 py-1 text-xs text-ink-600"
            }
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
