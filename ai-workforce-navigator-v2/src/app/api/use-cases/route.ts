import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/use-cases - Get all use cases
export async function GET(request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');
  
  let query = supabase.from('use_cases').select('*');
  
  if (assessmentId) {
    query = query.eq('assessment_id', assessmentId);
  }
  
  const { data, error } = await query;
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/use-cases - Create a new use case
export async function POST(request) {
  const supabase = createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('use_cases')
    .insert(body)
    .select();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data[0], { status: 201 });
}
