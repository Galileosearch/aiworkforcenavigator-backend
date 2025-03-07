"use client";

import { useState } from 'react';

interface CompanyProfileFetchProps {
  onCompanyProfileFetched: (data: any) => void;
}

export default function CompanyProfileFetch({ onCompanyProfileFetched }: CompanyProfileFetchProps) {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dataSource, setDataSource] = useState<'apify' | 'gpt'>('gpt'); // Default to GPT
  const [fetchTimes, setFetchTimes] = useState<{apify?: number, gpt?: number}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyUrl.trim()) {
      setError('Please enter a company name or LinkedIn URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    const startTime = performance.now();
    
    try {
      // Determine which API endpoint to use based on the selected data source
      const endpoint = dataSource === 'apify' 
        ? '/api/linkedin/company' 
        : '/api/company-data/gpt';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyUrl,
          companyName: companyUrl // Pass the input as both URL and name for GPT
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch company data');
      }
      
      const endTime = performance.now();
      setFetchTimes(prev => ({
        ...prev,
        [dataSource]: endTime - startTime
      }));
      
      setSuccess(true);
      onCompanyProfileFetched({
        ...data.company,
        data_source: dataSource,
        fetch_time_ms: endTime - startTime
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // If GPT fails, try Apify as fallback
      if (dataSource === 'gpt') {
        setError(`${error} - Trying Apify as fallback...`);
        setDataSource('apify');
        handleSubmit(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Company Information</h2>
      <p className="text-sm text-muted-foreground">
        Enter your company name or LinkedIn URL to automatically fetch company information
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Company data fetched successfully using {dataSource.toUpperCase()}
          {fetchTimes[dataSource] && ` in ${fetchTimes[dataSource].toFixed(0)}ms`}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="Enter company name or full LinkedIn URL"
            className="w-full p-2 border border-gray-300 rounded"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This will help pre-populate your job description with company information. Our AI prioritizes Australian operations for multinational companies.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Data Source:</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="dataSource"
              value="gpt"
              checked={dataSource === 'gpt'}
              onChange={() => setDataSource('gpt')}
              disabled={isLoading}
            />
            <span className="ml-2">GPT-4.5 (Faster, Australia-focused)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="dataSource"
              value="apify"
              checked={dataSource === 'apify'}
              onChange={() => setDataSource('apify')}
              disabled={isLoading}
            />
            <span className="ml-2">LinkedIn Scraper (More Detailed)</span>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Fetching Company Data...' : 'Fetch Company Data'}
        </button>
      </form>
    </div>
  );
} 