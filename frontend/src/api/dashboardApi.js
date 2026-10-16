import axiosClient from './axiosClient';

export const getDashboardDataApi = () => axiosClient.get('/dashboard');
