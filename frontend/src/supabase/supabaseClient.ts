import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qetyctfjmrkkgijffcgq.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFldHljdGZqbXJra2dpamZmY2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjQwMjgsImV4cCI6MjA1Njg0MDAyOH0.SQZMcBE45ivH6ilsGuGO5NbHb_NXu5mX7mTkRZVP80E'; // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
