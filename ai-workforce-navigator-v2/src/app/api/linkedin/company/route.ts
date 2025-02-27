// src/app/api/linkedin/company/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { scrapeCompanyProfile, mapCompanyData } from '@/lib/apify/linkedin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyUrl } = body;
    
    if (!companyUrl) {
      return NextResponse.json(
        { error: 'Company URL or name is required' },
        { status: 400 }
      );
    }
    
    // Format the URL properly if it's just a company name
    const formattedUrl = companyUrl.startsWith('http') 
      ? companyUrl 
      : `https://www.linkedin.com/company/${companyUrl.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Scrape LinkedIn data
    const linkedinData = await scrapeCompanyProfile(formattedUrl);
    
    if (!linkedinData) {
      return NextResponse.json(
        { error: 'No data found for this company' },
        { status: 404 }
      );
    }
    
    // Transform the data to fit our database schema
    const companyData = mapCompanyData(linkedinData);
    
    // Log the data we're trying to insert
    console.log('Attempting to insert company data:', JSON.stringify(companyData, null, 2));
    
    // Save to database
    const supabase = createClient();
    try {
      // First check if the table exists by querying it
      const { error: tableCheckError } = await supabase
        .from('companies')
        .select('count')
        .limit(1);
      
      if (tableCheckError) {
        console.error('Table check error:', tableCheckError);
        return NextResponse.json(
          { error: 'Table check failed', details: tableCheckError.message, code: tableCheckError.code },
          { status: 500 }
        );
      }
      
      // Try inserting the data
      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select();
      
      if (error) {
        console.error('Supabase error details:', error);
        
        // Check for common errors
        if (error.code === '42P01') {
          return NextResponse.json(
            { error: 'Table does not exist', details: 'The companies table does not exist in the database' },
            { status: 500 }
          );
        } else if (error.code === '42703') {
          return NextResponse.json(
            { error: 'Column does not exist', details: 'One or more columns in the data do not exist in the table' },
            { status: 500 }
          );
        } else if (error.code === '23505') {
          return NextResponse.json(
            { error: 'Unique constraint violation', details: 'A record with this unique key already exists' },
            { status: 500 }
          );
        } else if (error.code === '42501') {
          return NextResponse.json(
            { error: 'Permission denied', details: 'The current user does not have permission to insert data' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to save company data', 
            details: error.message, 
            code: error.code,
            hint: error.hint,
            data: companyData
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: 'Company data scraped and saved successfully',
        company: data[0]
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in LinkedIn API route:', error);
    return NextResponse.json(
      { error: 'Failed to scrape company data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}