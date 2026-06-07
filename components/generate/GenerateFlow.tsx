"use client";

import { useEffect, useState } from "react";
import type { Draft, Platform, VoiceProfile } from "@/lib/types";

const STORAGE_KEY = "echo:voice-profile";

export default function GenerateFlow() {
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [tab, setTab] = useState<Platform>("x");

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

  async function generate() {
    if (!profile) {
      setError("Train your voice first — head to /train.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, profile }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Generation failed.");
      setDrafts(data.drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!profile && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You haven't trained a voice yet.{" "}
          <a className="underline" href="/train">
            Train your voice →
          </a>
        </div>
      )}

      <div className="rounded-2xl border-2 border-ink-900 bg-white p-2 shadow-[6px_6px_0_0_#0e0e0c]">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="A raw idea, a sentence, a link, a thought you had in the shower…"
          rows={5}
          className="w-full resize-y rounded-xl bg-transparent p-4 text-base outline-none placeholder:text-ink-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          disabled={loading || !idea.trim() || !profile}
          className="rounded-full bg-ink-900 px-5 py-3 text-base font-medium text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "writing in your voice…" : "generate drafts"}
        </button>
        {drafts.length > 0 && (
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-100"
          >
            regenerate
          </button>
        )}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {drafts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl">your drafts</h2>

          {/* platform switcher — flip between X / Threads / LinkedIn */}
          <div className="flex w-fit gap-1 rounded-full border border-ink-200 bg-ink-50 p-1 text-sm">
            {(["x", "threads", "linkedin"] as Platform[]).map((p) => {
              const n = drafts.filter((d) => d.platform === p).length;
              const labels: Record<Platform, string> = {
                x: "X",
                threads: "Threads",
                linkedin: "LinkedIn",
              };
              const active = tab === p;
              return (
                <button
                  key={p}
                  onClick={() => setTab(p)}
                  className={`rounded-full px-4 py-1.5 transition ${
                    active ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
                  }`}
                >
                  {labels[p]}
                  {n > 0 && (
                    <span className={active ? "text-white/70" : "text-ink-400"}> ({n})</span>
                  )}
                </button>
              );
            })}
          </div>

          <ul className="space-y-4">
            {drafts
              .filter((d) => d.platform === tab)
              .map((d, i) => (
                <DraftCard key={`${tab}-${i}`} draft={d} />
              ))}
          </ul>
          {drafts.filter((d) => d.platform === tab).length === 0 && (
            <p className="text-sm text-ink-500">
              No {tab} drafts this round — hit regenerate.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function DraftCard({ draft }: { draft: Draft }) {
  const [text, setText] = useState(draft.text);
  const [thread, setThread] = useState<string[] | undefined>(draft.thread);
  const [status, setStatus] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postedUrl, setPostedUrl] = useState<string | null>(null);

  const platform = draft.platform;
  const LABELS: Record<string, string> = { x: "X", threads: "Threads", linkedin: "LinkedIn" };
  const label = LABELS[platform] ?? platform;
  const canPublish = platform === "threads" || platform === "linkedin";
  const enc = encodeURIComponent(text);
  const composeUrl =
    platform === "x"
      ? `https://x.com/intent/tweet?text=${enc}`
      : platform === "threads"
      ? `https://www.threads.net/intent/post?text=${enc}`
      : `https://www.linkedin.com/feed/?shareActive=true&text=${enc}`;

  async function publish() {
    setPosting(true);
    setStatus(null);
    try {
      const endpoint =
        platform === "threads" ? "/api/post-threads" : "/api/post-linkedin";
      const body = { text };
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Publish failed.");
      const url = data?.results?.[0]?.url || data?.url || null;
      setPostedUrl(url);
      setStatus("published ✓");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <li className="rounded-2xl border-2 border-ink-900 bg-white p-5 shadow-[4px_4px_0_0_#0e0e0c]">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold text-white ${
              platform === "x"
                ? "bg-ink-900"
                : platform === "linkedin"
                ? "bg-[#0a66c2]"
                : "bg-[#0a0a0a]"
            }`}
          >
            {label}
          </span>
          {draft.note && <span className="text-ink-400">{draft.note}</span>}
          {thread?.length && (
            <span className="text-ink-400">{thread.length}-tweet thread</span>
          )}
        </div>
        <span className="text-ink-400">{text.length} chars</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={Math.max(3, Math.min(8, Math.ceil(text.length / 60)))}
        className="mt-3 w-full resize-y rounded-xl border border-ink-100 bg-ink-50 p-3 text-[15px] outline-none focus:border-ink-300"
      />

      {thread && (
        <details className="mt-3 rounded-xl bg-ink-50 p-3 text-sm">
          <summary className="cursor-pointer text-ink-600">
            thread tweets ({thread.length})
          </summary>
          <ol className="mt-3 space-y-2 pl-5 list-decimal">
            {thread.map((t, i) => (
              <li key={i}>
                <textarea
                  value={t}
                  onChange={(e) => {
                    const next = [...thread];
                    next[i] = e.target.value;
                    setThread(next);
                  }}
                  rows={3}
                  className="w-full resize-y rounded-md border border-ink-100 bg-white p-2 text-sm outline-none focus:border-ink-300"
                />
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canPublish ? (
          <button
            onClick={publish}
            disabled={posting}
            className="rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
          >
            {posting ? "publishing…" : `publish to ${label}`}
          </button>
        ) : (
          <button
            disabled
            title="X publishing is coming soon"
            className="cursor-not-allowed rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-400"
          >
            connect X · coming soon
          </button>
        )}
        <a
          href={composeUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-100"
        >
          open in compose
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          className="rounded-full border border-ink-200 px-4 py-2 text-sm text-ink-600 hover:bg-ink-100"
        >
          copy
        </button>
        {status && (
          <span className="text-sm text-ink-600">
            {status}{" "}
            {postedUrl && (
              <a className="underline" href={postedUrl} target="_blank" rel="noreferrer">
                view post
              </a>
            )}
          </span>
        )}
      </div>
    </li>
  );
}
