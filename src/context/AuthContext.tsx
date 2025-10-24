import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials } from '../types';
import { MockApiService } from '../services/mockApi';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await MockApiService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('AuthContext.login() - Attempting login with:', credentials.username);
            setLoading(true);
            const { user } = await MockApiService.login(credentials);
            console.log('AuthContext.login() - Login successful for:', user.username);
            setUser(user);
            setIsAuthenticated(true);
        } catch (error) {
            console.log('AuthContext.login() - Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await MockApiService.logout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
