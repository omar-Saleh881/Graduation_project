import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://nzziswcqkbyutovdszmu.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56emlzd2Nxa2J5dXRvdmRzem11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTg4NTMsImV4cCI6MjA4ODU3NDg1M30.YIRCIC4YBHc9iZGyxlsA-yCj-e2kF8jd6ShMIYx6IGs';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
