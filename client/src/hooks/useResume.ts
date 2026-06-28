import { useState, useEffect, useCallback } from 'react';
import { Resume } from '../types/resume';
import { resumeApi } from '../services/api';

export function useResume(id?: string) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = !id || id === 'new';

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const data = await resumeApi.get(id);
      setResume(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || '加载简历失败');
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (data: Partial<Resume>) => {
    setLoading(true);
    setError(null);
    try {
      let saved: Resume;
      if (resume?.id) {
        saved = await resumeApi.update(resume.id, data);
      } else {
        saved = await resumeApi.create(data);
      }
      setResume(saved);
      return saved;
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || '保存失败';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [resume?.id]);

  return { resume, setResume, loading, error, save, isNew };
}
