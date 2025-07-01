import React, { useEffect,useState,createContext,useContext } from "react";
import authService from '../services/authService';

const AuthContext= createContext(null);

export const AuthProvider= ({children})=>{
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);
    const [isAuthenticated,setIsAuthenticated]=useState(false);

    useEffect(()=>{
        const initAuth=async ()=>{
            const storedUser= authService.getCurrentUser();
            const token= authService.getToken();


            console.log('AuthContext initAuth - storedUser:', storedUser);
            console.log('AuthContext initAuth - token:', token);

            if(storedUser && token){
                setUser(storedUser);
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        initAuth();
    },[]);

    const login=async(email,password)=>{
        setLoading(true);
        try {
            const response=await authService.login(email,password);
            const {jwtToken,id,email:userEmail,nombre,apellido,roles}=response;

            const userData={
                token: jwtToken,
                id,
                email:userEmail,
                nombre,
                apellido,
                roles,
            }

            setUser(userData);
            setIsAuthenticated(true);
            setLoading(false);



            console.log('AuthContext login - userData after successful login:', userData);
            console.log('AuthContext login - isAuthenticated:', true);


            return userData;

        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            authService.logout();
            setLoading(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    if (loading) {
        return <div>Cargando sesión...</div>;
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