import TrainFlow from "@/components/voice/TrainFlow";
import Link from "next/link";

export const metadata = {
  title: "Train your voice · echo",
};

export default function TrainPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <nav className="mb-8 flex items-center justify-between text-sm">
        <Link href="/" className="text-ink-600 hover:text-ink-900">
          ← back
        </Link>
        <span className="text-ink-400">step 1 / 2 · train</span>
      </nav>

      <h1 className="font-display text-4xl sm:text-5xl">teach it your voice.</h1>
      <p className="mt-3 max-w-xl text-ink-600">
        Three ways in: paste anything you&apos;ve written, connect Threads, or — if
        you don&apos;t post much — answer 4 quick prompts. We learn your tone,
        vocabulary, and signature moves. Stored locally in your browser.
      </p>

      <div className="mt-8">
        <TrainFlow />
      </div>
    </main>
  );
}
