import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zslouyxexjymvsxbjhjb.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ap6RUpsj4Rf3sxTRy9HILQ_YrarzPL-';

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseKey);
export const supabase = createClient();
export default supabase;
