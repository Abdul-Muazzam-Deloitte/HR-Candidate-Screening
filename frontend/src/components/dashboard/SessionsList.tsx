import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { useScreening } from '../../contexts/ScreeningContext';
import { useAuth } from '../../contexts/AuthContext';

export const SessionsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, setCurrentSession } = useScreening();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'questions_generated':
        return 'bg-blue-100 text-blue-800';
      case 'cv_processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview_in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'evaluated':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'questions_generated':
        return <AlertTriangle className="w-4 h-4" />;
      case 'cv_processing':
        return <Clock className="w-4 h-4" />;
      case 'interview_in_progress':
        return <Clock className="w-4 h-4" />;
      case 'evaluated':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    
    if (session?.status === 'questions_generated' && user?.role === 'candidate') {
      navigate(`/interview/${sessionId}`);
    } else {
      navigate(`/candidate-details/${sessionId}`);
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {user?.role === 'hr' ? 'Screening Sessions' : 'My Interviews'}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
        {sessions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-500">
                  {user?.role === 'hr' 
                    ? 'Upload a CV to start the screening process'
                    : 'No interview sessions available'
                  }
                </p>
              </td>
            </tr>
        ) : (
          sessions.map((session) => (
            <tr
              key={session.id}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Candidate */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {session.candidate.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.candidate.email}
                  </div>
                </div>
              </td>

              {/* Position */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {session.jobDescription.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.jobDescription.department}
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                  {getStatusIcon(session.status)}
                  <span>{formatStatus(session.status)}</span>
                </span>
              </td>

              {/* Match Score */}
              <td className="px-6 py-4 whitespace-nowrap">
                {session.result.score > 0 ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          session.result.score >= 70 ? 'bg-green-500' : 
                          session.result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${session.result.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {session.result.score}%
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>

              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {session.status === 'questions_generated' && user?.role === 'candidate' && (
                    <button
                      onClick={() => handleViewSession(session.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Start Interview
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleViewSession(session.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
          </tbody>
        </table>
      </div>
    </div>
  );
};