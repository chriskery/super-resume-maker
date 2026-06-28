import axios from 'axios';
import { Resume } from '../types/resume';

const api = axios.create({ baseURL: '/api' });

export const resumeApi = {
  list: () => api.get<Resume[]>('/resumes').then(r => r.data),
  get: (id: string) => api.get<Resume>(`/resumes/${id}`).then(r => r.data),
  create: (data: Partial<Resume>) => api.post<Resume>('/resumes', data).then(r => r.data),
  update: (id: string, data: Partial<Resume>) => api.put<Resume>(`/resumes/${id}`, data).then(r => r.data),
  patch: (id: string, data: Partial<Resume>) => api.patch<Resume>(`/resumes/${id}`, data).then(r => r.data),
  duplicate: (id: string) => api.post<Resume>(`/resumes/${id}/duplicate`).then(r => r.data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

export const aiApi = {
  polishText: (text: string, type: string) =>
    api.post<{ result: string }>('/ai/polish', { text, type }, { timeout: 30000 }).then(r => r.data),
  scoreResume: (resume: Resume, signal?: AbortSignal) =>
    api.post<{ score: number; suggestions: string[]; summary: string }>('/ai/score', { resume }, { timeout: 60000, signal }).then(r => r.data),
  importResume: (text: string) =>
    api.post<Partial<Resume>>('/ai/import', { text }, { timeout: 60000 }).then(r => r.data),
};
