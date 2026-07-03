"use client";

import { useState } from "react";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { previewFallback } from "@/lib/preview";

// Deliberately different registers so visitors see the preview mirror THEIR voice.
const EXAMPLES = [
  "shipping beats planning",
  "planning is so mid fr 💀",
  "Execution beats planning. Thoughts?",
];

// A free, no-signup taste: type an idea → one draft in a sample creator's
// voice → then the email hook. Falls back to a seeded draft if generation is
// unavailable, so a visitor never sees an error.
export default function TryItPreview() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function run() {
    const q = idea.trim();
    if (!q || loading) return;
    setLoading(true);
    setDraft(null);
    try {
      const r = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: q }),
      });
      const data = await r.json();
      // The endpoint always returns an on-topic draft (real or fallback); only a
      // network/parse failure lands here, so build one from the idea locally.
      setDraft(String(data?.draft || previewFallback(q)));
    } catch {
      setDraft(previewFallback(q));
    } finally {
      setLoading(false);
      setRevealed(true);
    }
  }

  return (
    <section id="try" className="relative border-b border-[color:var(--rule)] py-20 sm:py-28">
      <div className="mx-auto max-w-[760px] px-6 sm:px-10">
        <div className="text-center">
          <p className="text-sm font-medium text-[color:var(--accent)]">
            See it before you sign up
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] text-[color:var(--ink)]">
            Type an idea. Watch it write.
          </h2>
          <p className="mx-auto mt-4 max-w-[34rem] text-[1.02rem] leading-[1.65] text-[color:var(--ink-soft)]">
            Write it however you&apos;d actually say it — echo mirrors your voice
            right back. Gen&nbsp;Z in, Gen&nbsp;Z out. No signup, no training.
          </p>
        </div>

        {/* input */}
        <div className="mt-9 rounded-2xl border-2 border-[color:var(--ink)] bg-[color:var(--bg-elev)] p-2.5 shadow-[6px_6px_0_0_var(--ink)]">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
            }}
            placeholder="a raw idea, a thought, a one-liner…"
            rows={3}
            className="w-full resize-none rounded-xl bg-transparent p-3 text-[1.05rem] leading-[1.6] text-[color:var(--ink)] outline-none placeholder:text-[color:var(--ink-mute)]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--ink-mute)]">
              <span className="hidden sm:inline">try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setIdea(ex)}
                  className="rounded-full border border-[color:var(--rule-strong)] px-3 py-1 text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={run}
              disabled={loading || !idea.trim()}
              className="btn-primary justify-center whitespace-nowrap px-5 py-3 text-base disabled:opacity-50"
            >
              {loading ? "writing…" : "Write it →"}
            </button>
          </div>
        </div>

        {/* result */}
        {draft && (
          <div className="mt-6 rounded-2xl border border-[color:var(--accent)] bg-[color:var(--bg-elev)] p-6 sm:p-8 shadow-[0_1px_0_0_var(--accent)]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[color:var(--accent)]">
                a draft for X
              </span>
              <span className="text-[color:var(--ink-mute)]">in your voice</span>
            </div>
            <p className="mt-3 font-display text-[1.3rem] leading-[1.5] text-[color:var(--ink)] sm:text-[1.4rem]">
              {draft}
            </p>
          </div>
        )}

        {/* email hook (value-first: only after they see a draft) */}
        {revealed && (
          <div className="mt-9">
            <p className="text-center font-display text-[1.6rem] leading-[1.2] text-[color:var(--ink)] sm:text-[1.9rem]">
              Want this in <span className="text-[color:var(--accent)]">your</span> voice?
            </p>
            <p className="mx-auto mt-3 max-w-[32rem] text-center text-[1rem] leading-[1.6] text-[color:var(--ink-soft)]">
              Join the waitlist — early access learns your voice from your own
              posts and writes for X, Threads &amp; LinkedIn.
            </p>
            <div className="mx-auto mt-6 max-w-[30rem]">
              <WaitlistForm source="try-preview" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
