"use client";

import { useEffect } from "react";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import LiveCount from "@/components/LiveCount";

/* =========================================================================
   echo — waitlist landing page
   Editorial light theme. Generous type, high contrast, plain English.
   ========================================================================= */

export default function HomePage() {
  // Reveal-on-scroll: add .revealed when elements enter viewport.
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <TopBar />
      <Hero />
      <ValueProp />
      <HowItWorks />
      <ForWho />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ---------- top bar ---------- */

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--rule)] bg-[color:var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4 sm:px-10">
        <a
          href="/"
          className="font-display text-[1.45rem] leading-none text-[color:var(--ink)]"
          aria-label="echo home"
        >
          echo
        </a>
        <span className="hidden items-center gap-2 text-sm text-[color:var(--ink-mute)] sm:flex">
          <span className="echo-dot" aria-hidden />
          Waitlist is open
        </span>
        <a href="#waitlist" className="btn-primary text-sm">
          Join the waitlist
        </a>
      </div>
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[color:var(--rule)]">
      <div className="hero-glow" aria-hidden />

      <div className="relative mx-auto max-w-[820px] px-6 pt-20 pb-24 text-center sm:px-10 sm:pt-28 sm:pb-32">
        <p className="reveal text-sm font-medium text-[color:var(--ink-mute)]">
          For people who hate posting but know they should.
        </p>

        <h1 className="reveal mx-auto mt-6 font-display text-[clamp(2.6rem,7vw,5.4rem)] leading-[1.02] text-[color:var(--ink)]">
          Your writing voice,
          <br />
          on{" "}
          <span className="accent-underline">
            autopilot
            <AccentUnderline />
          </span>
          .
        </h1>

        <p
          className="reveal mx-auto mt-7 max-w-[34rem] text-[1.1rem] leading-[1.65] text-[color:var(--ink-soft)] sm:text-[1.18rem]"
          style={{ transitionDelay: "120ms" }}
        >
          echo learns how you actually write from your past posts, then drafts
          and publishes new ones to X and Threads — so you sound like you,
          without spending an hour a day on it.
        </p>

        <div
          id="waitlist"
          className="reveal mx-auto mt-10 max-w-[30rem]"
          style={{ transitionDelay: "200ms" }}
        >
          <WaitlistForm source="hero" />
          <p className="mt-4 text-sm text-[color:var(--ink-mute)]">
            <LiveCount /> No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}

