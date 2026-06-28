import { useState, useEffect, useCallback } from 'react';
import { Resume } from '../types/resume';
import { resumeApi } from '../services/api';

export function useResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resumeApi.list();
      setResumes(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || '加载简历列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { resumes, loading, error, refresh };
}
