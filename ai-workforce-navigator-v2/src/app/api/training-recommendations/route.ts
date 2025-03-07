import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill_gaps } = body;
    
    if (!skill_gaps || !Array.isArray(skill_gaps) || skill_gaps.length === 0) {
      return NextResponse.json(
        { error: 'Skill gaps array is required' },
        { status: 400 }
      );
    }
    
    // Call OpenAI API to get training recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are an expert career advisor who recommends training courses to help people develop skills for their career." 
        },
        { 
          role: "user", 
          content: `
            I need to develop the following skills for a job:
            ${skill_gaps.join(', ')}
            
            Please recommend specific training courses, certifications, or resources for each skill.
            Return the recommendations as a JSON array where each item has:
            1. "skill": The skill name
            2. "courses": Array of recommended courses (name, provider, URL if available)
            3. "certifications": Array of relevant certifications
            4. "estimated_time": Estimated time to achieve proficiency (e.g., "2-3 months")
            5. "difficulty_level": Beginner, Intermediate, or Advanced
          `
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" }
    });
    
    const responseContent = completion.choices[0].message.content;
    const recommendations = JSON.parse(responseContent);
    
    return NextResponse.json(recommendations);
  } catch (error: unknown) {
    console.error('Error generating training recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate training recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 