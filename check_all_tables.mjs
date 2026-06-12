import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhcxaefebyunzqhmzzjj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY3hhZWZlYnl1bnpxaG16empqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkyMzM1MiwiZXhwIjoyMDk2NDk5MzUyfQ.ckFaGu-bNX7o4j9rvE06vmlLIs4oXL1taped5FHkIIE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const tables = ['organizations', 'users_profile', 'trainers', 'programs', 'batches', 'invoices', 'enrollments', 'payments', 'certificates', 'attendance_sessions', 'attendance_records', 'assessments', 'assessment_submissions', 'feedback'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`Error on ${table}:`, error.message);
    } else {
      console.log(`${table}: ${count}`);
    }
  }
}

checkAll();
