'use client';

import { useEffect, useState } from 'react';
import { QuestionForm, AdminQuestion } from '@/components/admin/QuestionForm';
import { useAdminToken } from '@/components/admin/AdminShell';

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const token = useAdminToken();
  const [question, setQuestion] = useState<AdminQuestion | null>(null);
  useEffect(() => { fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } }).then(response => response.json()).then(data => setQuestion(data.questions?.find((item: AdminQuestion) => item.id === params.id) ?? null)); }, [params.id, token]);
  if (!question) return <main className="min-h-screen px-5 py-20"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500">Loading question...</p></main>;
  return <main className="min-h-screen px-5 py-14 sm:py-20"><div className="mx-auto max-w-5xl"><p className="font-mono text-[10px] tracking-[.18em] text-amber-300">PRIVATE ADMIN</p><h1 className="mt-4 text-4xl font-medium text-zinc-100">Edit question</h1><div className="mt-8"><QuestionForm initial={question} /></div></div></main>;
}
