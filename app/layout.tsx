import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tweetforme — your voice. on autopilot.",
  description:
    "Paste 10 of your best posts. We learn your voice, then draft and publish to X & Threads — without the AI smell.",
  openGraph: {
    title: "tweetforme",
    description:
      "Personal-brand posts in your voice, auto-published to X & Threads.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen grain">{children}</body>
    </html>
  );
}
