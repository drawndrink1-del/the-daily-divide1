import { QuestionRow } from './questionDatabase';

export interface QuestionInput {
  date?: unknown;
  prompt?: unknown;
  optionATitle?: unknown;
  optionADetail?: unknown;
  optionBTitle?: unknown;
  optionBDetail?: unknown;
  published?: unknown;
}

export function validateQuestionInput(input: QuestionInput) {
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return 'INVALID_DATE';
  const parsedDate = new Date(`${input.date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== input.date) return 'INVALID_DATE';
  if ([input.prompt, input.optionATitle, input.optionADetail, input.optionBTitle, input.optionBDetail].some(value => typeof value !== 'string' || !value.trim())) return 'INVALID_CONTENT';
  if (input.published !== undefined && typeof input.published !== 'boolean') return 'INVALID_PUBLISHED';
  return null;
}

export function questionRowPayload(input: QuestionInput) {
  return {
    date: input.date,
    prompt: (input.prompt as string).trim(),
    option_a_title: (input.optionATitle as string).trim(),
    option_a_detail: (input.optionADetail as string).trim(),
    option_b_title: (input.optionBTitle as string).trim(),
    option_b_detail: (input.optionBDetail as string).trim(),
    ...(input.published === undefined ? {} : { published: input.published })
  };
}

export function toAdminQuestion(row: QuestionRow) {
  return {
    id: row.id,
    date: row.date,
    prompt: row.prompt,
    optionATitle: row.option_a_title,
    optionADetail: row.option_a_detail,
    optionBTitle: row.option_b_title,
    optionBDetail: row.option_b_detail,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
