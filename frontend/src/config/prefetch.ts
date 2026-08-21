import axiosInstance from './axiosInstance';

export const prefetchAllData = (): void => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const endpoints = [
    '/users',
    '/batches',
    '/courses',
    '/employees',
    '/academies',
    '/library-plans',
    '/exams',
    '/inquiry-sources',
    '/fee-structures',
    '/students',
    '/roles',
    '/inquiries',
    '/tasks',
    '/follow-ups',
  ];

  // Fire requests asynchronously in parallel without blocking main thread
  endpoints.forEach((endpoint) => {
    axiosInstance.get(endpoint).catch(() => {});
  });
};
