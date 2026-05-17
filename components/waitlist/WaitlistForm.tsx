"use client";

import { useState } from "react";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; position: number; total: number }
  | { kind: "err"; message: string };

type Variant = "light" | "dark";

export default function WaitlistForm({
  source = "landing",
  variant = "light",
}: {
  source?: string;
  variant?: Variant;
}) {
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

    if (variant === "dark") {
      return (
        <div className="border border-[var(--v2-line-strong)] bg-[#111110] p-6 sm:p-8">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--v2-accent)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] v2-dot" />
            [ you{"'"}re in ]
          </div>
          <h3 className="mt-3 font-display text-4xl leading-[1.05] text-[var(--v2-ink)] sm:text-5xl">
            you{"'"}re <span className="italic text-[var(--v2-accent)]">#{state.position}</span>{" "}
            <span className="italic">in line.</span>
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--v2-ink-dim)]">
            We{"'"}ll email you the second early access opens. Want to move up? Share with one
            other creator — we bump everyone who refers a friend.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
            <a
              className="border border-[var(--v2-ink)] bg-[var(--v2-ink)] px-4 py-2 text-[#0a0a0a] transition-colors hover:bg-[var(--v2-accent)] hover:border-[var(--v2-accent)] hover:text-[#0a0a0a]"
              href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              share / x
            </a>
            <a
              className="border border-[var(--v2-line-strong)] bg-transparent px-4 py-2 text-[var(--v2-ink)] transition-colors hover:border-[var(--v2-ink)]"
              href={`https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              share / threads
            </a>
            <button
              className="border border-[var(--v2-line-strong)] bg-transparent px-4 py-2 text-[var(--v2-ink-dim)] transition-colors hover:text-[var(--v2-ink)]"
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

  if (variant === "dark") {
    return (
      <form
        onSubmit={submit}
        className="group relative flex flex-col items-stretch gap-0 border border-[var(--v2-line-strong)] bg-[#111110] p-1.5 transition-colors focus-within:border-[var(--v2-ink)] sm:flex-row"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@thing.com"
          className="flex-1 bg-transparent px-4 py-3.5 text-base text-[var(--v2-ink)] outline-none placeholder:text-[var(--v2-ink-faint)] font-mono"
          aria-label="Your email"
        />
        <button
          type="submit"
          disabled={state.kind === "loading"}
          className="group/btn relative overflow-hidden bg-[var(--v2-ink)] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors hover:bg-[var(--v2-accent)] disabled:opacity-50"
        >
          <span className="relative z-10">
            {state.kind === "loading" ? "[ joining... ]" : "[ join waitlist ]"}
          </span>
        </button>
        {state.kind === "err" && (
          <span className="sr-only" role="alert">
            {state.message}
          </span>
        )}
        {state.kind === "err" && (
          <p className="basis-full px-2 py-1 font-mono text-xs text-red-400">
            {state.message}
          </p>
        )}
      </form>
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
