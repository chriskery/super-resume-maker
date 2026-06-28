import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { Resume } from '../types/resume';

const emptyOthers = { certificates: [], languages: [], hobbies: [], activities: [] };

const mockResumes: Resume[] = [
  {
    id: '1',
    title: '简历A',
    templateId: 'professional',
    personalInfo: { name: '张三', phone: '13800138000', email: 'a@b.com', title: '工程师' },
    summary: '',
    education: [],
    workExperience: [],
    projectExperience: [],
    organizationExperience: [],
    awards: [],
    skills: [],
    others: emptyOthers,
    tags: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: '简历B',
    templateId: 'minimal',
    personalInfo: { name: '李四', phone: '13900139000', email: 'c@d.com', title: '设计师' },
    summary: '',
    education: [],
    workExperience: [],
    projectExperience: [],
    organizationExperience: [],
    awards: [],
    skills: [],
    others: emptyOthers,
    tags: [],
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockList = vi.fn();

vi.mock('../services/api', () => ({
  resumeApi: {
    list: (...args: any[]) => mockList(...args),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    patch: vi.fn(),
    duplicate: vi.fn(),
    delete: vi.fn(),
  },
}));

// Import hook after mock
const { useResumeList } = await import('../hooks/useResumeList');

describe('useResumeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading=true and empty resumes', () => {
    mockList.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useResumeList());
    expect(result.current.loading).toBe(true);
    expect(result.current.resumes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load resumes and set loading=false on success', async () => {
    mockList.mockResolvedValue(mockResumes);

    const { result } = renderHook(() => useResumeList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.resumes).toEqual(mockResumes);
    expect(result.current.error).toBeNull();
  });

  it('should set error message on failure', async () => {
    mockList.mockRejectedValue(new Error('网络错误'));

    const { result } = renderHook(() => useResumeList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.resumes).toEqual([]);
    expect(result.current.error).toBe('网络错误');
  });

  it('should refresh data when refresh() is called', async () => {
    mockList.mockResolvedValue(mockResumes);

    const { result } = renderHook(() => useResumeList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Now refresh with new data
    const newResumes = [mockResumes[0]];
    mockList.mockResolvedValue(newResumes);

    // Call refresh
    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.resumes).toEqual(newResumes);
    });
  });
});
