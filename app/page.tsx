"use client";

import { useEffect, useRef } from "react";
import WaitlistForm from "@/components/WaitlistForm";

/* =========================================================================
   tweetforme / v2  —  shader.se-inspired studio waitlist
   ========================================================================= */

export default function V2Page() {
  // Reveal-on-scroll: add .v2-revealed when elements enter viewport.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".v2-reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("v2-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("v2-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <main className="v2-root relative min-h-screen overflow-x-clip selection:bg-[var(--v2-accent)] selection:text-[#0a0a0a]">
      <TopBar />
      <Hero />
      <Marquee />
      <Comparison />
      <HowItWorks />
      <ForWho />
      <Roadmap />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ---------- TOP BAR ---------- */

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--v2-line)] bg-[rgba(10,10,10,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
        <a
          href="/v2"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink)]"
        >
          tweetforme
          <span className="ml-3 text-[var(--v2-ink-faint)]">/ est. 2026</span>
        </a>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--v2-ink-dim)] md:flex">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] v2-dot" />
            <span>[ waitlist // open ]</span>
          </span>
          <a href="#how" className="transition-colors hover:text-[var(--v2-ink)]">
            method
          </a>
          <a href="#roadmap" className="transition-colors hover:text-[var(--v2-ink)]">
            roadmap
          </a>
        </nav>
        <a
          href="#waitlist"
          className="group relative inline-flex items-center gap-2 border border-[var(--v2-ink)] bg-[var(--v2-ink)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[#0a0a0a] transition-colors hover:bg-[var(--v2-accent)] hover:border-[var(--v2-accent)]"
        >
          early access
          <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  );
}

/* ---------- HERO ---------- */

function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  // Cursor-follow glow.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden border-b border-[var(--v2-line)]"
    >
      <ShaderBackdrop />
      <div className="v2-cursor-glow" />

      <div className="relative mx-auto grid max-w-[1400px] gap-16 px-6 pt-24 pb-28 sm:px-10 sm:pt-32 sm:pb-36 lg:grid-cols-[1.45fr_1fr] lg:gap-20">
        {/* LEFT — headline + form */}
        <div className="relative">
          {/* Index labels in mono */}
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
            <span>(01) / a content tool with taste</span>
            <span className="hidden sm:inline">— vol. 001</span>
          </div>

          <h1 className="v2-reveal mt-10 font-display text-[clamp(3.2rem,9.5vw,8.2rem)] leading-[0.92] tracking-[-0.02em] text-[var(--v2-ink)]">
            your voice.
            <br />
            <span className="italic text-[var(--v2-ink)]">
              on{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-[var(--v2-accent)]">autopilot</span>
                <span
                  aria-hidden
                  className="absolute left-0 right-0 top-[0.62em] -z-0 h-[0.08em] bg-[var(--v2-accent)]/30"
                />
              </span>
              .
            </span>
          </h1>

          <p
            className="v2-reveal mt-10 max-w-[36ch] text-[1.05rem] leading-[1.55] text-[var(--v2-ink-dim)] sm:text-[1.15rem]"
            style={{ transitionDelay: "120ms" }}
          >
            Paste 10 of your best posts. We learn your voice, then draft and publish to{" "}
            <span className="text-[var(--v2-ink)]">X</span> and{" "}
            <span className="text-[var(--v2-ink)]">Threads</span>{" "}
            <span className="font-mono text-[0.9em] text-[var(--v2-ink-faint)]">// in your voice</span>
            <br />
            <span className="text-[var(--v2-ink)]">no AI smell.</span>
          </p>

          <div
            id="waitlist"
            className="v2-reveal mt-12 max-w-[36rem]"
            style={{ transitionDelay: "200ms" }}
          >
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              <span>(a) → enter email</span>
              <span>[ no spam, ever ]</span>
            </div>
            <WaitlistForm source="v2-hero" variant="dark" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--v2-ink-faint)]">
              one email when early access opens · unsubscribe in one click
            </p>
          </div>

          <ul
            className="v2-reveal mt-14 grid max-w-[36rem] gap-0 border-t border-[var(--v2-line)] font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--v2-ink-dim)] sm:grid-cols-3"
            style={{ transitionDelay: "280ms" }}
          >
            {[
              "trained on your past posts",
              "one-tap publish · x + threads",
              "anti-ai-smell by default",
            ].map((item, i) => (
              <li
                key={item}
                className={`flex items-start gap-2 border-b border-[var(--v2-line)] py-4 ${
                  i > 0 ? "sm:border-l sm:pl-4" : ""
                }`}
              >
                <span className="text-[var(--v2-accent)]">●</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — vertical meta column */}
        <aside className="relative hidden lg:block">
          <div className="sticky top-32 space-y-10">
            <div className="border-l border-[var(--v2-line-strong)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                (002) — what
              </div>
              <p className="mt-3 font-display text-2xl leading-tight text-[var(--v2-ink)]">
                A waitlist for a generator that{" "}
                <em className="text-[var(--v2-ink-dim)]">refuses</em> to sound like AI.
              </p>
            </div>
            <div className="border-l border-[var(--v2-line-strong)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                (003) — who
              </div>
              <p className="mt-3 text-[15px] leading-[1.5] text-[var(--v2-ink-dim)]">
                Founders, indie hackers, coaches, and creators with a voice already worth amplifying.
              </p>
            </div>
            <div className="border-l border-[var(--v2-line-strong)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                (004) — when
              </div>
              <p className="mt-3 text-[15px] leading-[1.5] text-[var(--v2-ink-dim)]">
                Days. Not months. First 100 waitlisters get a lifetime founder rate.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* baseline meta strip */}
      <div className="relative border-t border-[var(--v2-line)]">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)] sm:px-10">
          <span>tweetforme — your voice, automated, undetectable</span>
          <span>shipping in days · building in public · ◢◤</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- SHADER BACKDROP ----------
   Layered radial / conic gradient with an SVG turbulence-displaced color blob.
   Pure SVG + CSS, no WebGL libs. Animates baseFrequency for a slow drift.        */

