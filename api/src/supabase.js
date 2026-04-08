const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

/** Supabase client using the anon key (client-context / RLS-aware). */
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

/** Supabase client using the service role key (bypasses RLS). */
const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

module.exports = { supabase, supabaseAdmin };
