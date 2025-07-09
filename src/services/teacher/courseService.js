import apiClient from "../apiClient";

const teacherCourseService={

    getCoursesByTeacher: async (docenteId) => {
        try {
            const response = await apiClient.get(`/cursos/docente/${docenteId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener cursos para el docente con ID ${docenteId}:`, error);
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
    getAllCourses: async () => {
        try {
            const response = await apiClient.get('/cursos');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todos los cursos:', error);
            throw error;
        }
    },
}


export default teacherCourseService;