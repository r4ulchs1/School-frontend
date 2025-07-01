import apiClient from "./apiClient";


const AUTH_API_URL='/auth/';

const authService={
    login:async(email,password)=>{
        try{
            const response= await apiClient.post(`${AUTH_API_URL}login`,{
                email,password,
            });

            if(response.data.jwtToken){
                localStorage.setItem('jwtToken',response.data.jwtToken);
                const userSt={
                    id:response.data.id,
                    email:response.data.email,
                    nombre:response.data.nombre,
                    apellido:response.data.apellido,
                    roles:response.data.roles,
                }
                localStorage.setItem('user',JSON.stringify(userSt));
            }
            return response.data;
        }catch(error){
            console.error('Error during loging: ',error);
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