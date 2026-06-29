const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '10mb' }));

console.log('[DEBUG] Server starting...');

// Load env
require('dotenv').config({ path: '/Users/cyw/VsCode/super-resume-maker/.env' });

console.log('[DEBUG] AI_BASEURL:', process.env.RESUME_AI_BASEURL);
console.log('[DEBUG] AI_MODEL:', process.env.RESUME_AI_MODEL);
console.log('[DEBUG] AI_AK exists:', !!process.env.RESUME_AI_AK);

app.post('/test-score', async (req, res) => {
  console.log('[DEBUG] Received /test-score request');
  
  const AI_BASEURL = process.env.RESUME_AI_BASEURL;
  const AI_MODEL = process.env.RESUME_AI_MODEL;
  const AI_AK = process.env.RESUME_AI_AK;

  console.log('[DEBUG] Config check - BASEURL:', AI_BASEURL, 'MODEL:', AI_MODEL, 'AK:', !!AI_AK);

  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    console.log('[DEBUG] Missing config');
    return res.status(503).json({ error: 'Config missing' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('[DEBUG] Headers sent, about to fetch AI API');

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.log('[DEBUG] Timeout triggered');
    controller.abort();
  }, 10000);

  try {
    console.log('[DEBUG] Starting fetch to AI API...');
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: 'test' },
          { role: 'user', content: 'test' },
        ],
        temperature: 0.5,
        stream: true,
        enableThinking: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    console.log('[DEBUG] Got response, status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.log('[DEBUG] Error response:', errText);
      res.write(`data: ${JSON.stringify({ error: 'AI error' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    console.log('[DEBUG] Starting to stream response');
    let chunkCount = 0;
    response.body.on('data', (chunk) => {
      chunkCount++;
      if (chunkCount <= 3) console.log('[DEBUG] Chunk', chunkCount, 'size:', chunk.length);
      res.write(chunk);
    });

    response.body.on('end', () => {
      console.log('[DEBUG] Stream end');
      res.end();
    });

    response.body.on('error', (err) => {
      console.error('[DEBUG] Stream error:', err);
      res.end();
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error('[DEBUG] Catch error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.listen(3002, () => {
  console.log('[DEBUG] Debug server listening on 3002');
});
