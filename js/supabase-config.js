// Add these values later from Supabase Project Settings > API.
// Use the anon/publishable key in the browser. Never expose the service_role key.
const SUPABASE_URL = 'https://amridlfrxkkujasrkshz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nkQl1GCDFy3plLW78yKIVg_igwjqWWn';
var SUPABASE_FARM_ID = '';

// Allow the local Node API to reuse the same public Supabase configuration.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPABASE_URL, SUPABASE_ANON_KEY };
}


