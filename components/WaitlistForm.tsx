"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; position: number; total: number }
  | { kind: "err"; message: string };

export default function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState({ kind: "loading" });
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Something went wrong.");
      setState({ kind: "ok", position: data.position, total: data.total });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setState({ kind: "err", message });
    }
  }

  if (state.kind === "ok") {
    const shareText = encodeURIComponent(
      `i just joined the @tweetforme waitlist. it learns your voice and posts for you on x + threads. no AI-smell.\n\n`
    );
    const shareUrl = encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : "https://tweetforme.app"
    );
    return (
      <div className="rounded-2xl border-2 border-ink-900 bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#0e0e0c]">
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <span className="inline-block h-2 w-2 rounded-full bg-accent pulse-dot" />
          you're in.
        </div>
        <h3 className="mt-2 font-display text-3xl sm:text-4xl leading-tight">
          you're #{state.position} in line.
        </h3>
        <p className="mt-3 text-ink-600">
          We'll email you the second early access opens. Want to move up?
          Share with one other creator — we bump everyone who refers a friend.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            className="rounded-full border-2 border-ink-900 bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
            href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            share on X
          </a>
          <a
            className="rounded-full border-2 border-ink-900 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-100"
            href={`https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            share on Threads
          </a>
          <button
            className="rounded-full border-2 border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100"
            onClick={() => {
              navigator.clipboard.writeText(
                typeof window !== "undefined" ? window.location.origin : ""
              );
            }}
          >
            copy link
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border-2 border-ink-900 bg-white p-2 shadow-[6px_6px_0_0_#0e0e0c] flex flex-col sm:flex-row items-stretch gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@thing.com"
        className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base outline-none placeholder:text-ink-400"
        aria-label="Your email"
      />
      <button
        type="submit"
        disabled={state.kind === "loading"}
        className="rounded-xl bg-ink-900 px-5 py-3 text-base font-medium text-white hover:bg-ink-800 disabled:opacity-60"
      >
        {state.kind === "loading" ? "joining…" : "join the waitlist →"}
      </button>
      {state.kind === "err" && (
        <span className="sr-only" role="alert">
          {state.message}
        </span>
      )}
      {state.kind === "err" && (
        <p className="basis-full px-2 py-1 text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