function ShaderBackdrop() {
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);

  // Animate baseFrequency for a living, breathing shader feel.
  useEffect(() => {
    const node = turbRef.current;
    if (!node) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.004;
      const bx = 0.0085 + Math.sin(t) * 0.0035;
      const by = 0.012 + Math.cos(t * 0.8) * 0.004;
      node.setAttribute("baseFrequency", `${bx.toFixed(5)} ${by.toFixed(5)}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* base dark wash */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* hairline grid */}
      <div className="absolute inset-0 opacity-[0.35] v2-grid-bg" />

      {/* SVG shader blob */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="v2-displace" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.009 0.013"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="180"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="20" />
          </filter>

          <radialGradient id="v2-blob-1" cx="35%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#ff5b1f" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#ff5b1f" stopOpacity="0.32" />
            <stop offset="80%" stopColor="#ff5b1f" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ff5b1f" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="v2-blob-2" cx="80%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#5a2bff" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#5a2bff" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#5a2bff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="v2-blob-3" cx="15%" cy="85%" r="45%">
            <stop offset="0%" stopColor="#1a1a18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1a1a18" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          style={{ mixBlendMode: "screen", filter: "url(#v2-displace)" }}
          className="v2-shader-drift"
        >
          <rect width="1200" height="900" fill="url(#v2-blob-1)" />
          <rect width="1200" height="900" fill="url(#v2-blob-2)" />
          <rect width="1200" height="900" fill="url(#v2-blob-3)" />
        </g>

        {/* a second, slower un-displaced wash for depth */}
        <g style={{ mixBlendMode: "screen", opacity: 0.45 }}>
          <rect width="1200" height="900" fill="url(#v2-blob-1)" />
        </g>
      </svg>

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(10,10,10,0.4) 70%, #0a0a0a 100%)",
        }}
      />

      {/* fine top-down dark fade to anchor the headline */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(10,10,10,0.85) 70%, #0a0a0a)",
        }}
      />
    </div>
  );
}

/* ---------- MARQUEE — struck-through AI-smell phrases ---------- */

function Marquee() {
  const phrases = [
    "🚀 EXCITED TO SHARE",
    "IN TODAY'S FAST-PACED WORLD",
    "GAME-CHANGING",
    "#DEVLIFE",
    "UNLOCK THE POWER OF",
    "LET THAT SINK IN",
    "HOT TAKE:",
    "DEEP DIVE",
    "AT THE END OF THE DAY",
    "REVOLUTIONIZE",
    "LEVERAGE SYNERGIES",
    "10 THINGS NOBODY TELLS YOU",
    "DROPS MIC",
    "👇 THREAD",
    "DISRUPTING THE SPACE",
    "#PRODUCTIVITYHACKS",
  ];
  const Row = (
    <span className="inline-flex shrink-0 items-center gap-10 px-5">
      {phrases.map((p) => (
        <span
          key={p}
          className="inline-flex items-center gap-10 font-display text-[clamp(2rem,5vw,4rem)] italic leading-none text-[var(--v2-ink-faint)] line-through decoration-[var(--v2-accent)] decoration-[3px]"
        >
          {p.toLowerCase()}
          <span aria-hidden className="text-[var(--v2-ink-faint)] no-underline">
            ✕
          </span>
        </span>
      ))}
    </span>
  );
  return (
    <section
      aria-label="phrases we will never write"
      className="relative border-b border-[var(--v2-line)] py-10 sm:py-14"
    >
      <div className="mx-auto mb-6 flex max-w-[1400px] items-center justify-between px-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)] sm:px-10">
        <span>(02) — words we will never type for you</span>
        <span>// banned vocabulary</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="v2-marquee flex w-max">
          {Row}
          {Row}
        </div>
        {/* fades on the edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-32"
          style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-32"
          style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
        />
      </div>
    </section>
  );
}

/* ---------- COMPARISON ---------- */

function Comparison() {
  return (
    <section className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="v2-reveal">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
              (03) — the problem
            </div>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
              everyone else
              <br />
              writes like a{" "}
              <span className="italic text-[var(--v2-accent)]">linkedin intern.</span>
            </h2>
          </div>
          <p className="v2-reveal max-w-md justify-self-end text-[15px] leading-[1.6] text-[var(--v2-ink-dim)]">
            Generic AI writers all have the same tells — the cadence, the cliches, the
            hashtag spray, the rocket emoji. Audiences smell it instantly. We trained ours
            to do the opposite.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] sm:grid-cols-2">
          {/* before */}
          <article className="v2-reveal relative bg-[#0c0c0b] p-8 sm:p-10">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              <span>// before · what other AI tools spit out</span>
              <span>✕</span>
            </div>
            <p className="mt-8 font-display text-[1.55rem] leading-[1.35] italic text-[var(--v2-ink-dim)]">
              🚀 Excited to share a powerful insight today! In today&apos;s fast-paced
              world, debugging has become more crucial than ever. Here are 5 game-changing
              strategies that will revolutionize how you tackle bugs. 👇
              <br />
              <br />
              <span className="text-[var(--v2-ink-faint)]">
                #DevLife #ProductivityHacks #Coding
              </span>
            </p>
            <div className="mt-10 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
              {[
                "🚀 rocket emoji",
                "in today's world",
                "game-changing",
                "hashtag spray",
              ].map((t) => (
                <span
                  key={t}
                  className="border border-[var(--v2-line-strong)] px-2.5 py-1 text-[var(--v2-ink-faint)] line-through decoration-[var(--v2-ink-faint)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>

          {/* after */}
          <article className="v2-reveal relative bg-[#111110] p-8 sm:p-10">
            <div
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] bg-[var(--v2-accent)]"
            />
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-accent)]">
              <span>// after · what tweetforme writes for you</span>
              <span>●</span>
            </div>
            <p className="mt-8 font-display text-[1.55rem] leading-[1.35] text-[var(--v2-ink)]">
              spent 3 hours debugging a bug that wasn&apos;t a bug.
              <br />
              it was a typo.
              <br />
              the typo was in the documentation I wrote yesterday.
              <br />
              <br />
              <span className="italic text-[var(--v2-ink-dim)]">
                soft launch of a humility era.
              </span>
            </p>
            <div className="mt-10 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
              {[
                "lowercase, like you",
                "real punchline",
                "your sentence rhythm",
                "zero hashtags",
              ].map((t) => (
                <span
                  key={t}
                  className="border border-[var(--v2-ink)] bg-[var(--v2-ink)] px-2.5 py-1 text-[#0a0a0a]"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Feed it your voice",
      body: "Paste 10–20 of your past posts. We extract your tone, vocab, sentence shapes, and signature moves. Takes ~30 seconds.",
      meta: "≈ 30 sec",
    },
    {
      n: "02",
      title: "Drop in a raw idea",
      body: "A sentence, a link, a screenshot. We turn it into 3 X drafts (including a short thread) and 2 Threads variants — in your voice.",
      meta: "5 drafts / idea",
    },
    {
      n: "03",
      title: "Hit publish",
      body: "Connect X + Threads once. One tap fires the post live. Or edit, or schedule, or queue. You decide what auto means.",
      meta: "one tap",
    },
  ];
  return (
    <section id="how" className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="v2-reveal">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
              (04) — method
            </div>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
              how it <span className="italic text-[var(--v2-accent)]">works</span>.
            </h2>
          </div>
          <span className="v2-reveal font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
            [ three steps · zero ai smell ]
          </span>
        </div>

        <div className="mt-16 grid gap-px border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] md:grid-cols-3">
          {steps.map((s, idx) => (
            <article
              key={s.n}
              className="v2-reveal group relative flex flex-col bg-[#0c0c0b] p-8 transition-colors hover:bg-[#111110] sm:p-10"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-[6rem] italic leading-none text-[var(--v2-accent)]/85">
                  {s.n}
                </span>
                <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                  / {s.meta}
                </span>
              </div>
              <h3 className="mt-10 font-display text-[2rem] leading-[1.1] text-[var(--v2-ink)]">
                {s.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-[var(--v2-ink-dim)]">
                {s.body}
              </p>
              <span
                aria-hidden
                className="mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)] transition-colors group-hover:text-[var(--v2-accent)]"
              >
                ↳ step {s.n}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FOR WHO ---------- */

function ForWho() {
  const personas = [
    {
      t: "founders & indie hackers",
      b: "X is the founder watering hole. You know it; you still don't post.",
      tag: "→ 01",
    },
    {
      t: "creators & coaches",
      b: "Threads is the new growth channel. Your audience is already there.",
      tag: "→ 02",
    },
    {
      t: "newsletter writers",
      b: "Your essays already do the thinking. We just turn them into daily distribution.",
      tag: "→ 03",
    },
  ];
  return (
    <section className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="v2-reveal grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
              (05) — for who
            </div>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
              built for the people
              <br />
              who hate posting{" "}
              <span className="italic text-[var(--v2-accent)]">but should.</span>
            </h2>
          </div>
        </div>

        <div className="mt-16 grid gap-px border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] md:grid-cols-3">
          {personas.map((p, i) => (
            <article
              key={p.t}
              className="v2-reveal relative flex flex-col gap-6 bg-[#0c0c0b] p-8 transition-colors hover:bg-[#111110] sm:p-10"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                <span>persona {p.tag.replace("→ ", "")}</span>
                <span>{p.tag}</span>
              </div>
              <h3 className="font-display text-[1.95rem] leading-[1.1] text-[var(--v2-ink)]">
                {p.t}
              </h3>
              <p className="text-[15px] leading-[1.6] text-[var(--v2-ink-dim)]">{p.b}</p>
              <div className="mt-auto h-px w-12 bg-[var(--v2-accent)]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ROADMAP ---------- */

function Roadmap() {
  const items = [
    { v: "v0.1", t: "Voice training + drafts + one-tap publish", on: true },
    { v: "v0.2", t: "Multiple voices per account, share-a-voice links" },
    { v: "v0.3", t: "Queue + scheduling + best-time-to-post" },
    { v: "v0.4", t: "Daily idea drops from your bookmarks + newsletters" },
    { v: "v0.5", t: "Performance loop — auto-learn what's working" },
    { v: "v1.0", t: "Team mode: ghostwriters, approvers, workspaces" },
  ];
  return (
    <section id="roadmap" className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="v2-reveal">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
              (06) — roadmap
            </div>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
              what we&apos;re <span className="italic">shipping.</span>
            </h2>
          </div>
          <span className="v2-reveal font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
            [ live document · subject to change ]
          </span>
        </div>

        <ul className="v2-reveal mt-16 border-t border-[var(--v2-line-strong)]">
          {items.map((i) => (
            <li
              key={i.v}
              className="group grid grid-cols-[5rem_1fr_auto] items-center gap-6 border-b border-[var(--v2-line-strong)] py-6 transition-colors hover:bg-[#111110]"
            >
              <span
                className={`font-mono text-[12px] uppercase tracking-[0.22em] ${
                  i.on ? "text-[var(--v2-accent)]" : "text-[var(--v2-ink-faint)]"
                }`}
              >
                {i.v}
              </span>
              <span
                className={`font-display text-[1.4rem] leading-[1.25] sm:text-[1.7rem] ${
                  i.on ? "text-[var(--v2-ink)]" : "text-[var(--v2-ink-dim)]"
                }`}
              >
                {i.t}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.28em] ${
                  i.on ? "text-[var(--v2-accent)]" : "text-[var(--v2-ink-faint)]"
                }`}
              >
                {i.on ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] v2-dot" />
                    in progress
                  </span>
                ) : (
                  "queued"
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--v2-line)] py-28 sm:py-40">
      {/* faded shader behind */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 50%, rgba(255,91,31,0.18), transparent 60%)",
          }}
        />
        <div className="absolute inset-0 opacity-25 v2-grid-bg" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink-dim)]">
          <span>(07) — last call</span>
          <span>[ first 100 = lifetime founder rate ]</span>
        </div>

        <h2 className="v2-reveal mt-10 max-w-[18ch] font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--v2-ink)]">
          stop ghost-posting
          <br />
          <span className="italic text-[var(--v2-accent)]">your own brand.</span>
        </h2>

        <p
          className="v2-reveal mt-8 max-w-[42ch] text-[1.05rem] leading-[1.6] text-[var(--v2-ink-dim)] sm:text-[1.15rem]"
          style={{ transitionDelay: "100ms" }}
        >
          Get early access. We&apos;re shipping in days, not months. First 100 waitlisters
          get a lifetime founder rate.
        </p>

        <div
          className="v2-reveal mt-12 max-w-[36rem]"
          style={{ transitionDelay: "180ms" }}
        >
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
            <span>(b) → enter email</span>
            <span>// final form</span>
          </div>
          <WaitlistForm source="v2-final-cta" variant="dark" />
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */

