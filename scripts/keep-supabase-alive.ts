import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function pingSupabase() {
  try {
    // Simple request: fetch current timestamp from server
    await supabase.rpc('now')
    // If you don't have a 'now' function, you can use a simple select:
    // await supabase.from('your_table').select('id').limit(1)
    console.log(`[${new Date().toISOString()}] Supabase pinged successfully.`)
  } catch (err) {
    console.error('Error pinging Supabase:', err)
  }
}

setInterval(pingSupabase, 5 * 60 * 1000) // every 5 minutes
pingSupabase()
