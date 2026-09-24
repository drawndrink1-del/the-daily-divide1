import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { questionRowPayload, toAdminQuestion, validateQuestionInput, QuestionInput } from '@/lib/adminQuestions';
import { getSupabaseAdmin } from '@/lib/supabase/server';

function responseError(error: string, status: number) { return NextResponse.json({ error }, { status }); }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin(request)) return responseError('UNAUTHORIZED', 401);
  let input: QuestionInput;
  try { input = await request.json() as QuestionInput; } catch { return responseError('INVALID_REQUEST', 400); }
  const validationError = validateQuestionInput(input);
  if (validationError) return responseError(validationError, 400);
  try {
    const { data, error } = await getSupabaseAdmin().from('questions').update(questionRowPayload(input)).eq('id', params.id).select('*').maybeSingle();
    if (error) {
      if (error.code === '23505') return responseError('DATE_ALREADY_EXISTS', 409);
      throw error;
    }
    if (!data) return responseError('QUESTION_NOT_FOUND', 404);
    return NextResponse.json({ question: toAdminQuestion(data) });
  } catch { return responseError('QUESTION_UPDATE_FAILED', 503); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin(request)) return responseError('UNAUTHORIZED', 401);
  try {
    const { error } = await getSupabaseAdmin().from('questions').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch { return responseError('QUESTION_DELETE_FAILED', 503); }
}
