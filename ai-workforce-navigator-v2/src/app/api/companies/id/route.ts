import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/companies/[id] - Get a specific company
export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  if (!data) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PATCH /api/companies/[id] - Update a company
export async function PATCH(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('companies')
    .update(body)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return new NextResponse(null, { status: 204 });
}
