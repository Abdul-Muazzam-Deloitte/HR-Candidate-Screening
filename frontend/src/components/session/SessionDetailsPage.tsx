import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Briefcase } from 'lucide-react';
import { useScreening } from '../../contexts/ScreeningContext';
import { ProcessTracker } from '../dashboard/ProcessTracker';

export const SessionDetailsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, processNodes = [] } = useScreening();

  const dashboardClick = () => {
    navigate('/dashboard');

  };

  const currentSession = sessions.find(s => s.id === sessionId);

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The screening session could not be found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dashboardClick()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Candidate Details
                </h1>
                <p className="text-sm text-gray-500">
                  {currentSession.candidate.name} - {currentSession.jobDescription.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Candidate</p>
                    <p className="text-sm text-gray-600">{currentSession.candidate.name}</p>
                    { /* <p className="text-xs text-gray-500">{session.candidate.email}</p> */ }
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Position</p>
                    <p className="text-sm text-gray-600">{currentSession.jobDescription.title}</p>
                    <p className="text-xs text-gray-500">{currentSession.jobDescription.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(currentSession.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(currentSession.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* {currentSession.result.score > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Match Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            currentSession.result.score >= 70 ? 'bg-green-500' : 
                            currentSession.result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${currentSession.result.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {currentSession.result.score}%
                      </span>
                    </div>
                  </div>
                )} */}
              </div>
              
              {/* Additional Candidate Information */}
              {(currentSession.candidate.summary || currentSession.candidate.skills || currentSession.candidate.linkedinUrl) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Extracted Information</h3>
                  
                  {currentSession.candidate.summary && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Summary</p>
                      <p className="text-sm text-gray-700">{currentSession.candidate.summary}</p>
                    </div>
                  )}
                  
                  {currentSession.candidate.skills && currentSession.candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {currentSession.candidate.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {currentSession.candidate.skills.length > 6 && (
                          <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            +{currentSession.candidate.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentSession.candidate.linkedinUrl && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">LinkedIn</p>
                      <a
                        href={currentSession.candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        {currentSession.candidate.linkedinUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Process Tracker */}
          <div className="lg:col-span-2">
            <ProcessTracker
              session={currentSession}
              nodes={currentSession.processNodes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};