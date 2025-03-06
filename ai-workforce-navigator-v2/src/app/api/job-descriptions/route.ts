import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, company_id, description, requirements, responsibilities, salary_range, location, job_type, experience_level, ai_tools, skills } = body;
    
    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Insert job post
    const { data, error } = await supabase
      .from('job_posts')
      .insert({
        title,
        company_id,
        description,
        requirements,
        responsibilities,
        salary_range,
        location,
        job_type,
        experience_level,
        ai_tools,
        skills,
        status: 'draft'
      })
      .select();
    
    if (error) {
      console.error('Error creating job description:', error);
      return NextResponse.json(
        { error: 'Failed to create job description', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Job description created successfully',
      job: data[0]
    });
  } catch (error: unknown) {
    console.error('Error in job descriptions API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const supabase = createClient();
    
    if (id) {
      // Get specific job post
      const { data, error } = await supabase
        .from('job_posts')
        .select('*, companies(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch job description', details: error.message },
          { status: 500 }
        );
      }
      
      if (!data) {
        return NextResponse.json(
          { error: 'Job description not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(data);
    } else {
      // Get all job posts
      const { data, error } = await supabase
        .from('job_posts')
        .select('*, companies(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch job descriptions', details: error.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    console.error('Error in job descriptions API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 