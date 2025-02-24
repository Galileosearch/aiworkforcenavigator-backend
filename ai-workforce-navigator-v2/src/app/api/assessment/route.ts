import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/assessment - Get all assessments
export async function GET(request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  
  let query = supabase.from('assessments').select('*');
  
  if (companyId) {
    query = query.eq('company_id', companyId);
  }
  
  const { data, error } = await query;
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/assessment - Create a new assessment
export async function POST(request) {
  const supabase = createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('assessments')
    .insert(body)
    .select();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data[0], { status: 201 });
}
