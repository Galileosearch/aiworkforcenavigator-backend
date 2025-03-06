import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/use-cases/[id] - Get a specific use case
export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { data, error } = await supabase
    .from("use_cases")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  if (!data) {
    return NextResponse.json({ error: "Use case not found" }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PATCH /api/use-cases/[id] - Update a use case
export async function PATCH(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  const body = await request.json();
  
  const { data, error } = await supabase
    .from("use_cases")
    .update(body)
    .eq("id", id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE /api/use-cases/[id] - Delete a use case
export async function DELETE(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { error } = await supabase
    .from("use_cases")
    .delete()
    .eq("id", id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return new NextResponse(null, { status: 204 });
}