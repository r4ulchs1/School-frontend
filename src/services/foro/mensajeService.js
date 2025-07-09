// src/services/mensajeService.js
import apiClient from '../apiClient';

const API_PATH = '/mensajes';

const mensajeService = {
  crearMensaje: async (mensajeData) => {
    try {
      const response = await apiClient.post(API_PATH, mensajeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
  },

  obtenerMensajePorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mensaje con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodosLosMensajes: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todos los mensajes:', error);
      throw error;
    }
  },

  obtenerMensajesPorForo: async (foroId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/foro/${foroId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener mensajes para el foro con ID ${foroId}:`, error);
      throw error;
    }
  },

  actualizarMensaje: async (id, mensajeData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, mensajeData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar mensaje con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarMensaje: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Mensaje con ID ${id} eliminado.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar mensaje con ID ${id}:`, error);
      throw error;
    }
  },
};

export default mensajeService;