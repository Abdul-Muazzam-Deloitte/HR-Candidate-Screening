import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SessionsList } from './SessionsList';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {user?.role === 'hr' ? 'HR Dashboard' : 'Candidate Dashboard'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        
        {user?.role === 'hr' && (
          <button
            onClick={() => navigate('/new-screening')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Process</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      <SessionsList />
    </div>
  );
};