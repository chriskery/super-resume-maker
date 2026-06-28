import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a stable mock axios instance
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

// Mock axios.create to always return our stable mock instance
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Import after mock so resumeApi uses the mock instance
const { resumeApi } = await import('../services/api');

describe('resumeApi', () => {
  beforeEach(() => {
    // Only clear the mock call history on the axios instance methods
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
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

  it('delete(id) should call DELETE /resumes/:id', async () => {
    mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

    await resumeApi.delete('1');

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/resumes/1');
  });
});
