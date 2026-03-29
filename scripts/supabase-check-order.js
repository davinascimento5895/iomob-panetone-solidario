import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function main() {
  const { data, error } = await supabase.from('orders').select('*').eq('pickup_code', 'AC62EB');
  console.log('eq AC62EB', {rowCount: data?.length, data, error});

  const { data: all, error: err2 } = await supabase.from('orders').select('id, pickup_code, status, created_at').order('created_at', {ascending: false}).limit(20);
  console.log('all 20', {rowCount: all?.length, data: all, error: err2});
}

main().catch(console.error).finally(() => process.exit());