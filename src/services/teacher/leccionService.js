import apiClient from '../apiClient';

const API_PATH = '/lecciones';

const leccionService = {
  crearLeccion: async (leccionData) => {
    try {
      const response = await apiClient.post(API_PATH, leccionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear lección:', error);
      throw error;
    }
  },

  obtenerLeccionPorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener lección con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodasLasLecciones: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las lecciones:', error);
      throw error;
    }
  },

  obtenerLeccionesPorCurso: async (cursoId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/curso/${cursoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener lecciones para el curso con ID ${cursoId}:`, error);
      throw error;
    }
  },

  actualizarLeccion: async (id, leccionData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, leccionData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar lección con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarLeccion: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Lección con ID ${id} eliminada.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar lección con ID ${id}:`, error);
      throw error;
    }
  },
};

export default leccionService;