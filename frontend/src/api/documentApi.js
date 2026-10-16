import axiosClient from './axiosClient';

export const uploadDocumentApi = (formData, onUploadProgress) =>
  axiosClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const getDocumentsApi = (params) => axiosClient.get('/documents', { params });
export const getDocumentByIdApi = (id) => axiosClient.get(`/documents/${id}`);
export const deleteDocumentApi = (id) => axiosClient.delete(`/documents/${id}`);
