import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these would be in .env files.
// To enable Supabase, add your project URL and Anon Key here.
// If left empty, the app will run in "Demo Mode" using local in-memory data.
const supabaseUrl: string = 'https://phpldllyuhjhohfcpfic.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGxkbGx5dWhqaG9oZmNwZmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjM3MTksImV4cCI6MjA3OTczOTcxOX0.WM-SsmXMFbfLC5j9aIQsrcR52sCPoz4Yyy6MdsGiXoU';


export const isSupabaseConfigured = supabaseUrl !== '' && supabaseKey !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;