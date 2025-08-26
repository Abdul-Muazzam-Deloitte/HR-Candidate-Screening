import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Mail, Calendar, MapPin, Phone, FileText } from 'lucide-react';
import { ProcessTracker } from './ProcessTracker';

interface CandidateDetailsProps {
  candidateId?: string;
  onBack?: () => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({ 
  candidateId = 'demo-candidate',
  onBack 
}) => {
  const { user } = useAuth();

  // Mock candidate data - in real app, this would come from your API
  const candidate = {
    id: candidateId,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    position: 'Senior Frontend Developer',
    appliedDate: '2024-01-15',
    experience: '5 years',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    education: 'BS Computer Science - Stanford University',
    status: 'In Review'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Viewing as: {user?.role === 'hr' ? 'HR Staff' : 'Candidate'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Candidate Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                  <p className="text-lg text-gray-600">{candidate.position}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {candidate.appliedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{candidate.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {candidate.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-gray-900">{candidate.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-gray-900">{candidate.phone}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <p className="text-gray-900">{candidate.experience}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Education</span>
                </div>
                <p className="text-gray-900">{candidate.education}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Process Tracker */}
          <ProcessTracker 
            candidateId={candidate.id}
            websocketUrl={`ws://localhost:8000/ws/langgraph`}
          />
        </div>
      </main>
    </div>
  );
};