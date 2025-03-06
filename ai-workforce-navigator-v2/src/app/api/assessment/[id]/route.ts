import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/assessment/[id] - Get a specific assessment
export async function GET(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  if (!data) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }
  
  return NextResponse.json(data);
}

// PATCH /api/assessment/[id] - Update an assessment
export async function PATCH(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  const body = await request.json();
  
  const { data, error } = await supabase
    .from("assessments")
    .update(body)
    .eq("id", id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE /api/assessment/[id] - Delete an assessment
export async function DELETE(request, { params }) {
  const supabase = createClient();
  const { id } = params;
  
  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return new NextResponse(null, { status: 204 });
}