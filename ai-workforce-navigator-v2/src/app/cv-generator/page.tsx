"use client";

import { useState } from 'react';
import { jsPDF } from 'jspdf';

export default function CVGeneratorPage() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'optimized-cv' | 'skill-gaps' | 'training'>('optimized-cv');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile || !jobDescription) {
      setError('Please upload your CV and enter a job description');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      formData.append('jobDescription', jobDescription);
      
      const response = await fetch('/api/cv-generation', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process CV');
      }
      
      setResult(data);
      
      // Get training recommendations
      if (data.skill_gaps && data.skill_gaps.length > 0) {
        const trainingResponse = await fetch('/api/training-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skill_gaps: data.skill_gaps }),
        });
        
        const trainingData = await trainingResponse.json();
        
        if (trainingResponse.ok) {
          setResult(prev => ({
            ...prev,
            training_recommendations: trainingData
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('AI-Optimized CV', 105, 15, { align: 'center' });
    
    // Add CV content
    doc.setFontSize(12);
    
    // Split text into lines to fit on page
    const textLines = doc.splitTextToSize(result.optimized_cv, 180);
    doc.text(textLines, 15, 25);
    
    // Save the PDF
    doc.save('optimized-cv.pdf');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI CV Optimizer</h1>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Upload Your CV</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-64"
              placeholder="Paste the job description here..."
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Optimizing CV...' : 'Optimize My CV'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            CV optimized successfully! Relevance Score: {result.relevance_score}/100
          </div>
          
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'optimized-cv' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('optimized-cv')}
            >
              Optimized CV
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'skill-gaps' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('skill-gaps')}
            >
              Skill Gaps
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'training' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('training')}
            >
              Training Recommendations
            </button>
          </div>
          
          {activeTab === 'optimized-cv' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Export as PDF
                </button>
              </div>
              
              <div className="border rounded-md p-6 whitespace-pre-wrap bg-white">
                {result.optimized_cv}
              </div>
            </div>
          )}
          
          {activeTab === 'skill-gaps' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Identified Skill Gaps</h2>
              
              <ul className="list-disc pl-5 space-y-2">
                {result.skill_gaps.map((skill: string, index: number) => (
                  <li key={index} className="text-red-600">{skill}</li>
                ))}
              </ul>
              
              <h2 className="text-xl font-semibold mt-6">Improvement Areas</h2>
              <ul className="list-disc pl-5 space-y-2">
                {result.improvement_areas.map((area: string, index: number) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'training' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Training Recommendations</h2>
              
              {result.training_recommendations ? (
                <div className="space-y-6">
                  {result.training_recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="font-semibold text-lg">{rec.skill}</h3>
                      <p className="text-sm text-gray-500">
                        Difficulty: {rec.difficulty_level} • Estimated Time: {rec.estimated_time}
                      </p>
                      
                      <h4 className="font-medium mt-3">Recommended Courses:</h4>
                      <ul className="list-disc pl-5">
                        {rec.courses.map((course: any, i: number) => (
                          <li key={i}>
                            {course.name} ({course.provider})
                            {course.url && (
                              <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1">
                                Link
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="font-medium mt-3">Relevant Certifications:</h4>
                      <ul className="list-disc pl-5">
                        {rec.certifications.map((cert: string, i: number) => (
                          <li key={i}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading training recommendations...</p>
              )}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={() => {
                setResult(null);
                setCvFile(null);
                setJobDescription('');
              }}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 