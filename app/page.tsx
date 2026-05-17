import WaitlistForm from "@/components/WaitlistForm";

export default function HomePage() {
  return (
    <main className="min-h-screen text-ink-900">
      <TopBar />
      <Hero />
      <Comparison />
      <HowItWorks />
      <ForWho />
      <Roadmap />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ---------- top bar ---------- */

function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-900/10 bg-ink-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="/" className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Logo />
          <span className="font-semibold">tweetforme</span>
        </a>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden items-center gap-2 sm:flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
            <span className="text-ink-600">building in public · 3-hour sprint</span>
          </span>
          <a
            href="#waitlist"
            className="rounded-full border border-ink-900 bg-ink-900 px-3 py-1.5 text-white hover:bg-ink-800"
          >
            get early access
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5l8 8 8-8" />
        <path d="M4 12l8 8 8-8" />
      </svg>
    </span>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-16 pb-10 sm:pt-24 sm:pb-16">
      <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-white px-3 py-1 text-xs uppercase tracking-widest text-ink-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            waitlist open
          </span>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            your voice.
            <br />
            <span className="italic text-accent">on autopilot.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-600 sm:text-xl">
            Paste 10 of your best posts. We learn your voice, then draft and publish to{" "}
            <strong className="text-ink-900">X</strong> and{" "}
            <strong className="text-ink-900">Threads</strong> — without the AI smell.
          </p>

          <div id="waitlist" className="mt-8 max-w-lg">
            <WaitlistForm source="hero" />
            <p className="mt-3 text-xs text-ink-400">
              No spam. One email when early access opens. Unsubscribe in one click.
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
            <li className="flex items-center gap-2">
              <Check /> Trained on your past posts
            </li>
            <li className="flex items-center gap-2">
              <Check /> One-tap publish to X + Threads
            </li>
            <li className="flex items-center gap-2">
              <Check /> Anti-AI-smell, by default
            </li>
          </ul>
        </div>

        <DemoCard />
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l4 4 8-9" />
    </svg>
  );
}

function DemoCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rotate-1 rounded-3xl bg-accent-soft" />
      <div className="rounded-3xl border-2 border-ink-900 bg-white p-5 shadow-[10px_10px_0_0_#0e0e0c]">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink-400">
          <span>live demo · draft #3</span>
          <span className="flex items-center gap-1.5 text-accent">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
            in your voice
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-ink-50 p-4">
          <div className="flex items-center gap-2 text-xs text-ink-600">
            <span className="rounded-md bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              X
            </span>
            <span>270 / 280</span>
          </div>
          <p className="mt-3 text-[15px] leading-snug">
            spent 3 hours debugging a bug that wasn't a bug. it was a typo.
            <br />
            the typo was in the documentation I wrote yesterday.
            <br />
            <span className="text-ink-400">soft launch of a humility era.</span>
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-ink-50 p-4">
          <div className="flex items-center gap-2 text-xs text-ink-600">
            <span className="rounded-md bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
              Threads
            </span>
            <span>cross-posted variant</span>
          </div>
          <p className="mt-3 text-[15px] leading-snug">
            most "production bugs" are 1 of 3 things:
            <br />
            — you misread your own code
            <br />
            — you misread someone else's code
            <br />— you typed something at midnight and trusted yourself
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-ink-400">trained on 14 of your past posts</span>
          <span className="flex items-center gap-1 font-medium text-ink-900">
            ready to publish →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- comparison ---------- */

