import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitReport from './pages/SubmitReport';
import ReportDetails from './pages/ReportDetails';
import AgencyDashboard from './pages/AgencyDashboard';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              {/* Protected Routes - Citizens */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="citizen">
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-report"
                element={
                  <ProtectedRoute requiredRole="citizen">
                    <SubmitReport />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - All Users */}
              <Route
                path="/reports/:id"
                element={
                  <ProtectedRoute>
                    <ReportDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rewards"
                element={
                  <ProtectedRoute requiredRole="citizen">
                    <Rewards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Agencies */}
              <Route
                path="/agency"
                element={
                  <ProtectedRoute requiredRole="agency">
                    <AgencyDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Admins */}
              <Route
                path="/admincleancity"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App;
