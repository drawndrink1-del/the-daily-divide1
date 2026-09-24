'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminToken } from './AdminShell';

export interface AdminQuestion { id: string; date: string; prompt: string; optionATitle: string; optionADetail: string; optionBTitle: string; optionBDetail: string; published: boolean; }

export function QuestionForm({ initial }: { initial?: AdminQuestion }) {
  const router = useRouter();
  const token = useAdminToken();
  const [form, setForm] = useState({ date: initial?.date ?? '', prompt: initial?.prompt ?? '', optionATitle: initial?.optionATitle ?? '', optionADetail: initial?.optionADetail ?? '', optionBTitle: initial?.optionBTitle ?? '', optionBDetail: initial?.optionBDetail ?? '', published: initial?.published ?? false });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const update = (key: string, value: string | boolean) => setForm(current => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null);
    const response = await fetch(initial ? `/api/admin/questions/${initial.id}` : '/api/admin/questions', { method: initial ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error ?? 'Unable to save question.'); setSaving(false); return; }
    router.push('/admin'); router.refresh();
  }

  return <form onSubmit={submit} className="max-w-3xl space-y-5 border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8"><Field label="Date" type="date" value={form.date} onChange={value => update('date', value)} /><Field label="Question" value={form.prompt} onChange={value => update('prompt', value)} /><Field label="Option A title" value={form.optionATitle} onChange={value => update('optionATitle', value)} /><Field label="Option A description" value={form.optionADetail} onChange={value => update('optionADetail', value)} /><Field label="Option B title" value={form.optionBTitle} onChange={value => update('optionBTitle', value)} /><Field label="Option B description" value={form.optionBDetail} onChange={value => update('optionBDetail', value)} /><label className="flex items-center gap-3 text-sm text-zinc-300"><input type="checkbox" checked={form.published} onChange={event => update('published', event.target.checked)} /> Published</label>{error && <p role="alert" className="border border-amber-400/30 bg-amber-400/5 px-3 py-3 text-sm text-amber-100">{error}</p>}<button disabled={saving} className="bg-zinc-100 px-5 py-3 text-xs font-bold tracking-[.12em] text-zinc-950 hover:bg-amber-300 disabled:opacity-40">{saving ? 'SAVING...' : 'SAVE QUESTION'}</button></form>;
}

function Field({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm text-zinc-400">{label}<input required type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-amber-300" /></label>; }
