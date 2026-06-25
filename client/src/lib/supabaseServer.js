import { createClient } from '@supabase/supabase-js';

// Service role client — only used in API routes (server-side), never exposed to browser
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env variable');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
