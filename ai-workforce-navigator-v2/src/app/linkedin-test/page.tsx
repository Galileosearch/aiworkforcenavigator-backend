// src/app/linkedin-test/page.tsx
'use client';

import { useState } from 'react';
import CompanyProfileFetch from '@/components/features/assessment/CompanyProfileFetch';

export default function LinkedInTest() {
  const [companyData, setCompanyData] = useState<any>(null);

  const handleCompanyData = (data: any) => {
    setCompanyData(data);
    console.log('Received company data:', data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Test Page</h1>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div>
          <CompanyProfileFetch onCompanyData={handleCompanyData} />
        </div>
        
        <div>
          {companyData ? (
            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-2">Company Data</h2>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-[400px]">
                {JSON.stringify(companyData, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="border p-4 rounded text-gray-500">
              No company data yet. Use the form to fetch data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}