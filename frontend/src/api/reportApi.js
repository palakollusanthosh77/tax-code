import axiosClient from './axiosClient';

export const createReportApi = (payload) => axiosClient.post('/reports', payload);
export const getReportsApi = (params) => axiosClient.get('/reports', { params });
export const getReportByIdApi = (id) => axiosClient.get(`/reports/${id}`);
export const deleteReportApi = (id) => axiosClient.delete(`/reports/${id}`);
export const downloadReportPdfUrl = (id) =>
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/reports/${id}/pdf`;
