const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const express = require('express');
const request = require('supertest');

// Set up isolated temp data dir BEFORE loading modules
const tmpDir = path.join(os.tmpdir(), `resume-api-test-${Date.now()}`);
process.env.DATA_DIR = tmpDir;

const { ensureDir } = require('../utils/fileStorage');
const resumesRouter = require('../routes/resumes');

// Build a minimal express app (avoids server.js auto-listen)
const app = express();
app.use(express.json());
app.use('/api/resumes', resumesRouter);

let createdId;

beforeAll(async () => {
  await ensureDir();
});

afterAll(async () => {
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (_) {
    // ignore
  }
  delete process.env.DATA_DIR;
});

describe('Resume API', () => {
  describe('POST /api/resumes - create resume', () => {
    it('should create a resume and return it with an id', async () => {
      const res = await request(app)
        .post('/api/resumes')
        .send({ title: 'API测试简历', templateId: 'professional' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(typeof res.body.id).toBe('string');
      expect(res.body.title).toBe('API测试简历');
      expect(res.body.templateId).toBe('professional');
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
      createdId = res.body.id;
    });

    it('should use default title when none provided', async () => {
      const res = await request(app)
        .post('/api/resumes')
        .send({})
        .expect(201);

      expect(res.body.title).toBe('未命名简历');
      expect(res.body.templateId).toBe('default');
    });
  });

  describe('GET /api/resumes - list resumes', () => {
    it('should return an array containing the created resume', async () => {
      const res = await request(app)
        .get('/api/resumes')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(r => r.id === createdId);
      expect(found).toBeDefined();
      expect(found.title).toBe('API测试简历');
    });
  });

  describe('GET /api/resumes/:id - get single resume', () => {
    it('should return the full resume data', async () => {
      const res = await request(app)
        .get(`/api/resumes/${createdId}`)
        .expect(200);

      expect(res.body.id).toBe(createdId);
      expect(res.body.title).toBe('API测试简历');
      expect(res.body.personalInfo).toBeDefined();
      expect(res.body.workExperience).toBeDefined();
    });

    it('should return 404 for non-existent resume', async () => {
      const res = await request(app)
        .get('/api/resumes/non-existent-id')
        .expect(404);

      expect(res.body.error).toBe('Resume not found');
    });
  });

  describe('PUT /api/resumes/:id - update resume', () => {
    it('should update the resume and return updated data', async () => {
      const res = await request(app)
        .put(`/api/resumes/${createdId}`)
        .send({ title: '已更新简历', summary: '这是更新后的摘要' })
        .expect(200);

      expect(res.body.title).toBe('已更新简历');
      expect(res.body.summary).toBe('这是更新后的摘要');
      expect(res.body.id).toBe(createdId);
      // createdAt should be preserved
      expect(res.body.createdAt).toBeDefined();
    });

    it('should return 404 when updating non-existent resume', async () => {
      await request(app)
        .put('/api/resumes/non-existent-id')
        .send({ title: '不存在' })
        .expect(404);
    });
  });

  describe('DELETE /api/resumes/:id - delete resume', () => {
    it('should delete the resume and confirm', async () => {
      // Create a resume to delete
      const createRes = await request(app)
        .post('/api/resumes')
        .send({ title: '待删除简历' })
        .expect(201);

      const deleteId = createRes.body.id;

      await request(app)
        .delete(`/api/resumes/${deleteId}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/resumes/${deleteId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent resume', async () => {
      await request(app)
        .delete('/api/resumes/non-existent-id')
        .expect(404);
    });
  });
});
