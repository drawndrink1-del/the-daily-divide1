'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminToken } from '@/components/admin/AdminShell';
import { AdminQuestion } from '@/components/admin/QuestionForm';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminPage() {
  const token = useAdminToken();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setQuestions(data.questions); }).catch(() => setError('Unable to load questions.')); }, [token]);
  return <main className="min-h-screen px-5 py-14 sm:py-20"><div className="mx-auto max-w-5xl"><AdminNav /><div className="flex items-end justify-between border-b border-zinc-800 pb-8"><div><p className="font-mono text-[10px] tracking-[.18em] text-amber-300">PRIVATE ADMIN</p><h1 className="mt-4 text-4xl font-medium text-zinc-100">Questions</h1></div><Link href="/admin/questions/new" className="bg-zinc-100 px-4 py-3 text-xs font-bold tracking-[.12em] text-zinc-950 hover:bg-amber-300">NEW QUESTION</Link></div>{error && <p className="mt-8 text-sm text-amber-200">{error}</p>}<div className="mt-8 space-y-3">{questions.map(question => <Link key={question.id} href={`/admin/questions/${question.id}`} className="block border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600"><div className="flex justify-between gap-4"><div><p className="font-mono text-[10px] text-zinc-600">{question.date}</p><h2 className="mt-2 text-lg text-zinc-200">{question.prompt}</h2></div><span className={`font-mono text-[10px] ${question.published ? 'text-amber-300' : 'text-zinc-600'}`}>{question.published ? 'PUBLISHED' : 'DRAFT'}</span></div></Link>)}</div></div></main>;
}
