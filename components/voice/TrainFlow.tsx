"use client";

import { useEffect, useState } from "react";
import type { VoiceProfile } from "@/lib/types";
import { isDemo, DEMO_PROFILE, DEMO_SAMPLES } from "@/lib/demo";

const STORAGE_KEY = "echo:voice-profile";

type Mode = "paste" | "connect" | "starter";

const STARTER_PROMPTS = [
  "What are you building or working on right now?",
  "What's a hot take you have about your space?",
  "Tell me about a recent win or a screw-up.",
  "What do you want to be known for?",
];

const PASTE_PLACEHOLDER = `Paste anything you've written, in your own words —

old posts, a paragraph from a blog, notes, even a long text to a friend.

Separate chunks with a blank line. A paragraph or two is enough.`;

export default function TrainFlow() {
  const [mode, setMode] = useState<Mode>("paste");
  const [raw, setRaw] = useState("");
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [sliders, setSliders] = useState({ formal: 1, funny: 1, spicy: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (cached) {
      try {
        setProfile(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
    if (isDemo()) {
      setDemo(true);
      if (!cached) setRaw(DEMO_SAMPLES);
    }
  }, []);

  // Core: send samples to the voice engine and save the profile.
  // Callers own loading/error so each mode reads naturally.
  async function runVoice(samples: string[], extraTone: string[] = []) {
    if (demo) {
      await new Promise((res) => setTimeout(res, 700));
      const dp: VoiceProfile = {
        ...DEMO_PROFILE,
        tone: extraTone.length
          ? Array.from(new Set([...DEMO_PROFILE.tone, ...extraTone]))
          : DEMO_PROFILE.tone,
      };
      setProfile(dp);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dp));
      return;
    }
    const r = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "Training failed.");
    const p: VoiceProfile = data.profile;
    if (extraTone.length) {
      p.tone = Array.from(new Set([...(p.tone || []), ...extraTone]));
    }
    setProfile(p);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  }

  // ── Mode: paste anything ──────────────────────────────────────────────────
  const pasteReady = raw.trim().length >= 80;
  async function trainPaste() {
    setLoading(true);
    setError(null);
    try {
      const samples = raw.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean);
      await runVoice(samples);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Training failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Mode: connect (Threads now; X + LinkedIn coming soon) ─────────────────
  async function connectThreads() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/import/threads", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Threads import failed.");
      const samples: string[] = (data.samples || []).filter(Boolean);
      if (!samples.length) throw new Error("No posts found on the connected Threads account.");
      await runVoice(samples);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Threads import failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Mode: voice starter (no posts) ────────────────────────────────────────
  const answered = answers.filter((a) => a.trim()).length;
  function toneFromSliders(): string[] {
    return [
      ["formal", "conversational", "casual and punchy"][sliders.formal],
      ["dry and understated", "lightly playful", "funny"][sliders.funny],
      ["measured", "direct", "bold and contrarian"][sliders.spicy],
    ];
  }
  async function trainStarter() {
    setLoading(true);
    setError(null);
    try {
      const samples = answers
        .map((a, i) => (a.trim() ? `${STARTER_PROMPTS[i]}\n${a.trim()}` : ""))
        .filter(Boolean);
      await runVoice(samples, toneFromSliders());
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
    setAnswers(["", "", "", ""]);
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
    <div className="space-y-5">
      {/* how do you want to give us your voice? */}
      <div className="flex w-fit flex-wrap gap-1 rounded-full border border-ink-200 bg-ink-50 p-1 text-sm">
        {(
          [
            ["paste", "Paste anything"],
            ["connect", "Connect"],
            ["starter", "No posts? Start here"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-full px-4 py-1.5 transition ${
              mode === m ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "paste" && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-ink-900 bg-white p-2 shadow-[6px_6px_0_0_#0e0e0c]">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={PASTE_PLACEHOLDER}
              rows={12}
              className="w-full resize-y rounded-xl bg-transparent p-4 text-base outline-none placeholder:text-ink-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={trainPaste}
              disabled={loading || !pasteReady}
              className="rounded-full bg-ink-900 px-5 py-3 text-base font-medium text-white hover:bg-ink-800 disabled:opacity-50"
            >
              {loading ? "extracting your voice…" : "learn my voice"}
            </button>
            <span className="text-sm text-ink-600">
              Paste anything you&apos;ve written. A paragraph or two is enough.
            </span>
          </div>
        </div>
      )}

      {mode === "connect" && (
        <div className="space-y-3">
          <p className="text-sm text-ink-600">
            We only read <strong>your own</strong> account, with your permission — never
            anyone else&apos;s.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={connectThreads}
              disabled={loading}
              className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-3 text-sm font-medium shadow-[4px_4px_0_0_#0e0e0c] hover:bg-ink-50 disabled:opacity-50"
            >
              {loading ? "importing…" : "Connect Threads"}
            </button>
            <button
              disabled
              title="coming soon"
              className="cursor-not-allowed rounded-2xl border border-ink-200 px-4 py-3 text-sm text-ink-400"
            >
              X · coming soon
            </button>
            <button
              disabled
              title="coming soon"
              className="cursor-not-allowed rounded-2xl border border-ink-200 px-4 py-3 text-sm text-ink-400"
            >
              LinkedIn · coming soon
            </button>
          </div>
          <p className="text-xs text-ink-400">
            Threads pulls your recent posts and learns your voice from them.
          </p>
        </div>
      )}

      {mode === "starter" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            No posts yet? Answer a few — like you&apos;re texting a friend. Your words
            become your voice.
          </p>
          <div className="space-y-3">
            {STARTER_PROMPTS.map((q, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-ink-900 bg-white p-2 shadow-[4px_4px_0_0_#0e0e0c]"
              >
                <label className="block px-2 pt-1 text-sm font-medium text-ink-700">{q}</label>
                <textarea
                  value={answers[i]}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  rows={2}
                  placeholder="a sentence or two…"
                  className="w-full resize-y rounded-xl bg-transparent p-2 text-base outline-none placeholder:text-ink-400"
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
            <div className="mb-3 text-xs uppercase tracking-widest text-ink-400">
              fine-tune the tone (optional)
            </div>
            <div className="space-y-3">
              <Slider label="formal" rightLabel="casual" value={sliders.formal} onChange={(v) => setSliders((s) => ({ ...s, formal: v }))} />
              <Slider label="reserved" rightLabel="funny" value={sliders.funny} onChange={(v) => setSliders((s) => ({ ...s, funny: v }))} />
              <Slider label="mild" rightLabel="spicy" value={sliders.spicy} onChange={(v) => setSliders((s) => ({ ...s, spicy: v }))} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={trainStarter}
              disabled={loading || answered < 2}
              className="rounded-full bg-ink-900 px-5 py-3 text-base font-medium text-white hover:bg-ink-800 disabled:opacity-50"
            >
              {loading ? "extracting your voice…" : `learn my voice (${answered}/4)`}
            </button>
            {answered < 2 && <span className="text-sm text-ink-500">Answer at least 2.</span>}
          </div>
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function Slider({
  label,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-right text-xs text-ink-500">{label}</span>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-ink-900"
      />
      <span className="w-20 text-xs text-ink-500">{rightLabel}</span>
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
