import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhcxaefebyunzqhmzzjj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY3hhZWZlYnl1bnpxaG16empqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjMzNTIsImV4cCI6MjA5NjQ5OTM1Mn0.SI3U3AS6bJW--m5YbU8cP52ODJ0fDgwblu_4gthm5fk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching programs from Supabase...");
  const { data, error } = await supabase.from('programs').select('*');
  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log(`Success! Fetched ${data.length} programs.`);
    if (data.length > 0) {
      console.log("First program:", JSON.stringify(data[0], null, 2));
    }
  }
}

check();
