import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qtvfabrorwdjubkmskvy.supabase.co'
// Use your SERVICE_ROLE_KEY here only for the Admin Dashboard
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dmZhYnJvcndkanVia21za3Z5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY3MzYwMywiZXhwIjoyMDkyMjQ5NjAzfQ.q7bnogrDqyJc7pWmiqJBHAgtzaFYEyG5TlA6ddpu3BI' 

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: true
  }
})