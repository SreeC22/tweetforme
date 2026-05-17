"use client";

import { useEffect, useRef } from "react";
import WaitlistForm from "@/components/waitlist/WaitlistForm";

/* =========================================================================
   tweetforme / v2  —  shader.se-inspired studio waitlist
   ========================================================================= */

export default function V2Page() {
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
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--v2-ink)]"
        >
          tweetforme
        </a>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--v2-ink-dim)] md:flex">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--v2-accent)] v2-dot" />
            <span>waitlist open</span>
          </span>
          <a href="#how" className="transition-colors hover:text-[var(--v2-ink)]">
            how it works
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
          <h1 className="v2-reveal mt-6 font-display text-[clamp(3.2rem,9.5vw,8.2rem)] leading-[0.92] tracking-[-0.02em] text-[var(--v2-ink)]">
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
            className="v2-reveal mt-10 max-w-[34ch] text-[1.05rem] leading-[1.55] text-[var(--v2-ink-dim)] sm:text-[1.15rem]"
            style={{ transitionDelay: "120ms" }}
          >
            Feed it 10 posts. It learns your voice. Then it drafts and publishes to{" "}
            <span className="text-[var(--v2-ink)]">X</span> &{" "}
            <span className="text-[var(--v2-ink)]">Threads</span>{" "}
            — no AI smell.
          </p>

          <div
            id="waitlist"
            className="v2-reveal mt-12 max-w-[36rem]"
            style={{ transitionDelay: "200ms" }}
          >
            <WaitlistForm source="hero" variant="dark" />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--v2-ink-faint)]">
              one email when early access opens · no spam
            </p>
          </div>

          <ul
            className="v2-reveal mt-14 grid max-w-[36rem] gap-0 border-t border-[var(--v2-line)] font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--v2-ink-dim)] sm:grid-cols-3"
            style={{ transitionDelay: "280ms" }}
          >
            {[
              "trained on your posts",
              "one-tap publish",
              "zero AI smell",
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
                what
              </div>
              <p className="mt-3 font-display text-2xl leading-tight text-[var(--v2-ink)]">
                AI ghost-writing that actually sounds like{" "}
                <em className="text-[var(--v2-accent)]">you</em>.
              </p>
            </div>
            <div className="border-l border-[var(--v2-line-strong)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                who
              </div>
              <p className="mt-3 text-[15px] leading-[1.5] text-[var(--v2-ink-dim)]">
                Founders, creators, and anyone with a voice worth amplifying.
              </p>
            </div>
            <div className="border-l border-[var(--v2-line-strong)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
                when
              </div>
              <p className="mt-3 text-[15px] leading-[1.5] text-[var(--v2-ink-dim)]">
                Days, not months. Shipping soon.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ---------- SHADER BACKDROP ---------- */

function ShaderBackdrop() {
  const turbRef = useRef<SVGFETurbulenceElement | null>(null);

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
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-[0.35] v2-grid-bg" />
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

        <g style={{ mixBlendMode: "screen", opacity: 0.45 }}>
          <rect width="1200" height="900" fill="url(#v2-blob-1)" />
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(10,10,10,0.4) 70%, #0a0a0a 100%)",
        }}
      />
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

/* ---------- MARQUEE ---------- */

function Marquee() {
  const phrases = [
    "EXCITED TO SHARE",
    "IN TODAY'S FAST-PACED WORLD",
    "GAME-CHANGING",
    "UNLOCK THE POWER OF",
    "LET THAT SINK IN",
    "HOT TAKE:",
    "DEEP DIVE",
    "REVOLUTIONIZE",
    "LEVERAGE SYNERGIES",
    "DISRUPTING THE SPACE",
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
        <span>words we will never write for you</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="v2-marquee flex w-max">
          {Row}
          {Row}
        </div>
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
        <div className="v2-reveal">
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
            other AI writes like a{" "}
            <span className="italic text-[var(--v2-accent)]">linkedin intern.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-[1.6] text-[var(--v2-ink-dim)]">
            Same cadence. Same cliches. Same hashtag spray. Audiences smell it instantly.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] sm:grid-cols-2">
          {/* before */}
          <article className="v2-reveal relative bg-[#0c0c0b] p-8 sm:p-10">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              <span>other AI tools</span>
              <span>✕</span>
            </div>
            <p className="mt-8 font-display text-[1.55rem] leading-[1.35] italic text-[var(--v2-ink-dim)]">
              Excited to share a powerful insight today! In today&apos;s fast-paced
              world, debugging has become more crucial than ever. Here are 5 game-changing
              strategies that will revolutionize how you tackle bugs.
              <br />
              <br />
              <span className="text-[var(--v2-ink-faint)]">
                #DevLife #ProductivityHacks #Coding
              </span>
            </p>
          </article>

          {/* after */}
          <article className="v2-reveal relative bg-[#111110] p-8 sm:p-10">
            <div
              aria-hidden
              className="absolute left-0 top-0 h-full w-[3px] bg-[var(--v2-accent)]"
            />
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-accent)]">
              <span>tweetforme</span>
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
      body: "Paste 10-20 of your past posts. We extract your tone, vocab, and rhythm.",
    },
    {
      n: "02",
      title: "Drop in an idea",
      body: "A sentence, a link, a screenshot. Get back 5 drafts for X and Threads — in your voice.",
    },
    {
      n: "03",
      title: "Publish",
      body: "One tap to post live. Or edit, schedule, or queue. You decide.",
    },
  ];
  return (
    <section id="how" className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="v2-reveal">
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
            how it <span className="italic text-[var(--v2-accent)]">works</span>.
          </h2>
        </div>

        <div className="mt-16 grid gap-px border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] md:grid-cols-3">
          {steps.map((s, idx) => (
            <article
              key={s.n}
              className="v2-reveal group relative flex flex-col bg-[#0c0c0b] p-8 transition-colors hover:bg-[#111110] sm:p-10"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <span className="font-display text-[5rem] italic leading-none text-[var(--v2-accent)]/85">
                {s.n}
              </span>
              <h3 className="mt-8 font-display text-[1.8rem] leading-[1.1] text-[var(--v2-ink)]">
                {s.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.6] text-[var(--v2-ink-dim)]">
                {s.body}
              </p>
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
      t: "founders",
      b: "X is the founder watering hole. You know it — you still don't post.",
    },
    {
      t: "creators & coaches",
      b: "Threads is the new growth channel. Your audience is already there.",
    },
    {
      t: "newsletter writers",
      b: "Your essays do the thinking. We turn them into daily distribution.",
    },
  ];
  return (
    <section className="relative border-b border-[var(--v2-line)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <div className="v2-reveal">
          <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em] text-[var(--v2-ink)]">
            for people who hate posting{" "}
            <span className="italic text-[var(--v2-accent)]">but should.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-px border border-[var(--v2-line-strong)] bg-[var(--v2-line-strong)] md:grid-cols-3">
          {personas.map((p, i) => (
            <article
              key={p.t}
              className="v2-reveal relative flex flex-col gap-6 bg-[#0c0c0b] p-8 transition-colors hover:bg-[#111110] sm:p-10"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
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


/* ---------- FINAL CTA ---------- */

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--v2-line)] py-28 sm:py-40">
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
        <h2 className="v2-reveal font-display text-[clamp(3rem,8.5vw,7.5rem)] leading-[0.92] tracking-[-0.02em] text-[var(--v2-ink)]">
          stop ghosting
          <br />
          <span className="italic text-[var(--v2-accent)]">your own brand.</span>
        </h2>


        <div
          className="v2-reveal mt-12 max-w-[36rem]"
          style={{ transitionDelay: "180ms" }}
        >
          <WaitlistForm source="final-cta" variant="dark" />
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
            </div>
            <p className="mt-4 max-w-md font-display text-[1.3rem] italic leading-[1.3] text-[var(--v2-ink-dim)]">
              your voice, automated.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)]">
              links
            </div>
            <ul className="mt-3 space-y-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--v2-ink-dim)]">
              <li>
                <a
                  href="#waitlist"
                  className="transition-colors hover:text-[var(--v2-ink)]"
                >
                  → waitlist
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
                waitlist open
              </li>
              <li>v0.1 building</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[var(--v2-line)] pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--v2-ink-faint)] sm:flex-row sm:items-center">
          <span>© 2026 tweetforme</span>
        </div>
      </div>
    </footer>
  );
}
