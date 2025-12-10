// src/App.jsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MwamkoHeader from './components/Header';
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmergencyCasesPage from "./pages/EmergencyCasesPage";
import RoutesMapPage from "./pages/RoutesMapPage";
import VehiclesPage from "./pages/VehiclesPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import PrivateRoute from './components/PrivateRoute';
import "./utils/debugUtils";

const App = () => {
  return (
    <BrowserRouter>
      <MwamkoHeader />

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Private Routes - Protected by JWT Token */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/emergency-cases" 
          element={
            <PrivateRoute>
              <EmergencyCasesPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/routes" 
          element={
            <PrivateRoute>
              <RoutesMapPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/vehicles" 
          element={
            <PrivateRoute>
              <VehiclesPage />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/ai-insights" 
          element={
            <PrivateRoute>
              <AIInsightsPage />
            </PrivateRoute>
          } 
        />

        {/* Default route redirects to dashboard if authenticated, otherwise login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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