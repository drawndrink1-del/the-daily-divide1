'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;

    let active = true;
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(async ({ data }) => {
      const accessToken = data.session?.access_token;
      if (!accessToken) { router.replace('/admin/login'); return; }
      const response = await fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!active) return;
      if (response.status === 401) { setChecking(false); return; }
      setToken(accessToken);
      setAuthorized(response.ok);
      setChecking(false);
    }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (checking) return <main className="min-h-screen px-5 py-20"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-zinc-500">Checking access...</p></main>;
  if (!authorized || !token) return <main className="min-h-screen px-5 py-20"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-amber-300">Admin access denied.</p><button type="button" onClick={() => router.replace('/admin/login')} className="mt-5 text-sm text-zinc-400 underline underline-offset-4">Return to login</button></main>;
  return <AdminContext.Provider value={token}>{children}</AdminContext.Provider>;
}

const AdminContext = createContext<string | null>(null);
export function useAdminToken() { return useContext(AdminContext); }
