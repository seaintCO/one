import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, business: null };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, business: null };

  const selection = 'id,name,preferred_language,stripe_connected_account_id';

  // Owners resolve directly.
  const owned = await supabase
    .from('businesses')
    .select(selection)
    .eq('owner_user_id', user.id)
    .maybeSingle();
  if (owned.data) return { supabase, user, business: owned.data };

  // Team members resolve through business_members. RLS still enforces access.
  const membership = await supabase
    .from('business_members')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership.data?.business_id) return { supabase, user, business: null };

  const memberBusiness = await supabase
    .from('businesses')
    .select(selection)
    .eq('id', membership.data.business_id)
    .maybeSingle();

  return { supabase, user, business: memberBusiness.data || null };
}
