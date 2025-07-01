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

    enrollStudentInCourse: async (alumnoId, cursoId) => {
        try {
            const response = await apiClient.post(`${USER_API_URL}/${alumnoId}/inscribir/${cursoId}`);
            return response.data;
        } catch (error) {
            console.error(`Error enrolling student ${alumnoId} in course ${cursoId}:`, error);
            throw error;
        }
    },

    unenrollStudentFromCourse: async (alumnoId, cursoId) => {
        try {
            const response = await apiClient.delete(`${USER_API_URL}/${alumnoId}/desinscribir/${cursoId}`);
            return response.data;
        } catch (error) {
            console.error(`Error unenrolling student ${alumnoId} from course ${cursoId}:`, error);
            throw error;
        }
    },
};

export default userService;