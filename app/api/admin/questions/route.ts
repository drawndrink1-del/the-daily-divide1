import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { questionRowPayload, toAdminQuestion, validateQuestionInput, QuestionInput } from '@/lib/adminQuestions';
import { getSupabaseAdmin } from '@/lib/supabase/server';

function responseError(error: string, status: number) { return NextResponse.json({ error }, { status }); }

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return responseError('UNAUTHORIZED', 401);
  try {
    const { data, error } = await getSupabaseAdmin().from('questions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ questions: (data ?? []).map(row => toAdminQuestion(row)) });
  } catch { return responseError('QUESTIONS_UNAVAILABLE', 503); }
}

export async function POST(request: Request) {
  if (!await requireAdmin(request)) return responseError('UNAUTHORIZED', 401);
  let input: QuestionInput;
  try { input = await request.json() as QuestionInput; } catch { return responseError('INVALID_REQUEST', 400); }
  const validationError = validateQuestionInput(input);
  if (validationError) return responseError(validationError, 400);
  const id = `divide-${input.date}`;
  try {
    const { data, error } = await getSupabaseAdmin().from('questions').insert({ id, ...questionRowPayload(input) }).select('*').single();
    if (error) {
      if (error.code === '23505') return responseError('DATE_OR_ID_ALREADY_EXISTS', 409);
      throw error;
    }
    return NextResponse.json({ question: toAdminQuestion(data) }, { status: 201 });
  } catch { return responseError('QUESTION_CREATE_FAILED', 503); }
}
