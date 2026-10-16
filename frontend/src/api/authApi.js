import axiosClient from './axiosClient';

export const registerApi = (payload) => axiosClient.post('/auth/register', payload);
export const loginApi = (payload) => axiosClient.post('/auth/login', payload);
export const getMeApi = () => axiosClient.get('/auth/me');
export const updateMeApi = (payload) => axiosClient.put('/auth/me', payload);
