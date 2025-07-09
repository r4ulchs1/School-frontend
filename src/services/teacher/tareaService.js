import apiClient from '../apiClient';

const API_PATH = '/tareas';

const tareaService = {
  crearTarea: async (tareaData) => {
    try {
      const response = await apiClient.post(API_PATH, tareaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  },

  obtenerTareaPorId: async (id) => {
    try {
      const response = await apiClient.get(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tarea con ID ${id}:`, error);
      throw error;
    }
  },

  obtenerTodasLasTareas: async () => {
    try {
      const response = await apiClient.get(API_PATH);
      return response.data;
    } catch (error) {
      console.error('Error al obtener todas las tareas:', error);
      throw error;
    }
  },

  obtenerTareasPorLeccion: async (leccionId) => {
    try {
      const response = await apiClient.get(`${API_PATH}/leccion/${leccionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener tareas para la lección con ID ${leccionId}:`, error);
      throw error;
    }
  },

  actualizarTarea: async (id, tareaData) => {
    try {
      const response = await apiClient.put(`${API_PATH}/${id}`, tareaData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar tarea con ID ${id}:`, error);
      throw error;
    }
  },

  eliminarTarea: async (id) => {
    try {
      await apiClient.delete(`${API_PATH}/${id}`);
      console.log(`Tarea con ID ${id} eliminada.`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar tarea con ID ${id}:`, error);
      throw error;
    }
  },
};

export default tareaService;