const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Set up temp data dir BEFORE requiring fileStorage
const tmpDir = path.join(os.tmpdir(), `resume-test-${Date.now()}`);
process.env.DATA_DIR = tmpDir;

const {
  ensureDir,
  readResume,
  writeResume,
  deleteResume,
  listResumes,
  getDataDir,
} = require('../utils/fileStorage');

afterAll(async () => {
  // Clean up temp dir
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (_) {
    // ignore
  }
  delete process.env.DATA_DIR;
});

describe('fileStorage', () => {
  describe('ensureDir', () => {
    it('should create the data directory if it does not exist', async () => {
      await ensureDir();
      const stat = await fs.stat(tmpDir);
      expect(stat.isDirectory()).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      await ensureDir();
      await expect(ensureDir()).resolves.toBeUndefined();
    });
  });

  describe('writeResume + readResume', () => {
    beforeAll(async () => {
      await ensureDir();
    });

    it('should write a resume and read it back correctly', async () => {
      const id = 'test-resume-1';
      const data = {
        id,
        title: '测试简历',
        templateId: 'professional',
        personalInfo: { name: '张三', phone: '13800138000' },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      await writeResume(id, data);
      const result = await readResume(id);
      expect(result).toEqual(data);
    });

    it('should overwrite existing resume on write', async () => {
      const id = 'test-resume-1';
      const updated = {
        id,
        title: '更新后简历',
        templateId: 'minimal',
        personalInfo: { name: '李四', phone: '13900139000' },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };
      await writeResume(id, updated);
      const result = await readResume(id);
      expect(result.title).toBe('更新后简历');
      expect(result.personalInfo.name).toBe('李四');
    });
  });

  describe('listResumes', () => {
    beforeAll(async () => {
      await ensureDir();
      // Write two resumes
      await writeResume('list-1', {
        id: 'list-1', title: '简历A', templateId: 'minimal', updatedAt: '2024-01-01',
      });
      await writeResume('list-2', {
        id: 'list-2', title: '简历B', templateId: 'modern', updatedAt: '2024-01-02',
      });
    });

    it('should return an array of resume summaries', async () => {
      const list = await listResumes();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(2);
      const ids = list.map(r => r.id);
      expect(ids).toContain('list-1');
      expect(ids).toContain('list-2');
    });

    it('should only include id, title, templateId, updatedAt in summaries', async () => {
      const list = await listResumes();
      const item = list.find(r => r.id === 'list-1');
      expect(item).toEqual(
        expect.objectContaining({
          id: 'list-1',
          title: '简历A',
          templateId: 'minimal',
          updatedAt: '2024-01-01',
        })
      );
    });
  });

  describe('deleteResume', () => {
    beforeAll(async () => {
      await ensureDir();
      await writeResume('to-delete', {
        id: 'to-delete', title: '待删除', templateId: 'default', updatedAt: '2024-01-01',
      });
    });

    it('should delete an existing resume file', async () => {
      await deleteResume('to-delete');
      await expect(readResume('to-delete')).rejects.toThrow();
    });
  });

  describe('readResume - non-existent file', () => {
    it('should throw an error when reading a non-existent resume', async () => {
      await expect(readResume('does-not-exist')).rejects.toThrow();
    });
  });
});
