
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPlans() {
    console.log('\n--- Query 1: plans without any filter ---');
    const { data: all, error: e1 } = await supabase.from('plans').select('id, name, price, active, organization_id');
    console.log('Error:', e1?.message || 'none');
    console.log('Count:', all?.length);
    console.log('Data:', JSON.stringify(all, null, 2));

    console.log('\n--- Query 2: plans with active=true ---');
    const { data: active, error: e2 } = await supabase.from('plans').select('id, name, price, active').eq('active', true);
    console.log('Error:', e2?.message || 'none');
    console.log('Count:', active?.length);

    console.log('\n--- Query 3: plans with active=true, order by price ---');
    const { data: ordered, error: e3 } = await supabase.from('plans').select('*').eq('active', true).order('price');
    console.log('Error:', e3?.message || 'none');
    console.log('Count:', ordered?.length);
    if (ordered && ordered.length > 0) {
        console.log('Columns:', Object.keys(ordered[0]));
    }
}

debugPlans();
