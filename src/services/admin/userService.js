import apiClient from "../apiClient";

const USER_API_URL = '/usuarios';

const userService = {
    createUser: async (userData) => {
        try {
            const response = await apiClient.post(USER_API_URL, userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const response = await apiClient.get(USER_API_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await apiClient.get(`${USER_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user by ID ${id}:`, error);
            throw error;
        }
    },

    getUserByEmail: async (email) => {
        try {
            const response = await apiClient.get(`${USER_API_URL}/email/${email}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user by email ${email}:`, error);
            throw error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await apiClient.put(`${USER_API_URL}/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            await apiClient.delete(`${USER_API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    },
    //MATRRICULAR
    inscribirAlumnoEnCurso: async (alumnoId, cursoId) => {
        try {
            const response = await apiClient.post(`/usuarios/${alumnoId}/inscribir/${cursoId}`);
            console.log(`Alumno ${alumnoId} inscrito en curso ${cursoId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al inscribir alumno ${alumnoId} en curso ${cursoId}:`, error);
            throw error;
        }
    },

    desinscribirAlumnoDeCurso: async (alumnoId, cursoId) => {
        try {
            const response = await apiClient.delete(`/usuarios/${alumnoId}/desinscribir/${cursoId}`);
            console.log(`Alumno ${alumnoId} desinscrito de curso ${cursoId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al desinscribir alumno ${alumnoId} de curso ${cursoId}:`, error);
            throw error;
        }
    },
};

export default userService;