import axiosClient from './axiosClient';

export const getAllUsersApi = () => axiosClient.get('/admin/users');
export const toggleUserStatusApi = (id) => axiosClient.put(`/admin/users/${id}/status`);
export const getAllDocumentsAdminApi = () => axiosClient.get('/admin/documents');
export const getUsageStatsApi = () => axiosClient.get('/admin/usage');
