import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import Rewards from './pages/Rewards';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatbot from './components/AIChatbot';
import useLenisScroll from './hooks/useLenisScroll'; // Import Lenis hook

function App() {
  // Initialize Lenis smooth scroll
  useLenisScroll();

  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analyzer" 
          element={
            <ProtectedRoute>
              <Analyzer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/rewards" 
          element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AIChatbot />
    </div>
  );
}

export default App;