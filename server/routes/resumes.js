const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  listResumes,
  readResume,
  writeResume,
  deleteResume,
} = require('../utils/fileStorage');

const router = express.Router();

// GET /api/resumes - list all resumes (full data for preview rendering)
router.get('/', async (req, res) => {
  try {
    const resumes = await listResumes();
    res.json(resumes);
  } catch (err) {
    console.error('Error listing resumes:', err);
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

// GET /api/resumes/:id - get single resume
router.get('/:id', async (req, res) => {
  try {
    const resume = await readResume(req.params.id);
    res.json(resume);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Resume not found' });
    }
    console.error('Error reading resume:', err);
    res.status(500).json({ error: 'Failed to read resume' });
  }
});

// POST /api/resumes - create new resume
router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    const resume = {
      id,
      title: req.body.title || '未命名简历',
      templateId: req.body.templateId || 'default',
      personalInfo: req.body.personalInfo || {
        name: '',
        phone: '',
        email: '',
        title: '',
      },
      summary: req.body.summary || '',
      workExperience: req.body.workExperience || [],
      projectExperience: req.body.projectExperience || [],
      organizationExperience: req.body.organizationExperience || [],
      awards: req.body.awards || [],
      skills: req.body.skills || [],
      tags: req.body.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    await writeResume(id, resume);
    res.status(201).json(resume);
  } catch (err) {
    console.error('Error creating resume:', err);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// PUT /api/resumes/:id - update resume
router.put('/:id', async (req, res) => {
  try {
    const existing = await readResume(req.params.id);
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await writeResume(req.params.id, updated);
    res.json(updated);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Resume not found' });
    }
    console.error('Error updating resume:', err);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// PATCH /api/resumes/:id - partial update (e.g. rename title)
router.patch('/:id', async (req, res) => {
  try {
    const existing = await readResume(req.params.id);
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await writeResume(req.params.id, updated);
    res.json(updated);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Resume not found' });
    }
    console.error('Error patching resume:', err);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// POST /api/resumes/:id/duplicate - duplicate a resume
router.post('/:id/duplicate', async (req, res) => {
  try {
    const existing = await readResume(req.params.id);
    const newId = uuidv4();
    const now = new Date().toISOString();
    const duplicated = {
      ...existing,
      id: newId,
      title: `${existing.title} - 副本`,
      createdAt: now,
      updatedAt: now,
    };
    await writeResume(newId, duplicated);
    res.status(201).json(duplicated);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Resume not found' });
    }
    console.error('Error duplicating resume:', err);
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});

// DELETE /api/resumes/:id - delete resume
router.delete('/:id', async (req, res) => {
  try {
    await deleteResume(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Resume not found' });
    }
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

module.exports = router;
