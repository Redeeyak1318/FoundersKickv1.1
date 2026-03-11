import { createClient } from '@supabase/supabase-js';

// ✅ public client (frontend-style usage)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// ✅ admin client (backend only)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export { supabase, supabaseAdmin };