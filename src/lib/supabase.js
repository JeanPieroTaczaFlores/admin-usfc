import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rkxvkhwdmuqxnbdniqvl.supabase.co'
const SUPABASE_ANON = 'sb_publishable_I3fkp6sY_bXR524O1kMLxw_4J-DHMj4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
