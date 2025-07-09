import apiClient from '../apiClient';

const API_PATH = '/entregas';

const entregaService = {
  crearEntrega: async (entregaData) => {
    try {
      const response = await apiClient.post(API_PATH, entregaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear entrega:', error);
      throw error;
    }
  },

  obtenerEntregaPorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrega con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodasLasEntregas: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las entregas:', error);
      throw error;
    }
  },

  obtenerEntregasPorTarea: async (tareaId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/tarea/${tareaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entregas para la tarea con ID ${tareaId}:`, error);
      throw error;
    }
  },

  obtenerEntregasPorAlumno: async (alumnoId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/alumno/${alumnoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entregas para el alumno con ID ${alumnoId}:`, error);
      throw error;
    }
  },

  obtenerEntregaPorTareaYAlumno: async (tareaId, alumnoId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/tarea/${tareaId}/alumno/${alumnoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrega para tarea ${tareaId} y alumno ${alumnoId}:`, error);
      throw error;
    }
  },

  actualizarEntrega: async (id, entregaData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, entregaData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar entrega con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarEntrega: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Entrega con ID ${id} eliminada.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar entrega con ID ${id}:`, error);
      throw error;
    }
  },
};

export default entregaService;