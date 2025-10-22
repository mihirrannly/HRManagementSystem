import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Redirect component for old candidate-documents URLs
const CandidateDocumentsRedirect = () => {
  const { token } = useParams();
  return <Navigate to={`/candidate-portal/${token}`} replace />;
};

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import TestLogin from './pages/TestLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/Employees/Employees';
import EmployeeProfile from './pages/Employees/EmployeeProfile';
import Attendance from './pages/Attendance/Attendance';
import AttendanceImport from './pages/Attendance/AttendanceImport';
import RannklyAttendanceImport from './pages/Attendance/RannklyAttendanceImport';
import Leave from './pages/Leave/Leave';
import Payroll from './pages/Payroll/Payroll';
import Reports from './pages/Reports/Reports';
import OrganizationAdvanced from './pages/Organization/OrganizationAdvanced';
import Permissions from './pages/Permissions/Permissions';
import PermissionsDebug from './pages/Permissions/PermissionsDebug';
import PermissionsFixed from './pages/Permissions/PermissionsFixed';
import PermissionsManagement from './pages/Permissions/PermissionsManagement';
import AuthTest from './pages/Permissions/AuthTest';
import AssetManagement from './pages/Assets/AssetManagement';
import ExitManagement from './pages/ExitManagement/ExitManagement';
import SalaryManagement from './pages/SalaryManagement/SalaryManagement';
import FinanceManagement from './pages/FinanceManagement/FinanceManagement';
import Settings from './pages/Settings/Settings';
import AnnouncementManagement from './pages/Announcements/AnnouncementManagement';
import Expenses from './pages/Expenses/Expenses';
import OfferAcceptance from './pages/OfferAcceptance';
import CandidateDocuments from './pages/CandidateDocuments';
import DocumentLinkRecovery from './pages/DocumentLinkRecovery';
import CandidatePortal from './pages/CandidatePortal/CandidatePortal';
import SubmissionSuccess from './pages/CandidatePortal/SubmissionSuccess';
import CandidateReview from './pages/CandidateReview';
import DocumentSigning from './pages/DocumentSigning';
import Reportee from './pages/Reportee/Reportee';
import EmployeeFeedbackForm from './pages/ProbationFeedback/EmployeeFeedbackForm';
import ManagerFeedbackForm from './pages/ProbationFeedback/ManagerFeedbackForm';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#757575',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              
              {/* Test Login Route (Public) */}
              <Route
                path="/test-login"
                element={
                  <PublicRoute>
                    <TestLogin />
                  </PublicRoute>
                }
              />
              
              {/* Offer Acceptance Route (Public) */}
            <Route
              path="/offer-acceptance/:token"
              element={<OfferAcceptance />}
            />
            <Route
              path="/candidate-documents/:token"
              element={<CandidateDocumentsRedirect />}
            />
            <Route
              path="/document-link-recovery"
              element={<DocumentLinkRecovery />}
            />
            
            {/* Candidate Portal Routes (Public) */}
            <Route
              path="/candidate-portal/:candidateId?"
              element={<CandidatePortal />}
            />
            <Route
              path="/submission-success"
              element={<SubmissionSuccess />}
            />
            
            {/* Document Signing Route (Public) */}
            <Route
              path="/sign/:documentId"
              element={<DocumentSigning />}
            />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reportee" element={<Reportee />} />
                <Route path="organization" element={<OrganizationAdvanced />} />
                <Route path="candidate-review/:candidateId" element={<CandidateReview />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="attendance/import" element={<AttendanceImport />} />
                <Route path="attendance/import-rannkly" element={<RannklyAttendanceImport />} />
                <Route path="leave" element={<Leave />} />
                <Route path="payroll" element={<Payroll />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="reports" element={<Reports />} />
                <Route path="permissions" element={<PermissionsManagement />} />
                <Route path="assets" element={<AssetManagement />} />
                <Route path="exit-management" element={<ExitManagement />} />
                <Route path="finance-management" element={<FinanceManagement />} />
                <Route path="finance-management/salary-management" element={<SalaryManagement />} />
                <Route path="salary-management" element={<SalaryManagement />} />
                <Route path="announcements" element={<AnnouncementManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="probation-feedback/:id" element={<EmployeeFeedbackForm />} />
                <Route path="probation-feedback/manager/:id" element={<ManagerFeedbackForm />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;