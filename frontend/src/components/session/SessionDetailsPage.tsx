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
      <div className="bg-gray-50 flex items-center justify-center">
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
      <div className="flex flex-col bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          {/* Candidate Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Candidate */}
            <div className="flex items-center space-x-3">
              {/* back Button */}
              <button
                onClick={dashboardClick}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Candidate</p>
                <p className="text-sm text-gray-600">{currentSession.candidate.name}</p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Position</p>
                <p className="text-sm text-gray-600">{currentSession.jobDescription?.title}</p>
                <p className="text-xs text-gray-500">{currentSession.jobDescription?.department}</p>
              </div>
            </div>

            {/* Created */}
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
          </div>

          {/* Process Tracker Card */}
          <div className="flex-1">
            <ProcessTracker
              session={currentSession}
              nodes={currentSession.processNodes}
            />
          </div>
        </div>
    </div>
  );
};