import axiosClient from './axiosClient';

export const queryAI = (question) => axiosClient.post('/ai/query', { question });
export const getQueryHistoryApi = (params) => axiosClient.get('/ai/query/history', { params });
export const generateAuditApi = (transactionSummary) => axiosClient.post('/ai/audit', { transactionSummary });
export const summarizeApi = (payload) => axiosClient.post('/ai/summarize', payload);
export const taxComparisonApi = (payload) => axiosClient.post('/ai/tax-comparison', payload);
