import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    const { data, error } = await getSupabaseAdmin().from('questions').select('id, date, prompt, published').eq('published', true).order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ questions: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'QUESTIONS_UNAVAILABLE' }, { status: 503 });
  }
}
