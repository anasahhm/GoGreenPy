import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../features/auth/authSlice';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!user && isAuthenticated) {
        try {
          await dispatch(loadUser());
        } catch (err) {
          console.error('Error loading user:', err);
        }
      }
      // Always mark as initialized after auth check
      setIsInitialized(true);
    };

    initAuth();
  }, [dispatch, user, isAuthenticated]);

  // Show nothing while auth is being checked
  if (!isInitialized || authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f0eb',
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: 'rgba(0,0,0,0.4)',
          letterSpacing: '0.08em',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;