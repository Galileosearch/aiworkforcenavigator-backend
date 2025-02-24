import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/companies - Get all companies
export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('companies')
    .select('*');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/companies - Create a new company
export async function POST(request) {
  const supabase = createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('companies')
    .insert(body)
    .select();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data[0], { status: 201 });
}
