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
  importResume: (text: string) =>
    api.post<Partial<Resume>>('/ai/import', { text }, { timeout: 60000 }).then(r => r.data),
  jdMatch: (resume: Resume, jobDescription: string) =>
    api.post<{ score: number; missingKeywords: string[]; suggestions: string[]; matchedSkills: string[] }>('/ai/jd-match', { resume, jobDescription }, { timeout: 60000 }).then(r => r.data),
  generateHighlights: (context: { position: string; company: string; description?: string; type: 'work' | 'project' }) =>
    api.post<{ highlights: string[] }>('/ai/generate-highlights', context, { timeout: 60000 }).then(r => r.data),
  duplicate: (id: string) =>
    api.post<Resume>(`/resumes/${id}/duplicate`).then(r => r.data),
};

/**
 * 通用 SSE 流式 fetch 函数
 * 支持服务端返回 data: {"content":"xxx"} 或直接 data: 纯文本 两种格式
 * onChunk 每次收到新内容时回调累积文本
 * onThinking 收到 thinking heartbeat 时回调（用于展示等待状态）
 * 返回完整文本
 */
export async function streamFetch(
  url: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  onThinking?: () => void
): Promise<string> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // 按行解析 SSE 格式：data: xxx\n\n
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;
      // 尝试解析 JSON（服务端可能发送 {content:"..."} 或纯文本）
      try {
        const json = JSON.parse(data);
        if (json.error) {
          throw new Error(json.error);
        }
        if (json.content) {
          fullText += json.content;
        }
        // thinking heartbeat: 通知调用方后台正在思考
        if (json.thinking === true) {
          onThinking?.();
        }
      } catch (e) {
        // JSON.parse 失败（SyntaxError）→ 当纯文本累加
        // 业务错误（Error）→ 重新抛出
        if (e instanceof SyntaxError) {
          fullText += data;
        } else {
          throw e;
        }
      }
      onChunk(fullText);
    }
  }
  return fullText;
}
