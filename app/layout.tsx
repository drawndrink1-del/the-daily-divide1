import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { getDayNumber } from '@/lib/questions';
import { getPublicQuestionForDate } from '@/lib/publicQuestions';

export const metadata: Metadata = { title: 'The Daily Divide', description: 'A daily decision experiment measuring choice, confidence, and time.' };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const question = await getPublicQuestionForDate(); const dayNumber = question ? getDayNumber(question.date) : getDayNumber(new Date()); return <html lang="en"><body><Navigation dayNumber={dayNumber} />{children}</body></html>; }
