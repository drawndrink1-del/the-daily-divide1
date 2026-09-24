import { getCalendarDate, getQuestionForDate } from './questions';
import { getPublishedQuestionForDate, getPublishedQuestionsBefore } from './questionDatabase';
import { Question } from './types';

export async function getPublicQuestionForDate(date: string | Date = new Date()): Promise<Question | null> {
  const calendarDate = typeof date === 'string' ? date : getCalendarDate(date);
  try {
    return await getPublishedQuestionForDate(calendarDate);
  } catch {
    return getQuestionForDate(calendarDate);
  }
}

export async function getPublicArchiveQuestions(date: string | Date = new Date()): Promise<Question[]> {
  const calendarDate = typeof date === 'string' ? date : getCalendarDate(date);
  try {
    return await getPublishedQuestionsBefore(calendarDate);
  } catch {
    return [];
  }
}
