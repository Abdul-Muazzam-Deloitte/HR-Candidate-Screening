import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, User, Briefcase, ChevronDown } from 'lucide-react';
import { FileUpload } from '../FileUpload';
import { useScreening } from '../../contexts/ScreeningContext';
import { useJobDescriptions } from '../../contexts/JobDescriptionContext';
import { Candidate, JobDescription } from '../../types';
import { apiService, CVExtractionResult } from '../../services/apiService';

export const NewScreeningPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSession, extractCVContents } = useScreening();
  const { jobDescriptions } = useJobDescriptions();
  const [step, setStep] = useState<'upload' | 'cv_matching'>('upload');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    // Store the uploaded file and create basic candidate info
    setUploadedFile(file);
    
    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      email: 'candidate@example.com',
      cvFile: file,
      uploadedAt: new Date(),
      status: 'uploaded'
    };
    
    setCandidate(newCandidate);
    setStep('cv_matching');
  };

  const handleJobSelection = async () => {
    if (!candidate || !uploadedFile) return;
      
    setIsProcessing(true);

    try {
      // Create session first with basic candidate info
      const session = await createSession(candidate, uploadedFile);
      navigate(`/candidate-details/${session.id}`);

      
      // 2️⃣ Call API service to start the workflow
      await extractCVContents(session.id, uploadedFile);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // const selectedJob = jobDescriptions.find(jd => jd.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <nav className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${
                step === 'upload' ? 'text-blue-600' : 'text-green-600'
              }`}>
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Upload CV</span>
              </div>
              
              <div className={`w-8 h-px ${
                step === 'cv_matching' ? 'bg-green-300' : 'bg-gray-300'
              }`} />
              
              <div className={`flex items-center space-x-2 ${
                step === 'cv_matching' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <Briefcase className="w-5 h-5" />
                <span className="text-sm font-medium">Matching Process</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        {step === 'upload' && (
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Upload Candidate CV
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Start the screening process by uploading the candidate's resume. 
                  We support PDF format up to 10MB.
                </p>
              </div>
              
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf"
                maxSize={10}
                className={`${isProcessing ? 'opacity-50 pointer-events-none' : ''} mb-8`}
              />
              
              {isProcessing && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-lg font-medium">Extracting CV contents...</span>
                  </div>
                  <p className="text-gray-500 mt-2">This may take a few moments</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Uploading CV...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'cv_matching' && candidate && (
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Proceed to Matching Process
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Start the matching process against {candidate.name}'s profile
                </p>
              </div>

              {/* Candidate Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-4">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">{candidate.name}</p>
                    <div className="text-gray-500 space-y-1">
                      <p>Email: {candidate.email}</p>
                      <p>Uploaded: {candidate.uploadedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* File info display */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">File Information:</h4>
                  <div className="text-sm text-gray-600">
                    <p>File: {uploadedFile?.name}</p>
                    <p>Size: {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0'} MB</p>
                    <p className="text-xs text-gray-500 mt-1">
                      CV content will be extracted when you start the matching process
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Selection Dropdown
              <div className="mb-8">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Job Description *
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between text-lg"
                  >
                    <span className={selectedJob ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedJob ? selectedJob.title : 'Select a job description'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {jobDescriptions.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500">
                          No job descriptions available. Create one first.
                        </div>
                      ) : (
                        jobDescriptions.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{job.title}</p>
                              <p className="text-sm text-gray-500">{job.department} • {job.experience}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div> */}

              {/* Selected Job Preview
              {selectedJob && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">Selected Job Description</h3>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Title:</strong> {selectedJob.title}</p>
                    <p><strong>Department:</strong> {selectedJob.department}</p>
                    <p><strong>Experience:</strong> {selectedJob.experience}</p>
                    <p><strong>Key Skills:</strong> {selectedJob.skills.slice(0, 5).join(', ')}</p>
                  </div>
                </div>
              )} */}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setStep('upload')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-lg"
                >
                  Back
                </button>
                
                <button
                  onClick={handleJobSelection}
                  // disabled={!selectedJobId || isProcessing}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isProcessing ? 'Creating Session...' : 'Start Process'}
                </button>
              </div>
              
              {isProcessing && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-lg font-medium">Extracting CV and creating session...</span>
                  </div>
                  <p className="text-gray-500 mt-2">Processing CV contents and matching with job requirements</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};