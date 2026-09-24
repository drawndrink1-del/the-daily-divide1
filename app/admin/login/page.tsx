'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
    if (signInError) setError('Unable to sign in with those credentials.');
    else router.replace('/admin');
    setLoading(false);
  }

  return <main className="min-h-screen px-5 py-20"><div className="mx-auto max-w-md border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8"><p className="font-mono text-[10px] tracking-[.18em] text-amber-300">PRIVATE ACCESS</p><h1 className="mt-5 text-3xl font-medium text-zinc-100">Admin login</h1><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm text-zinc-400">Email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-amber-300" /></label><label className="block text-sm text-zinc-400">Password<input required type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-100 outline-none focus:border-amber-300" /></label>{error && <p role="alert" className="border border-amber-400/30 bg-amber-400/5 px-3 py-3 text-sm text-amber-100">{error}</p>}<button disabled={loading} className="w-full bg-zinc-100 px-4 py-3 text-xs font-bold tracking-[.12em] text-zinc-950 transition hover:bg-amber-300 disabled:opacity-40">{loading ? 'SIGNING IN...' : 'SIGN IN'}</button></form></div></main>;
}
