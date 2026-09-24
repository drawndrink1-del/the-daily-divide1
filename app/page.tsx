import { DailyDivide } from '@/components/question/DailyDivide';
import { Footer } from '@/components/layout/Navigation';
import { getPublicQuestionForDate } from '@/lib/publicQuestions';
export default async function HomePage() { const question = await getPublicQuestionForDate(); return <><DailyDivide question={question} /><Footer /></>; }
