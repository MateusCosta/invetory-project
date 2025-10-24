import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
