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
        Paste 10–20 of your past tweets or Threads posts. We'll extract your
        tone, vocabulary, sentence shapes, and signature moves. Stored
        locally in your browser — yours to export anytime.
      </p>

      <div className="mt-8">
        <TrainFlow />
      </div>
    </main>
  );
}
