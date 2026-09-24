import { getSupabaseAdmin } from './supabase/server';

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data: userData } = await supabase.auth.getUser(token);
  const user = userData.user;
  if (!user) return null;

  const { data: adminUser } = await supabase.from('admin_users').select('id, user_id, email').eq('user_id', user.id).maybeSingle();
  return adminUser ? { user, adminUser } : null;
}
