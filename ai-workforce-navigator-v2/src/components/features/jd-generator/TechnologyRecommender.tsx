"use client";

import { useState, useEffect } from 'react';

interface TechnologyRecommenderProps {
  companyData: any;
  jobTitle: string;
  onSelect: (technologies: string[]) => void;
  onBack: () => void;
}

// Sample AI technologies by category
const aiTechnologies = {
  'Machine Learning': [
    'TensorFlow',
    'PyTorch',
    'scikit-learn',
    'Keras',
    'XGBoost',
  ],
  'Natural Language Processing': [
    'BERT',
    'GPT-4',
    'Hugging Face Transformers',
    'spaCy',
    'NLTK',
  ],
  'Computer Vision': [
    'OpenCV',
    'YOLO',
    'TensorFlow Object Detection',
    'MediaPipe',
    'Detectron2',
  ],
  'Data Processing': [
    'Apache Spark',
    'Pandas',
    'Dask',
    'Apache Airflow',
    'Databricks',
  ],
  'MLOps': [
    'MLflow',
    'Kubeflow',
    'Weights & Biases',
    'DVC',
    'Seldon Core',
  ],
};

export default function TechnologyRecommender({ companyData, jobTitle, onSelect, onBack }: TechnologyRecommenderProps) {
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [recommendedTechnologies, setRecommendedTechnologies] = useState<string[]>([]);
  const [isEnterprise, setIsEnterprise] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Determine if company is enterprise based on size
  useEffect(() => {
    if (companyData?.size && companyData.size > 1000) {
      setIsEnterprise(true);
    }
  }, [companyData]);

  // Generate technology recommendations based on job title and company size
  useEffect(() => {
    if (!jobTitle) return;
    
    setIsLoading(true);
    
    // In a real implementation, this would be an API call to get recommendations
    // For now, we'll simulate it with a timeout and some basic logic
    const timer = setTimeout(() => {
      let recommended: string[] = [];
      
      // Simple logic based on job title keywords
      if (jobTitle.toLowerCase().includes('machine learning')) {
        recommended = recommended.concat(aiTechnologies['Machine Learning']);
      }
      
      if (jobTitle.toLowerCase().includes('nlp') || jobTitle.toLowerCase().includes('language')) {
        recommended = recommended.concat(aiTechnologies['Natural Language Processing']);
      }
      
      if (jobTitle.toLowerCase().includes('vision') || jobTitle.toLowerCase().includes('image')) {
        recommended = recommended.concat(aiTechnologies['Computer Vision']);
      }
      
      if (jobTitle.toLowerCase().includes('data')) {
        recommended = recommended.concat(aiTechnologies['Data Processing']);
      }
      
      // Add MLOps tools for enterprise companies
      if (isEnterprise) {
        recommended = recommended.concat(aiTechnologies['MLOps']);
      }
      
      // If no specific matches, provide a general set
      if (recommended.length === 0) {
        recommended = [
          'TensorFlow',
          'PyTorch',
          'scikit-learn',
          'GPT-4',
          'Hugging Face Transformers',
          'Apache Spark',
          'Pandas',
        ];
      }
      
      // Remove duplicates
      recommended = Array.from(new Set(recommended));
      
      setRecommendedTechnologies(recommended);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [jobTitle, isEnterprise]);

  const toggleTechnology = (tech: string) => {
    if (selectedTechnologies.includes(tech)) {
      setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech));
    } else {
      setSelectedTechnologies([...selectedTechnologies, tech]);
    }
  };

  const handleContinue = () => {
    onSelect(selectedTechnologies);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">AI Technologies</h2>
      <p className="text-sm text-muted-foreground">
        Select the AI technologies and tools required for this role
      </p>
      
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm font-medium">Company Size Mode:</span>
        <span className={`px-3 py-1 rounded-full text-xs ${isEnterprise ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {isEnterprise ? 'Enterprise' : 'Startup/SMB'}
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(aiTechnologies).map(([category, techs]) => (
              <div key={category} className="border rounded-md p-4">
                <h3 className="font-medium mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {techs.map(tech => (
                    <button
                      key={tech}
                      onClick={() => toggleTechnology(tech)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTechnologies.includes(tech)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      } ${recommendedTechnologies.includes(tech) ? 'border-2 border-blue-300' : ''}`}
                    >
                      {tech}
                      {recommendedTechnologies.includes(tech) && (
                        <span className="ml-1 text-xs">★</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Selected Technologies ({selectedTechnologies.length})</h3>
            {selectedTechnologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTechnologies.map(tech => (
                  <div key={tech} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {tech}
                    <button
                      onClick={() => toggleTechnology(tech)}
                      className="ml-2 text-white hover:text-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No technologies selected yet</p>
            )}
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={selectedTechnologies.length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 