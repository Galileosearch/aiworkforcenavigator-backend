import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, jobDetails } = body;
    
    if (!jobDetails.title) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }
    
    // Construct a detailed prompt for the AI
    const prompt = `
      Generate a professional job description for a ${jobDetails.title} position at ${company?.name || 'a company'}.
      
      Company Information:
      - Name: ${company?.name || 'Not specified'}
      - Industry: ${company?.industry || 'Not specified'}
      - Size: ${company?.size ? (company.size > 1000 ? 'Enterprise' : 'Small to Medium Business') : 'Not specified'}
      - Location: ${company?.location || 'Not specified'}
      ${company?.apify_data?.company_about_us ? `- About: ${company.apify_data.company_about_us}` : ''}
      
      Job Details:
      - Title: ${jobDetails.title}
      - Type: ${jobDetails.job_type}
      - Experience Level: ${jobDetails.experience_level}
      - Location: ${jobDetails.location || 'Not specified'}
      - Salary Range: ${jobDetails.salary_range || 'Not specified'}
      
      Required AI Technologies:
      ${jobDetails.ai_tools.length > 0 ? jobDetails.ai_tools.map(tool => `- ${tool}`).join('\n') : '- Not specified'}
      
      Format the response as a JSON object with the following fields:
      1. "description": A compelling overview of the role (200-300 words)
      2. "responsibilities": A list of 5-7 key responsibilities, each on a new line starting with "- "
      3. "requirements": A list of 5-7 key requirements/qualifications, each on a new line starting with "- "
      
      Make the job description specific to the AI industry, emphasizing modern AI practices and technologies.
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are an expert AI recruiter who creates compelling job descriptions for AI and technology roles." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    let parsedResponse;
    
    try {
      // Try to parse as JSON
      parsedResponse = JSON.parse(responseContent);
    } catch (error) {
      // If not valid JSON, extract sections manually
      const descriptionMatch = responseContent.match(/description"?:\s*"?(.*?)"?,\s*"?responsibilities/s);
      const responsibilitiesMatch = responseContent.match(/responsibilities"?:\s*"?(.*?)"?,\s*"?requirements/s);
      const requirementsMatch = responseContent.match(/requirements"?:\s*"?(.*?)"?(\}|$)/s);
      
      parsedResponse = {
        description: descriptionMatch ? descriptionMatch[1].replace(/^"|"$/g, '').trim() : '',
        responsibilities: responsibilitiesMatch ? responsibilitiesMatch[1].replace(/^"|"$/g, '').trim() : '',
        requirements: requirementsMatch ? requirementsMatch[1].replace(/^"|"$/g, '').trim() : ''
      };
    }
    
    return NextResponse.json({
      description: parsedResponse.description || '',
      responsibilities: parsedResponse.responsibilities || '',
      requirements: parsedResponse.requirements || ''
    });
  } catch (error: unknown) {
    console.error('Error generating job description:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 