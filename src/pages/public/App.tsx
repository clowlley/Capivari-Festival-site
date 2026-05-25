import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Login from '@/pages/public/Login';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOverview from '@/pages/admin/AdminOverview';

// Components for Layout
import ProtectedRoute from '@/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="overview" element={<AdminOverview />} />
          {/* Other admin routes will go here as they are created */}
        </Route>

        {/* Catch-all for unmatched routes */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;