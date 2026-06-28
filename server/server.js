require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { ensureDir } = require('./utils/fileStorage');
const resumesRouter = require('./routes/resumes');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/resumes', resumesRouter);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await ensureDir();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
