import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, CheckCircle, AlertTriangle, User, UserCheck, FileText, Users, Briefcase, ClipboardCheck, Shield } from 'lucide-react';
import { useScreening } from '../../contexts/ScreeningContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProcessNode, ScreeningSession } from '../../types';

export const SessionsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions } = useScreening();

const getProcessColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'document_extraction':
      return 'bg-yellow-100 text-yellow-800';
    case 'cv_scoring':
      return 'bg-orange-100 text-orange-800';
    case 'social_media_screening':
      return 'bg-pink-100 text-pink-800';
    case 'candidate_assessment':
      return 'bg-teal-100 text-teal-800';
    case 'report_generation':
      return 'bg-cyan-100 text-cyan-800';
    case 'question_generation':
      return 'bg-blue-100 text-blue-800';
    case 'interview_in_progress':
      return 'bg-purple-100 text-purple-800';
    case 'interview_completed':
      return 'bg-indigo-100 text-indigo-800';
    case 'evaluated':
      return 'bg-green-100 text-green-800';
    case 'project_contribution':
      return 'bg-lime-100 text-lime-800';
    case 'job_posting_determination':
      return 'bg-amber-100 text-amber-800'; 
    case 'world_check':
      return 'bg-red-100 text-red-800'; 
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getProcessIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'document_extraction':
      return <FileText className="w-4 h-4" />;
    case 'cv_scoring':
      return <CheckCircle className="w-4 h-4" />;
    case 'social_media_screening':
      return <Users className="w-4 h-4" />;
    case 'candidate_assessment':
      return <UserCheck className="w-4 h-4" />;
    case 'report_generation':
      return <FileText className="w-4 h-4" />;
    case 'question_generation':
      return <AlertTriangle className="w-4 h-4" />;
    case 'interview_in_progress':
      return <Clock className="w-4 h-4" />;
    case 'interview_completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'evaluated':
      return <CheckCircle className="w-4 h-4" />;
    case 'project_contribution':
      return <Briefcase className="w-4 h-4" />;
    case 'job_posting_determination':
      return <ClipboardCheck  className="w-4 h-4" />; 
    case 'world_check':
      return <Shield className="w-4 h-4" />; // 
    default:
      return <Clock className="w-4 h-4" />;
  }
};


  const handleViewSession = (sessionId: string) => {

    const session = sessions.find(s => s.id === sessionId);
    
    if (session?.status === 'question_generation' && user?.role === 'candidate') {
      navigate(`/interview/${session?.id}`);
    } else {
      navigate(`/candidate-details/${session?.id}`);
    }
  };

  const formatProcess = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {user?.role === 'hr' ? 'Candidates' : 'My Interviews'}
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
                Process Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
        {sessions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates matched yet</h3>
                <p className="text-gray-500">
                  {user?.role === 'hr' 
                    ? 'Upload a CV to start the matching process'
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
                    {session.jobDescription?.title ? session.jobDescription?.title : "-" }
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.jobDescription?.department}
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getProcessColor(session.status)}`}>
                  {getProcessIcon(session.status)}
                  <span>{formatProcess(session.status)}</span>
                </span>
              </td>

              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </td>
              
              {/* Action */}
              <td className="px-6 py-4 whitespace-nowrap">

                {/* {session.processNodes?.length && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Interview Decisions</p>

                    {session.processNodes.map((node: ProcessNode) => (
                      node.result?.process_to_interview && (
                        <p key={node.id} className="text-sm font-medium mb-1">
                          {node.name}:
                          <span
                            className={`font-bold ${
                              node.result.process_to_interview === 'Yes' ? 'text-green-600' : 'text-red-600'
                            } ml-2`}
                          >
                            {node.result.process_to_interview === 'Yes' ? 'Go' : 'No Go'}
                          </span>
                        </p>
                      )
                    ))}
                  </div>
                )} 
                */}

              </td>

              {/* Buttons */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {session.status === 'question_generation' && user?.role === 'candidate' && (
                    <button
                      onClick={() => handleViewSession(session.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Start Interview
                    </button>
                  )}
                  {user?.role === 'hr' && (
                  <button
                    onClick={() => handleViewSession(session.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  )}
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