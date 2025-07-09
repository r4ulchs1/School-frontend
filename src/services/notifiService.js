import apiClient from '../services/apiClient';

const API_BASE_URL = '/teacher/';

const sendWhatsAppNotification = (alumnoId, cursoId, mensaje) => {
    return apiClient.post(API_BASE_URL + 'enviar-mensaje', {
        alumnoId,
        cursoId,
        mensaje
    });
};

const notificationService = {
    sendWhatsAppNotification,
};

export default notificationService;