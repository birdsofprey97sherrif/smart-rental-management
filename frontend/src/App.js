import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';

// Contexts
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages / Components
import RegisterComponent from './componets/registerComponent';
import LoginComponent from './componets/loginComponent';
import ResetPassword from './componets/resetpassword';
import AdminDashboard from './componets/AdminDashboard';
import ProtectedRoute from './componets/ProtectedRoute';
import AdminStaffPage from './componets/AdminStaffPage';
import RegisterStaffPage from './componets/RegisterStaffPage';
import BroadcastMessagePage from './componets/BroadcastMessagePage';
import DefaulterListPage from './componets/DefaulterListPage';
import RelocationRequestPage from './componets/RelocationRequestPage';
import AdminLayout from './componets/AdminLayout';
import AdminDashboardPage from './componets/AdminDashboardPage';
import StaffListPage from './componets/StaffListPage';
import AdminCharts from './componets/AdminCharts';
import EditStaffPage from './componets/EditStaffPage';
import TenantSidebarLayout from "./componets/TenantSidebarLayout";
import TenantDashboard from "./componets/TenantDashboard";
import PaymentHistory from "./componets/PaymentHistory";
import RelocationRequestForm from "./componets/RelocationRequestForm";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                {/* <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} /> */}
                <Route path="/register" element={<RegisterComponent />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminStaffPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/staff/register" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RegisterStaffPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/broadcast" element={<ProtectedRoute requiredRole="admin"><AdminLayout><BroadcastMessagePage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/defaulters" element={<ProtectedRoute requiredRole="admin"><AdminLayout><DefaulterListPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/relocations" element={<ProtectedRoute requiredRole="admin"><AdminLayout><RelocationRequestPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/staff/list" element={<ProtectedRoute requiredRole="admin"><AdminLayout><StaffListPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/charts" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminCharts /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/staff/edit/:id" element={<ProtectedRoute requiredRole="admin"><AdminLayout><EditStaffPage /></AdminLayout></ProtectedRoute>} />
                <Route path="/tenant" element={<ProtectedRoute> <TenantSidebarLayout /> </ProtectedRoute>}>
                  <Route path="dashboard" element={<TenantDashboard />} />
                  <Route path="payments" element={<PaymentHistory />} />
                  <Route path="relocation" element={<RelocationRequestForm />} />
                </Route>
                <Route path="/tenant/relocation" element={<RelocationRequestForm />} />
                <Route path="/tenant/payments" element={<PaymentHistory />} />



              </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
