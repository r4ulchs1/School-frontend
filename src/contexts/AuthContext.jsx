import React, { useEffect,useState,createContext,useContext } from "react";
import authService from '../services/authService';
import { useNavigate } from "react-router-dom";

const AuthContext= createContext(null);

export const AuthProvider= ({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const navigate=useNavigate();

    useEffect(()=>{
        const initAuth=async ()=>{
            const storedUser= authService.getCurrentUser();
            const token= authService.getToken();

            if(storedUser && token){
                setUser(storedUser);
            }
            setLoading(false);
        };

        initAuth();
    },[]);

    const login=async(email,password)=>{
        setLoading(true);
        try {
            const data=await authService.login(email,password);
            setUser(data.user);
            setLoading(false);
            return data;
        } catch (error) {
            setUser(null);
            authService.logout();
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        isAuthenticated: !!user, // true si hay un usuario logueado
        loading,
        login,
        logout,
        // Puedes añadir una función para verificar roles aquí si la lógica es compleja
        // hasRole: (role) => user && user.roles && user.roles.includes(role),
    };

    if (loading) {
        return <div>Cargando sesión...</div>; // O un componente de Spinner
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};