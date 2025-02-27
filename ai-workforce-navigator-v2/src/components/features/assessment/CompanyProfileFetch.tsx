// src/components/features/assessment/CompanyProfileFetch.tsx
'use client';

import { useState } from 'react';

interface CompanyProfileFetchProps {
  onCompanyData: (data: any) => void;
}

export default function CompanyProfileFetch({ onCompanyData }: CompanyProfileFetchProps) {
  const [companyUrl, setCompanyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyUrl) {
      setError("Please enter a company name or LinkedIn URL");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/linkedin/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch company data');
      }
      
      onCompanyData(data.company);
    } catch (error: any) {
      setError(error.message || "Failed to fetch company data");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-xl font-bold mb-4">Company Information</h2>
      <p className="mb-4">
        Enter your company name or LinkedIn URL to automatically fetch company information
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleFetchCompany} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="E.g., Microsoft or https://www.linkedin.com/company/microsoft"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded p-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter company name or full LinkedIn URL
          </p>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Fetching company data...' : 'Fetch Company Data'}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 mt-4">
        This will help pre-populate your assessment with company information
      </p>
    </div>
  );
}