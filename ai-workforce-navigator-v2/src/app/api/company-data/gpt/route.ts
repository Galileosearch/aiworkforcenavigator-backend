import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyUrl, companyName } = body;
    
    if (!companyUrl && !companyName) {
      return NextResponse.json(
        { error: 'Company URL or name is required' },
        { status: 400 }
      );
    }
    
    // Construct prompt for GPT-4.5
    const prompt = `
      I need information about a company${companyName ? ` called ${companyName}` : ''}.
      ${companyUrl ? `Their website or LinkedIn page is: ${companyUrl}` : ''}
      
      Please focus on the Australian operations of this company if it's multinational.
      
      Please provide the following information in JSON format:
      1. Company name
      2. Industry
      3. Company size (approximate number of employees in Australia)
      4. Location (Australian headquarters or main office)
      5. Brief description (2-3 sentences about their Australian operations)
      6. Main products or services offered in Australia
      7. Year founded in Australia (if known)
      
      Format the response as a valid JSON object with these fields:
      {
        "name": "Company Name",
        "industry": "Industry",
        "size": "Size range (e.g., 1-50, 51-200, 201-1000, 1000+)",
        "location": "Australian headquarters location",
        "description": "Brief description focusing on Australian operations",
        "products_services": "Main products or services in Australia",
        "year_founded": "Year established in Australia or 'Unknown'"
      }
    `;
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that provides accurate company information in JSON format. Focus on Australian operations when providing company details." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    const companyData = JSON.parse(responseContent);
    
    return NextResponse.json({
      source: 'gpt',
      company: {
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size,
        location: companyData.location,
        description: companyData.description,
        products_services: companyData.products_services,
        year_founded: companyData.year_founded,
        // Add metadata
        data_source: 'GPT-4.5',
        retrieved_at: new Date().toISOString()
      }
    });
  } catch (error: unknown) {
    console.error('Error retrieving company data from GPT:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve company data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 