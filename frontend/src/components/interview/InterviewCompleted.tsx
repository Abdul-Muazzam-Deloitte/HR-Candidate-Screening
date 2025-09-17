import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home } from 'lucide-react';
import { useScreening } from '../../contexts/ScreeningContext';

export const InterviewCompleted: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions } = useScreening();

  const session = sessions.find(s => s.id === sessionId);

  const handleDownloadReport = () => {
    // Mock download functionality
    console.log('Downloading interview report');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600">The interview session could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Interview Completed!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for completing the interview, {session.candidate.name}. 
            Your responses have been submitted successfully and are now being evaluated.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your responses will be evaluated by our AI system</li>
              <li>• HR team will review the results</li>
              <li>• You'll be contacted within 2-3 business days</li>
            </ul>
          </div>

          {/* <div className="space-y-3">
            <button
              onClick={handleDownloadReport}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download Interview Summary</span>
            </button>
            
            <button
              onClick={handleBackToDashboard}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};