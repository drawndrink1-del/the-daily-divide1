import { getCalendarDate } from './questions';
import { Choice, Vote } from './types';

function seededRandom(seed: number) { const value = Math.sin(seed * 9301 + 49297) * 49297; return value - Math.floor(value); }

export function generateMockVotes(total = 600, questionDate = getCalendarDate()): Vote[] {
  const [year, month, day] = questionDate.split('-').map(Number);
  return Array.from({ length: total }, (_, index) => {
    const choice: Choice = seededRandom(index + 1) < 0.58 ? 'A' : 'B';
    const confidence = Math.max(1, Math.min(10, Math.round((choice === 'A' ? 7.2 : 6.5) + (seededRandom(index + 7) - 0.5) * 4)));
    const decisionTimeMs = Math.round(Math.max(240, (choice === 'A' ? 2600 : 3500) + (seededRandom(index + 17) - 0.5) * 5200 + (confidence < 5 ? 2200 : 0)));
    const timestamp = new Date(Date.UTC(year, month - 1, day, 8 + (index % 12), index % 60, index % 60)).toISOString();
    return { id: `mock-${index + 1}`, choice, confidence, decisionTimeMs, createdAt: timestamp };
  });
}
