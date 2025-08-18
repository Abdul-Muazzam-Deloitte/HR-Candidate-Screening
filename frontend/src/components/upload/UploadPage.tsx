import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, User, Briefcase } from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { JobDescriptionForm } from '../JobDescriptionForm';
import { useScreening } from '../../contexts/ScreeningContext';
import { Candidate, JobDescription } from '../../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSession } = useScreening();
  const [step, setStep] = useState<'upload' | 'job-description'>('upload');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
     // email: 'candidate@example.com', // In real app, this would be extracted from CV
      cvFile: file,
      uploadedAt: new Date(),
      status: 'uploaded'
    };
    
    setCandidate(newCandidate);
    setStep('job-description');
    setIsProcessing(false);
  };

  const handleJobDescriptionSubmit = async (jobDescription: JobDescription) => {
    if (!candidate) return;
    
    setIsProcessing(true);
    
    try {
      const sessionId = await createSession(candidate, jobDescription);
      navigate(`/candidate-details/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                New Screening Session
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${
                step === 'upload' ? 'text-blue-600' : 'text-green-600'
              }`}>
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Upload CV</span>
              </div>
              
              <div className={`w-8 h-px ${
                step === 'job-description' ? 'bg-green-300' : 'bg-gray-300'
              }`} />
              
              <div className={`flex items-center space-x-2 ${
                step === 'job-description' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <Briefcase className="w-5 h-5" />
                <span className="text-sm font-medium">Job Description</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Candidate CV
              </h2>
              <p className="text-gray-600">
                Start the screening process by uploading the candidate's resume
              </p>
            </div>
            
            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".pdf,.doc,.docx"
              maxSize={10}
              className={isProcessing ? 'opacity-50 pointer-events-none' : ''}
            />
            
            {isProcessing && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Processing CV...</p>
              </div>
            )}
          </div>
        )}

        {step === 'job-description' && candidate && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Define Job Requirements
              </h2>
              <p className="text-gray-600">
                Provide the job description to match against {candidate.name}'s profile
              </p>
            </div>
            
            <JobDescriptionForm 
              onSubmit={handleJobDescriptionSubmit}
              className={isProcessing ? 'opacity-50 pointer-events-none' : ''}
            />
            
            {isProcessing && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Creating screening session...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};