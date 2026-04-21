import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qtvfabrorwdjubkmskvy.supabase.co'   // from your dashboard
const SUPABASE_KEY = 'sb_publishable_u4KUniWuigY8nYB_Lxtigw_X1p9fyCa'                   // from Project Settings > API

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
