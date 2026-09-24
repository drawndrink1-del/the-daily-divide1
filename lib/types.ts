export type Choice = 'A' | 'B';

export interface Vote {
  id: string;
  choice: Choice;
  confidence: number;
  decisionTimeMs: number;
  createdAt: string;
  isUser?: boolean;
}

export interface Question {
  id: string;
  date: string;
  prompt: string;
  optionA: { key: Choice; eyebrow: string; title: string; detail: string; color: string };
  optionB: { key: Choice; eyebrow: string; title: string; detail: string; color: string };
}

export interface SpeedBucket { label: string; minMs: number; maxMs: number; count: number; percentage: number; }
export interface ChoiceStats { count: number; percentage: number; averageConfidence: number; averageSpeedMs: number; }
export interface DivideStats {
  total: number;
  choices: Record<Choice, ChoiceStats>;
  averageConfidence: number;
  medianSpeedMs: number;
  speedBuckets: SpeedBucket[];
  fasterThanPercentage: number;
  fastestSplitPercentage: number;
  confidenceLiftPercentage: number;
  quadrantCounts: Record<string, number>;
}
export interface StoredVote extends Vote { questionId: string; }
