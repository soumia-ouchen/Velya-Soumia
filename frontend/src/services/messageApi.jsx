import api from './api';

export const getAllMessages = () => api.get('/messages');
export const getMessageById = (id) => api.get(`/messages/${id}`);
export const createMessage = (messageData) => api.post('/messages', messageData);
export const updateMessage = (id, messageData) => api.put(`/messages/${id}`, messageData);
export const deleteMessage = (id) => api.delete(`/messages/${id}`);
