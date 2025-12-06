import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MwamkoHeader from './components/Header';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InviteUserPage from "./pages/InviteUserPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";
import PendingUsersPage from "./pages/PendingUsersPage";
import PrivateRoute from './components/PrivateRoute';
import "./utils/debugUtils";

const App = () => {
  return (
    <BrowserRouter>
      <MwamkoHeader /> {/* This header will be always visible */}

      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        
        {/* Private Routes - Protected */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/invite-user" 
          element={
            <PrivateRoute>
              <InviteUserPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/pending-users" 
          element={
            <PrivateRoute>
              <PendingUsersPage />
            </PrivateRoute>
          } 
        />

        {/* Default route that redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;