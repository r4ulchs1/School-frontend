import apiClient from "./apiClient";


const AUTH_API_URL='/auth/';

const authService={
    login:async(email,password)=>{
        try{
            const response= await apiClient.post(`${AUTH_API_URL}login`,{
                email,password,
            });

            if(response.data.token){
                localStorage.setItem('jwtToken',response.data.token);
                localStorage.setItem('user',JSON.stringify(response.data.user));
            }
            return response.data;
        }catch(error){
            console.error('Error during loing: ',error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
    },

    getToken: () => {
        return localStorage.getItem('jwtToken');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
}

export default authService;