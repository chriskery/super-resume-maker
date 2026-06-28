const fs = require('fs/promises');
const path = require('path');

function getDataDir() {
  return process.env.DATA_DIR || path.resolve(__dirname, '../../data/resumes');
}

async function ensureDir() {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });
}

function getFilePath(id) {
  return path.join(getDataDir(), `${id}.json`);
}

async function readResume(id) {
  const filePath = getFilePath(id);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function writeResume(id, data) {
  const filePath = getFilePath(id);
  const tmpPath = `${filePath}.tmp`;
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(tmpPath, content, 'utf-8');
  await fs.rename(tmpPath, filePath);
}

async function deleteResume(id) {
  const filePath = getFilePath(id);
  await fs.unlink(filePath);
}

async function listResumes() {
  const dir = getDataDir();
  const files = await fs.readdir(dir);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const resumes = [];
  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      const data = JSON.parse(content);
      resumes.push({
        id: data.id,
        title: data.title,
        templateId: data.templateId,
        updatedAt: data.updatedAt,
      });
    } catch (err) {
      console.warn(`Failed to parse ${file}:`, err.message);
    }
  }
  return resumes;
}

module.exports = {
  getDataDir,
  ensureDir,
  readResume,
  writeResume,
  deleteResume,
  listResumes,
};
