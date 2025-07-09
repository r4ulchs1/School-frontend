import apiClient from "../apiClient";

const courseService = {
    getAllCourses: async () => {
        try {
            const response = await apiClient.get('/cursos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todos los cursos:', error);
            throw error;
        }
    },

    getCourseById: async (id) => {
        try {
            const response = await apiClient.get(`/cursos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener curso con ID ${id}:`, error);
            throw error;
        }
    },

    createCourse: async (courseData) => {
        try {
            const response = await apiClient.post('/cursos', courseData);
            return response.data;
        } catch (error) {
            console.error('Error al crear curso:', error);
            throw error;
        }
    },

    updateCourse: async (id, courseData) => {
        try {
            const response = await apiClient.put(`/cursos/${id}`, courseData);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar curso con ID ${id}:`, error);
            throw error;
        }
    },

    deleteCourse: async (id) => {
        try {
            await apiClient.delete(`/cursos/${id}`);
            console.log(`Curso con ID ${id} eliminado.`);
        } catch (error) {
            console.error(`Error al eliminar curso con ID ${id}:`, error);
            throw error;
        }
    }
};

export default courseService;