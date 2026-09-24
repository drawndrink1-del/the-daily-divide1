import { Question } from './types';

export const questionLibrary: Question[] = [
  {
    id: 'divide-2026-09-24',
    date: '2026-09-24',
    prompt: 'Would you rather relive one day from your past whenever you want, or preview one day from your future?',
    optionA: { key: 'A', eyebrow: 'OPTION A', title: 'RELIVE ONE DAY', detail: 'Experience one day from your past exactly as it happened.', color: '#f59e0b' },
    optionB: { key: 'B', eyebrow: 'OPTION B', title: 'PREVIEW ONE DAY', detail: 'See one day from your future before it happens.', color: '#818cf8' }
  }
];

export function getCalendarDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDate(date: string | Date): string {
  return typeof date === 'string' ? date : getCalendarDate(date);
}

export function getQuestionForDate(date: string | Date): Question | null {
  const calendarDate = normalizeDate(date);
  return questionLibrary.find(question => question.date === calendarDate) ?? null;
}

export function getCurrentQuestion(date: Date = new Date()): Question | null {
  return getQuestionForDate(date);
}

export function getQuestionById(id: string): Question | null {
  return questionLibrary.find(question => question.id === id) ?? null;
}

export function getArchiveQuestions(date: string | Date = new Date()): Question[] {
  const calendarDate = normalizeDate(date);
  return questionLibrary.filter(question => question.date < calendarDate);
}

export function getDayNumber(date: string | Date): number {
  const calendarDate = normalizeDate(date);
  const firstQuestion = questionLibrary[0];
  if (!firstQuestion) return 0;

  const [firstYear, firstMonth, firstDay] = firstQuestion.date.split('-').map(Number);
  const [year, month, day] = calendarDate.split('-').map(Number);
  const firstTimestamp = Date.UTC(firstYear, firstMonth - 1, firstDay);
  const timestamp = Date.UTC(year, month - 1, day);
  return Math.floor((timestamp - firstTimestamp) / 86400000) + 1;
}

export function formatQuestionDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}
