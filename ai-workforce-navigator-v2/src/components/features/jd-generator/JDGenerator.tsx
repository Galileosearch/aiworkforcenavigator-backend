"use client";

import { useState } from 'react';
import CompanyProfileFetch from './CompanyProfileFetch';
import TechnologyRecommender from './TechnologyRecommender';
import JDPreview from './JDPreview';

interface JobDescription {
  title: string;
  company_id?: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  location: string;
  job_type: string;
  experience_level: string;
  ai_tools: string[];
  skills: string[];
}

export default function JDGenerator() {
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range: '',
    location: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    ai_tools: [],
    skills: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCompanyData = (data: any) => {
    setCompanyData(data);
    // Pre-fill location if available
    if (data.location) {
      setJobDescription(prev => ({
        ...prev,
        location: data.location
      }));
    }
    // Move to next step
    setStep(2);
  };
  
  const handleJobDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobDescription(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTechnologySelection = (technologies: string[]) => {
    setJobDescription(prev => ({
      ...prev,
      ai_tools: technologies
    }));
    // Move to next step
    setStep(3);
  };
  
  const handleSkillsSelection = (skills: string[]) => {
    setJobDescription(prev => ({
      ...prev,
      skills
    }));
    // Move to preview step
    setStep(4);
  };
  
  const generateJobDescription = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/job-descriptions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyData,
          jobDetails: jobDescription
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate job description');
      }
      
      // Update job description with generated content
      setJobDescription(prev => ({
        ...prev,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities
      }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate job description');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveJobDescription = async () => {
    try {
      const response = await fetch('/api/job-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobDescription,
          company_id: companyData?.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save job description');
      }
      
      // Handle successful save
      // Redirect to job post page or show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job description');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Job Description Generator</h1>
      
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                s === step ? 'bg-blue-600 text-white' : 
                s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div className={`h-1 w-16 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span>Company Info</span>
          <span>Job Details</span>
          <span>AI Technologies</span>
          <span>Preview</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {step === 1 && (
        <CompanyProfileFetch onCompanyProfileFetched={handleCompanyData} />
      )}
      
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Job Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Title</label>
              <input
                type="text"
                name="title"
                value={jobDescription.title}
                onChange={handleJobDetailsChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., AI Engineer, Machine Learning Specialist"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={jobDescription.location}
                onChange={handleJobDetailsChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Sydney, Remote, Hybrid"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Job Type</label>
              <select
                name="job_type"
                value={jobDescription.job_type}
                onChange={handleJobDetailsChange}
                className="w-full p-2 border border-gray-300 rounded"
                aria-label="Job Type"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Experience Level</label>
              <select
                name="experience_level"
                value={jobDescription.experience_level}
                onChange={handleJobDetailsChange}
                className="w-full p-2 border border-gray-300 rounded"
                aria-label="Experience Level"
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Salary Range</label>
              <input
                type="text"
                name="salary_range"
                value={jobDescription.salary_range}
                onChange={handleJobDetailsChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., $100,000 - $130,000"
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={!jobDescription.title}
            >
              Next: Select AI Technologies
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <TechnologyRecommender
          companyData={companyData}
          jobTitle={jobDescription.title}
          onSelect={handleTechnologySelection}
          onBack={() => setStep(2)}
        />
      )}
      
      {step === 4 && (
        <div className="space-y-6">
          <JDPreview
            jobDescription={jobDescription}
            companyData={companyData}
          />
          
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Back
            </button>
            <div className="space-x-4">
              <button
                onClick={generateJobDescription}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Regenerate Description'}
              </button>
              <button
                onClick={saveJobDescription}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save & Post Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 