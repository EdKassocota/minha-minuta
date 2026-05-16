import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NovaMinuta from './pages/NovaMinuta';
import GerarDocumento from './pages/GerarDocumento';
import Templates from './pages/Templates';
import Conta from './pages/Conta';
import AdminDashboard from './pages/AdminDashboard';

// Layout
import AppLayout from './components/AppLayout';
import { useAuth } from './lib/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected App Routes Wrapper */}
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="nova-minuta" element={<NovaMinuta />} />
          <Route path="gerar/:id" element={<GerarDocumento />} />
          <Route path="templates" element={<Templates />} />
          <Route path="conta" element={<Conta />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
