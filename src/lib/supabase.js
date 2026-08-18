import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jxjyxaadzcyrclxhazwi.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anl4YWFkemN5cmNseGhhendpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDc0NDYsImV4cCI6MjEwMjU4MzQ0Nn0.hXJSlHwqQwN_GU6im4NZIwk6d1ZnMGrH5SrpvWCiSbU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
