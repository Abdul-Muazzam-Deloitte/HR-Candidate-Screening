import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileText, Calendar, BarChart3, LogOut, Search, Plus } from 'lucide-react';
import { CandidateDetails } from '../CandidateDetails';

export const HRDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = React.useState<string | null>(null);

  const stats = [
    { label: 'Active Candidates', value: '24', icon: Users, color: 'bg-blue-500' },
    { label: 'Open Positions', value: '8', icon: FileText, color: 'bg-green-500' },
    { label: 'Interviews Scheduled', value: '12', icon: Calendar, color: 'bg-orange-500' },
    { label: 'Hired This Month', value: '3', icon: BarChart3, color: 'bg-purple-500' },
  ];

  const recentCandidates = [
    { id: 'sarah-johnson', name: 'Sarah Johnson', position: 'Frontend Developer', status: 'Interview Scheduled', time: '2 hours ago' },
    { id: 'michael-chen', name: 'Michael Chen', position: 'Data Analyst', status: 'Application Review', time: '4 hours ago' },
    { id: 'emily-davis', name: 'Emily Davis', position: 'UX Designer', status: 'Technical Assessment', time: '1 day ago' },
    { id: 'david-wilson', name: 'David Wilson', position: 'Backend Developer', status: 'Final Round', time: '2 days ago' },
  ];

  if (selectedCandidate) {
    return (
      <CandidateDetails 
        candidateId={selectedCandidate}
        onBack={() => setSelectedCandidate(null)}
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
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Post New Job</h3>
                <p className="text-gray-600 text-sm">Create a new job posting</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Applications</h3>
                <p className="text-gray-600 text-sm">Screen candidate profiles</p>
              </div>
            </div>
          </button>
          
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left group">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Schedule Interviews</h3>
                <p className="text-gray-600 text-sm">Manage interview calendar</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCandidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                    <p className="text-gray-600 text-sm">{candidate.position}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {candidate.status}
                    </span>
                    <p className="text-gray-500 text-sm mt-1">{candidate.time}</p>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors mt-1">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};