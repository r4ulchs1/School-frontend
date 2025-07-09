// src/services/foroService.js
import apiClient from '../apiClient';

const API_PATH = '/foros';

const foroService = {
  crearForo: async (foroData) => {
    try {
      const response = await apiClient.post(API_PATH, foroData);
      return response.data;
    } catch (error) {
      console.error('Error al crear foro:', error);
      throw error;
    }
  },

  obtenerForoPorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener foro con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodosLosForos: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todos los foros:', error);
      throw error;
    }
  },

  obtenerForoPorCurso: async (cursoId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/curso/${cursoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener foro para el curso con ID ${cursoId}:`, error);
      throw error;
    }
  },

  actualizarForo: async (id, foroData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, foroData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar foro con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarForo: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Foro con ID ${id} eliminado.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar foro con ID ${id}:`, error);
      throw error;
    }
  },
};

export default foroService;