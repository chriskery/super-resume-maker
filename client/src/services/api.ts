import axios from 'axios';
import { Resume } from '../types/resume';

const api = axios.create({ baseURL: '/api' });

export const resumeApi = {
  list: () => api.get<Resume[]>('/resumes').then(r => r.data),
  get: (id: string) => api.get<Resume>(`/resumes/${id}`).then(r => r.data),
  create: (data: Partial<Resume>) => api.post<Resume>('/resumes', data).then(r => r.data),
  update: (id: string, data: Partial<Resume>) => api.put<Resume>(`/resumes/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};
