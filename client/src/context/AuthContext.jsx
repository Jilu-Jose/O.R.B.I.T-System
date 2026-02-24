import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const handleUnauthorized = () => setUser(null);
        window.addEventListener('auth-unauthorized', handleUnauthorized);

        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, []);

    const login = async (email, password, role) => {
        const { data } = await api.post('/auth/login', { email, password, role });
        setUser(data);
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        setUser(data);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
