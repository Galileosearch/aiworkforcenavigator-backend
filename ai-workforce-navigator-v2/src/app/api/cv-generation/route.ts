import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Get form data with file
    const formData = await request.formData();
    const cvFile = formData.get('cv') as File;
    const jobDescription = formData.get('jobDescription') as string;
    
    if (!cvFile || !jobDescription) {
      return NextResponse.json(
        { error: 'CV file and job description are required' },
        { status: 400 }
      );
    }
    
    // Read the CV file content
    const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
    const cvText = cvBuffer.toString('utf-8');
    
    // Call OpenAI API to analyze and rewrite the CV
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are an expert CV writer who optimizes CVs to match job descriptions. Analyze the CV and job description, then rewrite the CV to highlight relevant skills and experience." 
        },
        { 
          role: "user", 
          content: `
            Here is my current CV:
            ${cvText}
            
            And here is the job description I'm applying for:
            ${jobDescription}
            
            Please rewrite my CV to better match this job description. Highlight relevant skills and experience, and format it professionally.
            Return the result as a JSON object with these fields:
            1. "optimized_cv": The rewritten CV text
            2. "skill_gaps": Array of skills mentioned in the job description that are missing from my CV
            3. "relevance_score": A score from 0-100 indicating how well my experience matches the job
            4. "improvement_areas": Key suggestions for improving my CV further
          `
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    const responseContent = completion.choices[0].message.content;
    const result = JSON.parse(responseContent);
    
    // Store the result in Supabase
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cv_optimizations')
      .insert({
        original_cv: cvText,
        job_description: jobDescription,
        optimized_cv: result.optimized_cv,
        skill_gaps: result.skill_gaps,
        relevance_score: result.relevance_score,
        improvement_areas: result.improvement_areas,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error storing CV optimization:', error);
    }
    
    return NextResponse.json({
      optimized_cv: result.optimized_cv,
      skill_gaps: result.skill_gaps,
      relevance_score: result.relevance_score,
      improvement_areas: result.improvement_areas,
      id: data?.[0]?.id
    });
  } catch (error: unknown) {
    console.error('Error in CV generation:', error);
    return NextResponse.json(
      { error: 'Failed to process CV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 