function Footer() {
  return (
    <footer className="relative">
      <div className="mx-auto max-w-[1400px] px-6 py-12 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink)]">
              tweetforme
              <span className="ml-3 text-[var(--v2-ink-faint)]">/ est. 2026</span>
            </div>
            <p className="mt-4 max-w-md font-display text-[1.3rem] italic leading-[1.3] text-[var(--v2-ink-dim)]">
              built in 3 hours,
              <br />
              shipped on autopilot.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              links
            </div>
            <ul className="mt-3 space-y-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--v2-ink-dim)]">
              <li>
                <a href="/" className="transition-colors hover:text-[var(--v2-ink)]">
                  → original
                </a>
              </li>
              <li>
                <a
                  href="#waitlist"
                  className="transition-colors hover:text-[var(--v2-ink)]"
                >
                  → waitlist
                </a>
              </li>
              <li>
                <a href="#roadmap" className="transition-colors hover:text-[var(--v2-ink)]">
                  → roadmap
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              status
            </div>
            <ul className="mt-3 space-y-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--v2-ink-dim)]">
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] v2-dot" />
                waitlist // open
              </li>
              <li>v0.1 // building</li>
              <li>3-hour sprint // in public</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[var(--v2-line)] pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)] sm:flex-row sm:items-center">
          <span>© 2026 tweetforme — your voice, automated, undetectable.</span>
          <span>made by a creator who got tired of posting · ◢◤</span>
        </div>
      </div>
    </footer>
  );
}
