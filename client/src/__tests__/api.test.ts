import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a stable mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

// Mock axios.create to always return our stable mock instance
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Import after mock so resumeApi uses the mock instance
const { resumeApi, aiApi } = await import('../services/api');

describe('resumeApi', () => {
  beforeEach(() => {
    // Only clear the mock call history on the axios instance methods
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    mockAxiosInstance.patch.mockClear();
    mockAxiosInstance.delete.mockClear();
  });

  it('list() should call GET /resumes and return data', async () => {
    const mockData = [{ id: '1', title: '简历1' }];
    mockAxiosInstance.get.mockResolvedValue({ data: mockData });

    const result = await resumeApi.list();

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/resumes');
    expect(result).toEqual(mockData);
  });

  it('get(id) should call GET /resumes/:id and return data', async () => {
    const mockData = { id: '1', title: '简历1' };
    mockAxiosInstance.get.mockResolvedValue({ data: mockData });

    const result = await resumeApi.get('1');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/resumes/1');
    expect(result).toEqual(mockData);
  });

  it('create(data) should call POST /resumes and return data', async () => {
    const input = { title: '新简历', templateId: 'minimal' };
    const mockData = { id: 'new-id', ...input };
    mockAxiosInstance.post.mockResolvedValue({ data: mockData });

    const result = await resumeApi.create(input);

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/resumes', input);
    expect(result).toEqual(mockData);
  });

  it('update(id, data) should call PUT /resumes/:id and return data', async () => {
    const input = { title: '更新简历' };
    const mockData = { id: '1', ...input };
    mockAxiosInstance.put.mockResolvedValue({ data: mockData });

    const result = await resumeApi.update('1', input);

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/resumes/1', input);
    expect(result).toEqual(mockData);
  });

  it('patch(id, data) should call PATCH /resumes/:id and return data', async () => {
    const input = { title: '部分更新' };
    const mockData = { id: '1', title: '部分更新', templateId: 'professional' };
    mockAxiosInstance.patch.mockResolvedValue({ data: mockData });

    const result = await resumeApi.patch('1', input);

    expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/resumes/1', input);
    expect(result).toEqual(mockData);
  });

  it('duplicate(id) should call POST /resumes/:id/duplicate and return data', async () => {
    const mockData = { id: 'dup-1', title: '简历1 (副本)' };
    mockAxiosInstance.post.mockResolvedValue({ data: mockData });

    const result = await resumeApi.duplicate('1');

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/resumes/1/duplicate');
    expect(result).toEqual(mockData);
  });

  it('delete(id) should call DELETE /resumes/:id', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

    await resumeApi.delete('1');

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/resumes/1');
  });
});

describe('aiApi', () => {
  beforeEach(() => {
    mockAxiosInstance.post.mockClear();
  });

  it('duplicate(id) should call POST /resumes/:id/duplicate and return data', async () => {
    const mockData = { id: 'dup-1', title: '简历1 (副本)' };
    mockAxiosInstance.post.mockResolvedValue({ data: mockData });

    const result = await aiApi.duplicate('1');

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/resumes/1/duplicate');
    expect(result).toEqual(mockData);
  });
});
