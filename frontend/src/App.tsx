import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <AuthProvider>
      <ScreeningProvider>
        <JobDescriptionProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
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
                  <ProtectedRoute>
                    <Layout>
                      <NewScreeningPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-descriptions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <JobDescriptionsPage />
                    </Layout>
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
              <Route
                path="/interview/:sessionId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InterviewScreen />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview-completed/:sessionId"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InterviewCompleted />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </JobDescriptionProvider>
      </ScreeningProvider>
    </AuthProvider>
  );
}

export default App;