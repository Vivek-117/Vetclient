// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.login(username, password);
            if (response.success) {
                setUser(response.user);
                return { success: true, role: response.user.role };
            }
            return { success: false };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false };
        }
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            loading,
            role: user?.role  // <-- ADD THIS
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);