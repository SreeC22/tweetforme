"use client";

import { useEffect, useState } from "react";

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

  // After a successful signup, briefly show confirmation, then auto-reset
  // so another email can be entered without a page reload.
  useEffect(() => {
    if (state.kind !== "ok") return;
    const t = setTimeout(() => {
      setEmail("");
      setState({ kind: "idle" });
    }, 3500);
    return () => clearTimeout(t);
  }, [state.kind]);

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

  // -----------------------------------------------------------------------
  // Success state
  // -----------------------------------------------------------------------
  if (state.kind === "ok") {
    const shareText = encodeURIComponent(
      `I just joined the echo waitlist. It learns your writing voice and drafts posts for you on X and Threads — without the AI smell.\n\n`,
    );
    const shareUrl = encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : "https://echo.app",
    );

    return (
      <div
        className="rounded-2xl border border-[color:var(--rule-strong)] bg-[color:var(--bg-elev)] p-7 sm:p-9 text-left"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--accent)]">
          <span className="echo-dot" aria-hidden />
          You&apos;re on the list.
        </div>
        <h3 className="mt-3 font-display text-[2.2rem] leading-[1.05] text-[color:var(--ink)] sm:text-[2.6rem]">
          You&apos;re <span className="text-[color:var(--accent)]">#{state.position}</span> in line.
        </h3>
        <p className="mt-4 text-[1.02rem] leading-[1.6] text-[color:var(--ink-soft)]">
          We&apos;ll email you the moment early access opens. Want to move up?
          Share with one other person who&apos;d use this — everyone who refers
          a friend gets bumped forward.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <a
            className="btn-primary text-sm sm:text-base"
            href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            Share on X
          </a>
          <a
            className="btn-ghost text-sm sm:text-base"
            href={`https://www.threads.net/intent/post?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            Share on Threads
          </a>
          <button
            type="button"
            className="btn-ghost text-sm sm:text-base"
            onClick={() => {
              navigator.clipboard.writeText(
                typeof window !== "undefined" ? window.location.origin : "",
              );
            }}
          >
            Copy link
          </button>
          <button
            type="button"
            className="btn-ghost text-sm sm:text-base"
            onClick={() => {
              setEmail("");
              setState({ kind: "idle" });
            }}
          >
            Add another email
          </button>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Form (idle / loading / err)
  // -----------------------------------------------------------------------
  const inputId = `email-${source}`;
  const isLoading = state.kind === "loading";

  return (
    <form onSubmit={submit} className="text-left" noValidate>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[color:var(--ink-soft)]"
      >
        Your email address
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="field flex-1"
          aria-invalid={state.kind === "err"}
          aria-describedby={state.kind === "err" ? `${inputId}-err` : undefined}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary justify-center whitespace-nowrap px-5 py-3.5 text-base"
        >
          {isLoading ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {state.kind === "err" && (
        <p
          id={`${inputId}-err`}
          role="alert"
          className="mt-3 text-sm text-[color:#c2410c]"
        >
          {state.message}
        </p>
      )}
      {/* variant prop accepted for backward compatibility — the design is unified. */}
      <span className="sr-only" data-variant={variant} />
    </form>
  );
}
