import Link from 'next/link';

export function AdminNav() {
  return <nav className="mb-8 flex flex-wrap gap-4 border-b border-zinc-800 pb-4 text-[10px] font-bold tracking-[.12em] text-zinc-500"><Link href="/admin" className="hover:text-zinc-200">QUESTIONS</Link><Link href="/admin/analytics" className="hover:text-zinc-200">ANALYTICS</Link></nav>;
}