function AccentUnderline() {
  return (
    <svg viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden>
      <path
        d="M2 9 C 30 0, 60 14, 90 6 S 150 0, 180 8 S 210 14, 218 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- value prop / why echo ---------- */

function ValueProp() {
  return (
    <section className="relative border-b border-[color:var(--rule)] bg-[color:var(--bg-sunk)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
        <div className="reveal mx-auto max-w-[40rem] text-center">
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] text-[color:var(--ink)]">
            Other AI writers all sound the same.
          </h2>
          <p className="mx-auto mt-5 max-w-[36rem] text-[1.05rem] leading-[1.7] text-[color:var(--ink-soft)]">
            You can spot a generic AI post in three words — the cadence, the
            cliches, the rocket emoji. echo does the opposite: it studies what
            already works for you and writes more of that.
          </p>
        </div>

        <div className="reveal mt-14 grid gap-5 sm:grid-cols-2 sm:gap-7">
          <article className="rounded-2xl border border-[color:var(--rule-strong)] bg-[color:var(--bg-elev)] p-7 sm:p-9">
            <p className="text-sm font-medium text-[color:var(--ink-mute)]">
              A typical AI draft
            </p>
            <p className="mt-4 font-display text-[1.3rem] leading-[1.5] text-[color:var(--ink-soft)] sm:text-[1.4rem]">
              &ldquo;Excited to share a powerful insight today. In today&apos;s
              fast-paced world, debugging has become more crucial than ever.
              Here are 5 game-changing strategies that will revolutionize how
              you tackle bugs.&rdquo;
            </p>
            <p className="mt-3 text-sm text-[color:var(--ink-mute)]">
              You can smell it from a mile away.
            </p>
          </article>

          <article className="relative rounded-2xl border border-[color:var(--accent)] bg-[color:var(--bg-elev)] p-7 sm:p-9 shadow-[0_1px_0_0_var(--accent)]">
            <p className="text-sm font-medium text-[color:var(--accent)]">
              A draft from echo (in your voice)
            </p>
            <p className="mt-4 font-display text-[1.3rem] leading-[1.5] text-[color:var(--ink)] sm:text-[1.4rem]">
              &ldquo;Spent 3 hours debugging what turned out to be a typo. The
              typo was in the documentation I wrote yesterday. Soft launch of a
              humility era.&rdquo;
            </p>
            <p className="mt-3 text-sm text-[color:var(--ink-mute)]">
              Sounds like a person. Sounds like you.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- how it works ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Feed it your voice",
      body: "Paste 10 to 20 of your past posts. echo studies your tone, vocabulary, and the kinds of sentences you tend to write. Takes about 30 seconds.",
    },
    {
      n: "2",
      title: "Drop in a raw idea",
      body: "A sentence, a link, a screenshot — anything. echo turns it into a handful of drafts for X (including a short thread) and Threads, all written in your voice.",
    },
    {
      n: "3",
      title: "Publish in one tap",
      body: "Connect X and Threads once. From then on, one tap sends a post live. Or edit it first. Or queue it for later. You stay in control.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative border-b border-[color:var(--rule)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
        <div className="reveal mx-auto max-w-[40rem] text-center">
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] text-[color:var(--ink)]">
            Three steps, then you&apos;re posting.
          </h2>
          <p className="mx-auto mt-5 max-w-[34rem] text-[1.05rem] leading-[1.7] text-[color:var(--ink-soft)]">
            No new social calendar. No content strategy template. Just a tool
            that does the part you already hate doing.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <li
              key={s.n}
              className="reveal rounded-2xl border border-[color:var(--rule)] bg-[color:var(--bg-elev)] p-7 sm:p-8"
              style={{ transitionDelay: `${idx * 90}ms` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent-soft)] font-display text-[1.4rem] text-[color:var(--accent)]">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-[1.65rem] leading-[1.15] text-[color:var(--ink)]">
                {s.title}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.65] text-[color:var(--ink-soft)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- who it's for ---------- */

function ForWho() {
  const personas = [
    {
      t: "Founders and indie hackers",
      b: "X is where founders gather. You know it — you just don't post. echo gets you back on the timeline without it eating your day.",
    },
    {
      t: "Creators and coaches",
      b: "Threads is the fastest-growing place to find your audience right now. echo keeps you showing up there in your own voice.",
    },
    {
      t: "Newsletter writers",
      b: "Your essays already do the hard thinking. echo turns each one into a week of short posts that pull readers back to your list.",
    },
  ];

  return (
    <section className="relative border-b border-[color:var(--rule)] bg-[color:var(--bg-sunk)] py-20 sm:py-28">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
        <div className="reveal mx-auto max-w-[40rem] text-center">
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.08] text-[color:var(--ink)]">
            Built for the people who should be posting.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:gap-7 md:grid-cols-3">
          {personas.map((p, i) => (
            <article
              key={p.t}
              className="reveal flex flex-col rounded-2xl border border-[color:var(--rule-strong)] bg-[color:var(--bg-elev)] p-7 sm:p-8"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <h3 className="font-display text-[1.55rem] leading-[1.2] text-[color:var(--ink)]">
                {p.t}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.65] text-[color:var(--ink-soft)]">
                {p.b}
              </p>
              <span
                aria-hidden
                className="mt-6 h-px w-10 bg-[color:var(--accent)]"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- final CTA ---------- */

function FinalCta() {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--rule)] py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(255, 91, 31, 0.08), transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-[760px] px-6 text-center sm:px-10">
        <h2 className="reveal font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05] text-[color:var(--ink)]">
          Stop ghosting your own audience.
        </h2>

        <p
          className="reveal mx-auto mt-6 max-w-[36rem] text-[1.08rem] leading-[1.7] text-[color:var(--ink-soft)] sm:text-[1.15rem]"
          style={{ transitionDelay: "100ms" }}
        >
          echo ships in the next few weeks. The first 100 people on the list
          get a lifetime founder rate when we open up.
        </p>

        <div
          className="reveal mx-auto mt-10 max-w-[30rem]"
          style={{ transitionDelay: "180ms" }}
        >
          <WaitlistForm source="final-cta" />
          <p className="mt-4 text-sm text-[color:var(--ink-mute)]">
            One email when early access opens. No spam, ever.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-3 text-sm text-[color:var(--ink-mute)] sm:flex-row sm:items-center">
          <span className="font-display text-[1.05rem] text-[color:var(--ink)]">
            echo
            <span className="ml-3 font-sans text-sm text-[color:var(--ink-mute)]">
              est. 2026
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="echo-dot" aria-hidden />
            Waitlist is open
          </span>
          <span>Made by a creator who got tired of posting.</span>
        </div>
      </div>
    </footer>
  );
}
