import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhcxaefebyunzqhmzzjj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY3hhZWZlYnl1bnpxaG16empqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjMzNTIsImV4cCI6MjA5NjQ5OTM1Mn0.SI3U3AS6bJW--m5YbU8cP52ODJ0fDgwblu_4gthm5fk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching payments from Supabase...");
  const { data, error } = await supabase.from('payments').select('*');
  if (error) {
    console.error("Error fetching payments:", error);
  } else {
    console.log(`Success! Fetched ${data.length} payments.`);
  }

  console.log("Fetching programs from Supabase...");
  const { data: pData, error: pError } = await supabase.from('programs').select('*');
  if (pError) {
    console.error("Error fetching programs:", pError);
  } else {
    console.log(`Success! Fetched ${pData.length} programs.`);
  }
}

check();
