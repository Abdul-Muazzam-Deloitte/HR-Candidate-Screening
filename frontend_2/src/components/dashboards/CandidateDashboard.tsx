import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Calendar, CheckCircle, Clock, LogOut, Upload, Eye } from 'lucide-react';
import { CandidateDetails } from '../CandidateDetails';

export const CandidateDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showProcessTracker, setShowProcessTracker] = React.useState(false);

  const applications = [
    { id: 1, company: 'TechCorp Inc.', position: 'Frontend Developer', status: 'Interview Scheduled', date: '2024-01-15', stage: 'Technical Interview' },
    { id: 2, company: 'DataFlow Systems', position: 'React Developer', status: 'Under Review', date: '2024-01-12', stage: 'Application Review' },
    { id: 3, company: 'InnovateLab', position: 'Full Stack Developer', status: 'Completed', date: '2024-01-08', stage: 'Offer Extended' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showProcessTracker) {
    return (
      <CandidateDetails 
        candidateId={user?.id}
        onBack={() => setShowProcessTracker(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Candidate Portal</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile & Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Upload Resume</span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">View Profile</span>
            </button>
            <button 
              onClick={() => setShowProcessTracker(true)}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">Process Tracker</span>
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{application.position}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{application.company}</p>
                    <p className="text-sm text-gray-500">Current Stage: {application.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Applied on</p>
                    <p className="font-medium text-gray-900">{application.date}</p>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Interviews</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Technical Interview - TechCorp Inc.</h3>
                <p className="text-gray-600">Frontend Developer Position</p>
                <p className="text-sm text-blue-600 font-medium">Tomorrow at 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};