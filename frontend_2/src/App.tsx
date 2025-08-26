import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HRDashboard } from './components/dashboards/HRDashboard';
import { CandidateDashboard } from './components/dashboards/CandidateDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Setup demo users on first load
  useEffect(() => {
    const existingUsers = localStorage.getItem('hr_screening_users');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: 'hr-demo',
          email: 'hr@company.com',
          name: 'HR Manager',
          role: 'hr',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'candidate-demo',
          email: 'candidate@email.com',
          name: 'John Candidate',
          role: 'candidate',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('hr_screening_users', JSON.stringify(demoUsers));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  // Route based on user role
  if (user.role === 'hr') {
    return (
      <ProtectedRoute allowedRoles={['hr']}>
        <HRDashboard />
      </ProtectedRoute>
    );
  }

  if (user.role === 'candidate') {
    return (
      <ProtectedRoute allowedRoles={['candidate']}>
        <CandidateDashboard />
      </ProtectedRoute>
    );
  }

  return <AuthForm />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;