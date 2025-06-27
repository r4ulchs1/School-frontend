import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const apiClient= axios.create({
    baseURL: API_BASE_URL,
    headers:{
        'Content-Type':'application/json',
    },
});

apiClient.interceptors.request.use(
    config=>{
        const token=localStorage.getItem('jwtToken'); //clave jwtToken
        if(token){
            config.headers.Authorization= `Bearer ${token}`;
        }
        return config;
    },
    error=>{
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized: Token may be invalid or expired. Redirecting to login...');
        }
        return Promise.reject(error);
    }
);

export default apiClient;