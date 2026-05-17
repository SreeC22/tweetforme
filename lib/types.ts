export type VoiceProfile = {
  summary: string;
  tone: string[];
  vocabulary: string[];
  structures: string[];
  dos: string[];
  donts: string[];
  signature_moves: string[];
  example_openings: string[];
  // raw posts that were used for training, kept so we can re-train
  samples: string[];
  createdAt: string;
};

export type Platform = "x" | "threads";

export type Draft = {
  platform: Platform;
  text: string;
  // for X, if AI suggests a thread (multi-tweet), each item is one tweet
  thread?: string[];
  note?: string;
};

export type GenerateResponse = {
  drafts: Draft[];
};