function Comparison() {
  return (
    <section className="border-y border-ink-900/10 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl">
          everyone else writes like a LinkedIn intern.
        </h2>
        <p className="mt-3 max-w-2xl text-ink-600">
          Generic AI writers all have the same tells. We trained ours to do the opposite.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <div className="text-xs uppercase tracking-widest text-ink-400">
              what other AI tools spit out
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              🚀 Excited to share a powerful insight today! In today's
              fast-paced world, debugging has become more crucial than ever.
              Here are 5 game-changing strategies that will revolutionize how
              you tackle bugs. 👇
              <br />
              <br />
              #DevLife #ProductivityHacks #Coding
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-widest">
              <Pill>🚀 rocket emoji</Pill>
              <Pill>"in today's world"</Pill>
              <Pill>"game-changing"</Pill>
              <Pill>hashtag spray</Pill>
            </div>
          </article>

          <article className="rounded-2xl border-2 border-ink-900 bg-white p-6">
            <div className="text-xs uppercase tracking-widest text-accent">
              what tweetforme writes for you
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">
              spent 3 hours debugging a bug that wasn't a bug.
              <br />
              it was a typo.
              <br />
              the typo was in the documentation I wrote yesterday.
              <br />
              <br />
              soft launch of a humility era.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-widest">
              <Pill on>lowercase, like you</Pill>
              <Pill on>real punchline</Pill>
              <Pill on>your sentence rhythm</Pill>
              <Pill on>zero hashtags</Pill>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Pill({ children, on = false }: { children: React.ReactNode; on?: boolean }) {
  return (
    <span
      className={
        on
          ? "rounded-full border border-ink-900 bg-ink-900 px-2.5 py-1 text-white"
          : "rounded-full border border-ink-200 bg-white px-2.5 py-1 text-ink-600"
      }
    >
      {children}
    </span>
  );
}

/* ---------- how it works ---------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Feed it your voice",
      body: "Paste 10–20 of your past posts. We extract your tone, vocab, sentence shapes, and signature moves. Takes ~30 seconds.",
    },
    {
      n: "02",
      title: "Drop in a raw idea",
      body: "A sentence, a link, a screenshot. We turn it into 3 X drafts (including a short thread) and 2 Threads variants — in your voice.",
    },
    {
      n: "03",
      title: "Hit publish",
      body: "Connect X + Threads once. One tap fires the post live. Or edit, or schedule, or queue. You decide what auto means.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <h2 className="font-display text-3xl sm:text-4xl">how it works</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-ink-900/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#0e0e0c]"
          >
            <div className="font-display text-5xl text-accent">{s.n}</div>
            <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
            <p className="mt-2 text-ink-600">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- for who ---------- */

function ForWho() {
  return (
    <section className="border-y border-ink-900/10 bg-ink-900 text-ink-50">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl text-white">
          built for the people who hate posting <em className="text-accent not-italic">but should</em>.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { t: "founders & indie hackers", b: "X is the founder watering hole. You know it; you still don't post." },
            { t: "creators & coaches", b: "Threads is the new growth channel. Your audience is already there." },
            { t: "newsletter writers", b: "Your essays already do the thinking. We just turn them into daily distribution." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-white/10 bg-ink-800 p-6">
              <h3 className="font-display text-2xl">{p.t}</h3>
              <p className="mt-2 text-ink-200">{p.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- roadmap teaser ---------- */

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
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl sm:text-4xl">what we're shipping</h2>
        <a className="text-sm text-ink-600 underline underline-offset-4 hover:text-ink-900" href="/PRD.md">
          read the full PRD →
        </a>
      </div>
      <ul className="mt-8 divide-y divide-ink-900/10 rounded-2xl border border-ink-900/10 bg-white">
        {items.map((i) => (
          <li key={i.v} className="flex items-center gap-4 px-5 py-4">
            <span
              className={`inline-flex h-6 w-14 items-center justify-center rounded-full text-xs font-semibold ${
                i.on ? "bg-accent text-white" : "bg-ink-100 text-ink-600"
              }`}
            >
              {i.v}
            </span>
            <span className={i.on ? "text-ink-900" : "text-ink-600"}>{i.t}</span>
            {i.on && (
              <span className="ml-auto text-xs uppercase tracking-widest text-accent">
                in progress
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- final CTA ---------- */

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="overflow-hidden rounded-3xl border-2 border-ink-900 bg-accent p-8 sm:p-14">
        <h2 className="font-display text-3xl text-white sm:text-5xl">
          stop ghost-posting your own brand.
        </h2>
        <p className="mt-3 max-w-xl text-white/90">
          Get early access. We're shipping in days, not months. First 100
          waitlisters get a lifetime founder rate.
        </p>
        <div className="mt-7 max-w-lg">
          <WaitlistForm source="final-cta" />
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="border-t border-ink-900/10 bg-ink-50">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 text-sm text-ink-600 sm:flex-row sm:items-center">
        <span className="flex items-center gap-2">
          <Logo />
          <span>tweetforme · built in 3 hours, shipped on autopilot.</span>
        </span>
        <span>
          made with{" "}
          <span className="text-accent">●</span> by a creator who got tired of
          posting.
        </span>
      </div>
    </footer>
  );
}
