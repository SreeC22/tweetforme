export type VoiceProfile = {
  summary: string;
  tone: string[];
  vocabulary: string[];
  structures: string[];
  dos: string[];
  donts: string[];
  signature_moves: string[];
  example_openings: string[];
  samples: string[];
  createdAt: string;
};

export type Platform = "x" | "threads" | "linkedin";

export type Draft = {
  platform: Platform;
  text: string;
  thread?: string[];
  note?: string;
};

export type GenerateResponse = {
  drafts: Draft[];
};
