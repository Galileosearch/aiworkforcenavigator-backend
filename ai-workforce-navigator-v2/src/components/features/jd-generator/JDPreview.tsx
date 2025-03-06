"use client";

import { useState } from 'react';

interface JDPreviewProps {
  jobDescription: {
    title: string;
    description: string;
    requirements: string;
    responsibilities: string;
    salary_range: string;
    location: string;
    job_type: string;
    experience_level: string;
    ai_tools: string[];
    skills: string[];
  };
  companyData: any;
}

export default function JDPreview({ jobDescription, companyData }: JDPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'strength'>('preview');
  
  // Calculate JD strength score
  const calculateStrengthScore = () => {
    let score = 0;
    let maxScore = 100;
    
    // Title
    if (jobDescription.title) score += 10;
    
    // Description
    if (jobDescription.description) {
      const wordCount = jobDescription.description.split(/\s+/).length;
      score += Math.min(wordCount / 20, 20); // Max 20 points for description
    }
    
    // Requirements
    if (jobDescription.requirements) {
      const reqCount = jobDescription.requirements.split(/\n/).filter(Boolean).length;
      score += Math.min(reqCount * 2, 15); // Max 15 points for requirements
    }
    
    // Responsibilities
    if (jobDescription.responsibilities) {
      const respCount = jobDescription.responsibilities.split(/\n/).filter(Boolean).length;
      score += Math.min(respCount * 2, 15); // Max 15 points for responsibilities
    }
    
    // AI Tools
    score += Math.min(jobDescription.ai_tools.length * 3, 15); // Max 15 points for AI tools
    
    // Skills
    score += Math.min(jobDescription.skills.length * 2, 10); // Max 10 points for skills
    
    // Other fields
    if (jobDescription.salary_range) score += 5;
    if (jobDescription.location) score += 5;
    if (jobDescription.job_type) score += 2.5;
    if (jobDescription.experience_level) score += 2.5;
    
    return Math.round(score);
  };
  
  const strengthScore = calculateStrengthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };
  
  const formatRequirements = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No requirements specified</p>;
    
    return text.split('\n').filter(Boolean).map((req, index) => (
      <li key={index} className="mb-1">{req.replace(/^-\s*/, '')}</li>
    ));
  };
  
  const formatResponsibilities = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No responsibilities specified</p>;
    
    return text.split('\n').filter(Boolean).map((resp, index) => (
      <li key={index} className="mb-1">{resp.replace(/^-\s*/, '')}</li>
    ));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'preview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'strength' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('strength')}
        >
          JD Strength Score
        </button>
      </div>
      
      {activeTab === 'preview' ? (
        <div className="space-y-6 bg-white p-6 border rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{jobDescription.title || 'Job Title'}</h1>
              <p className="text-gray-600">{companyData?.name || 'Company Name'} • {jobDescription.location || 'Location'}</p>
            </div>
            {companyData?.logo_url && (
              <img 
                src={companyData.logo_url} 
                alt={`${companyData.name} logo`} 
                className="w-16 h-16 object-contain"
              />
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {jobDescription.job_type}
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {jobDescription.experience_level}
            </span>
            {jobDescription.salary_range && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {jobDescription.salary_range}
              </span>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">About the Role</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {jobDescription.description || 'No description provided.'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Responsibilities</h2>
            <ul className="list-disc pl-5 text-gray-700">
              {formatResponsibilities(jobDescription.responsibilities)}
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Requirements</h2>
            <ul className="list-disc pl-5 text-gray-700">
              {formatRequirements(jobDescription.requirements)}
            </ul>
          </div>
          
          {jobDescription.ai_tools.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {jobDescription.ai_tools.map(tool => (
                  <span key={tool} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {jobDescription.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {jobDescription.skills.map(skill => (
                  <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {companyData && (
            <div>
              <h2 className="text-lg font-semibold mb-2">About {companyData.name}</h2>
              <p className="text-gray-700">
                {companyData.apify_data?.company_about_us || 
                 `${companyData.name} is a ${companyData.industry} company based in ${companyData.location}.`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 bg-white p-6 border rounded-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">JD Strength Score</h2>
            <div className="flex items-center">
              <div className={`text-3xl font-bold ${getScoreColor(strengthScore)}`}>
                {strengthScore}/100
              </div>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                strengthScore >= 80 ? 'bg-green-100 text-green-800' :
                strengthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getScoreLabel(strengthScore)}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Job Title</span>
                <span className={`text-sm ${jobDescription.title ? 'text-green-600' : 'text-red-600'}`}>
                  {jobDescription.title ? '10/10' : '0/10'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${jobDescription.title ? 'bg-green-600' : 'bg-gray-300'}`}
                  style={{ width: jobDescription.title ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Description</span>
                <span className="text-sm">
                  {jobDescription.description ? 
                    `${Math.min(Math.round(jobDescription.description.split(/\s+/).length / 20 * 20), 20)}/20` : 
                    '0/20'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ 
                    width: jobDescription.description ? 
                      `${Math.min(jobDescription.description.split(/\s+/).length / 20 * 100, 100)}%` : 
                      '0%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Requirements</span>
                <span className="text-sm">
                  {jobDescription.requirements ? 
                    `${Math.min(jobDescription.requirements.split(/\n/).filter(Boolean).length * 2, 15)}/15` : 
                    '0/15'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ 
                    width: jobDescription.requirements ? 
                      `${Math.min(jobDescription.requirements.split(/\n/).filter(Boolean).length * 2 / 15 * 100, 100)}%` : 
                      '0%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Responsibilities</span>
                <span className="text-sm">
                  {jobDescription.responsibilities ? 
                    `${Math.min(jobDescription.responsibilities.split(/\n/).filter(Boolean).length * 2, 15)}/15` : 
                    '0/15'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ 
                    width: jobDescription.responsibilities ? 
                      `${Math.min(jobDescription.responsibilities.split(/\n/).filter(Boolean).length * 2 / 15 * 100, 100)}%` : 
                      '0%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">AI Tools</span>
                <span className="text-sm">
                  {`${Math.min(jobDescription.ai_tools.length * 3, 15)}/15`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${Math.min(jobDescription.ai_tools.length * 3 / 15 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Skills</span>
                <span className="text-sm">
                  {`${Math.min(jobDescription.skills.length * 2, 10)}/10`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${Math.min(jobDescription.skills.length * 2 / 10 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Additional Details</span>
                <span className="text-sm">
                  {`${(jobDescription.salary_range ? 5 : 0) + 
                     (jobDescription.location ? 5 : 0) + 
                     (jobDescription.job_type ? 2.5 : 0) + 
                     (jobDescription.experience_level ? 2.5 : 0)}/15`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ 
                    width: `${((jobDescription.salary_range ? 5 : 0) + 
                              (jobDescription.location ? 5 : 0) + 
                              (jobDescription.job_type ? 2.5 : 0) + 
                              (jobDescription.experience_level ? 2.5 : 0)) / 15 * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Improvement Suggestions</h3>
            <ul className="space-y-2 text-sm">
              {!jobDescription.title && (
                <li className="text-red-600">• Add a clear, specific job title</li>
              )}
              
              {(!jobDescription.description || jobDescription.description.split(/\s+/).length < 100) && (
                <li className="text-red-600">• Expand the job description (aim for at least 100 words)</li>
              )}
              
              {(!jobDescription.requirements || jobDescription.requirements.split(/\n/).filter(Boolean).length < 5) && (
                <li className="text-yellow-600">• Add more specific requirements (aim for at least 5)</li>
              )}
              
              {(!jobDescription.responsibilities || jobDescription.responsibilities.split(/\n/).filter(Boolean).length < 5) && (
                <li className="text-yellow-600">• Add more responsibilities (aim for at least 5)</li>
              )}
              
              {jobDescription.ai_tools.length < 3 && (
                <li className="text-yellow-600">• Add more AI tools and technologies</li>
              )}
              
              {!jobDescription.salary_range && (
                <li className="text-yellow-600">• Add a salary range to attract more candidates</li>
              )}
              
              {!jobDescription.location && (
                <li className="text-yellow-600">• Specify the job location or remote status</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 