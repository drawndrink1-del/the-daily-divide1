import { NextResponse } from 'next/server';
import { getPublicQuestionForDate } from '@/lib/publicQuestions';
import { getCalendarDate } from '@/lib/questions';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { checkVoteRateLimit } from '@/lib/rateLimit';
import { Choice, StoredVote } from '@/lib/types';

const MAX_BODY_BYTES = 1024;
const MAX_DECISION_TIME_MS = 86_400_000;

interface VoteRequest {
  questionId?: unknown;
  choice?: unknown;
  confidence?: unknown;
  decisionTimeMs?: unknown;
  voterId?: unknown;
}

function isChoice(value: unknown): value is Choice {
  return value === 'A' || value === 'B';
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function errorResponse(code: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: code }, { status, headers });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return errorResponse('INVALID_REQUEST', 400);

  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const rateLimitKey = forwardedFor || request.headers.get('x-real-ip') || 'unknown-client';
  const rateLimit = checkVoteRateLimit(rateLimitKey);
  if (!rateLimit.allowed) return errorResponse('RATE_LIMITED', 429, { 'Retry-After': String(rateLimit.retryAfterSeconds) });

  let body: VoteRequest;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) return errorResponse('INVALID_REQUEST', 400);
    body = JSON.parse(rawBody) as VoteRequest;
  } catch {
    return errorResponse('INVALID_REQUEST', 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) return errorResponse('INVALID_REQUEST', 400);
  const allowedKeys = ['questionId', 'choice', 'confidence', 'decisionTimeMs', 'voterId'];
  if (Object.keys(body).some(key => !allowedKeys.includes(key))) return errorResponse('INVALID_REQUEST', 400);

  const question = await getPublicQuestionForDate(getCalendarDate());
  if (!question || body.questionId !== question.id) return errorResponse('INVALID_QUESTION', 400);
  if (!isChoice(body.choice)) return errorResponse('INVALID_CHOICE', 400);
  if (!Number.isInteger(body.confidence) || Number(body.confidence) < 1 || Number(body.confidence) > 10) return errorResponse('INVALID_CONFIDENCE', 400);
  if (!Number.isInteger(body.decisionTimeMs) || Number(body.decisionTimeMs) < 0 || Number(body.decisionTimeMs) > MAX_DECISION_TIME_MS) return errorResponse('INVALID_DECISION_TIME', 400);
  if (!isUuid(body.voterId)) return errorResponse('INVALID_VOTER_ID', 400);

  try {
    const supabase = getSupabaseAdmin();
    const { data: questionRow, error: questionError } = await supabase.from('questions').select('id').eq('id', question.id).eq('date', question.date).maybeSingle();
    if (questionError) throw questionError;
    if (!questionRow) return errorResponse('INVALID_QUESTION', 400);

    const { data, error } = await supabase.from('votes').insert({
      question_id: question.id,
      choice: body.choice,
      confidence: body.confidence,
      decision_time_ms: body.decisionTimeMs,
      voter_id: body.voterId
    }).select('id, question_id, choice, confidence, decision_time_ms, created_at').single();

    if (error) {
      if (error.code === '23505') return errorResponse('ALREADY_VOTED', 409);
      throw error;
    }

    const vote: StoredVote = {
      id: data.id,
      questionId: data.question_id,
      choice: data.choice,
      confidence: data.confidence,
      decisionTimeMs: data.decision_time_ms,
      createdAt: data.created_at,
      isUser: true
    };
    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Vote submission failed:', error instanceof Error ? error.message : 'Unknown error');
    return errorResponse('VOTING_UNAVAILABLE', 503);
  }
}
