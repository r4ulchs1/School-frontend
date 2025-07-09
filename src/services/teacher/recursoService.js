import apiClient from '../apiClient';

const API_PATH = '/recursos';

const recursoService = {
  crearRecurso: async (recursoData) => {
    try {
      const response = await apiClient.post(API_PATH, recursoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear recurso:', error);
      throw error;
    }
  },

  obtenerRecursoPorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener recurso con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodosLosRecursos: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todos los recursos:', error);
      throw error;
    }
  },

  obtenerRecursosPorLeccion: async (leccionId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/leccion/${leccionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener recursos para la lección con ID ${leccionId}:`, error);
      throw error;
    }
  },

  actualizarRecurso: async (id, recursoData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, recursoData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar recurso con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarRecurso: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Recurso con ID ${id} eliminado.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar recurso con ID ${id}:`, error);
      throw error;
    }
  },
};

export default recursoService;