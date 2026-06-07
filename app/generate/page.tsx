import GenerateFlow from "@/components/generate/GenerateFlow";
import Link from "next/link";

export const metadata = {
  title: "Generate · echo",
};

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <nav className="mb-8 flex items-center justify-between text-sm">
        <Link href="/train" className="text-ink-600 hover:text-ink-900">
          ← back to train
        </Link>
        <span className="text-ink-400">step 2 / 2 · generate</span>
      </nav>

      <h1 className="font-display text-4xl sm:text-5xl">drop a raw idea.</h1>
      <p className="mt-3 max-w-xl text-ink-600">
        We'll turn it into X, Threads, and LinkedIn drafts in your voice.
        Publish to Threads & LinkedIn, or open in compose. (X publishing is coming soon.)
      </p>

      <div className="mt-8">
        <GenerateFlow />
      </div>
    </main>
  );
}
