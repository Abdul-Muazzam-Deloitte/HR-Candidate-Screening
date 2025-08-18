import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CopilotKit } from "@copilotkit/react-core";
import { AuthProvider } from './contexts/AuthContext';
import { ScreeningProvider } from './contexts/ScreeningContext';
import { JobDescriptionProvider } from './contexts/JobDescriptionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { NewScreeningPage } from './components/screening/NewScreeningPage';
import { JobDescriptionsPage } from './components/jobdescription/JobDescriptionsPage';
import { InterviewScreen } from './components/interview/InterviewScreen';
import { InterviewCompleted } from './components/interview/InterviewCompleted';
import { SessionDetailsPage } from './components/session/SessionDetailsPage';

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <AuthProvider>
        <JobDescriptionProvider>
          <ScreeningProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/new-screening"
                  element={
                    <ProtectedRoute requiredRole="hr">
                      <Layout>
                        <NewScreeningPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/job-descriptions"
                  element={
                    <ProtectedRoute requiredRole="hr">
                      <Layout>
                        <JobDescriptionsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/interview/:sessionId"
                  element={
                    <ProtectedRoute requiredRole="candidate">
                      <InterviewScreen />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/interview/:sessionId/completed"
                  element={
                    <ProtectedRoute requiredRole="candidate">
                      <InterviewCompleted />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/candidate-details/:sessionId"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SessionDetailsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
          </ScreeningProvider>
        </JobDescriptionProvider>
      </AuthProvider>
    </CopilotKit>
  );
}

export default App;