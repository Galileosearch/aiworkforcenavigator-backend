import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_post_id, platforms } = body;
    
    if (!job_post_id || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Job post ID and at least one platform are required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Get job post details
    const { data: jobPost, error: jobError } = await supabase
      .from('job_posts')
      .select('*, companies(*)')
      .eq('id', job_post_id)
      .single();
    
    if (jobError || !jobPost) {
      return NextResponse.json(
        { error: 'Job post not found', details: jobError?.message },
        { status: 404 }
      );
    }
    
    // Process each platform
    const results = [];
    
    for (const platform of platforms) {
      // Here we would integrate with each platform's API
      // For now, we'll just create a record in the community_integrations table
      
      const { data, error } = await supabase
        .from('community_integrations')
        .insert({
          job_post_id,
          platform,
          post_status: 'pending', // Will be updated after actual posting
          engagement_metrics: {}
        })
        .select();
      
      if (error) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      } else {
        results.push({
          platform,
          success: true,
          integration_id: data[0].id
        });
      }
    }
    
    return NextResponse.json({
      message: 'Community posting initiated',
      results
    });
  } catch (error: unknown) {
    console.error('Error in community posting API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 