// src/lib/apify/linkedin.ts

export async function scrapeCompanyProfile(companyUrl: string) {
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
    
    if (!APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is not set in environment variables');
    }
  
    try {
      // Start the actor run
      const startResponse = await fetch(
        'https://api.apify.com/v2/acts/fetchclub~linkedin-company-profiles-scraper/runs?token=' + APIFY_API_TOKEN,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "company_profile_urls": [companyUrl],
            "proxy_group": "DATACENTER"
          }),
        }
      );
  
      if (!startResponse.ok) {
        throw new Error(`Failed to start Apify task: ${startResponse.statusText}`);
      }
  
      const runData = await startResponse.json();
      const runId = runData.data.id;
  
      // Poll for task completion
      let isCompleted = false;
      let result = null;
  
      while (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
        
        const statusResponse = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`
        );
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to check run status: ${statusResponse.statusText}`);
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.data.status === 'SUCCEEDED') {
          isCompleted = true;
          
          // Get the dataset items
          const datasetResponse = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}`
          );
          
          if (!datasetResponse.ok) {
            throw new Error(`Failed to fetch dataset: ${datasetResponse.statusText}`);
          }
          
          const datasetData = await datasetResponse.json();
          
          if (datasetData.length > 0) {
            result = datasetData[0]; // Get the first result
          }
        } else if (statusData.data.status === 'FAILED' || statusData.data.status === 'ABORTED') {
          throw new Error(`Apify run failed with status: ${statusData.data.status}`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error scraping LinkedIn company profile:', error);
      throw error;
    }
  }
  
  // Function to map Apify data to our database schema
  export function mapCompanyData(linkedinData: any) {
    if (!linkedinData) return null;
    
    // Extract employee count from company_size (e.g., "10,001+ employees")
    let employeeCount = null;
    if (linkedinData.company_size) {
      const match = linkedinData.company_size.match(/(\d+,*\d*)/);
      if (match) {
        employeeCount = parseInt(match[0].replace(',', ''));
      }
    }
    
    return {
      name: linkedinData.company_name || '',
      website_url: linkedinData.company_website || '',
      industry: linkedinData.company_industry || '',
      size: employeeCount, // Use parsed integer or null
      location: linkedinData.company_headquarters || '',
      employee_count: employeeCount, // Use parsed integer or null
      last_updated: new Date().toISOString(),
      apify_data: linkedinData, // Store the full LinkedIn data as JSON
    };
  }