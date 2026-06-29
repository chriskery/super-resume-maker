const express = require('express');
const fetch = require('node-fetch');
const https = require('https');
const router = express.Router();

const AI_AGENT = new https.Agent({
  keepAlive: true,
  timeout: 60000,
  // Allow connection establishment to take up to 60s (idealab is slow on cold connect)
  scheduling: 'lifo',
});

const SYSTEM_PROMPTS = {
  summary: '你是一位专业的简历润色助手。请优化以下个人总结，使其更专业有力。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
  highlight: '你是一位专业的简历润色助手。请优化以下工作/项目经历描述，突出成果和价值，使用动词开头。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
  skill: '你是一位专业的简历润色助手。请优化以下技能描述，使其更规范专业。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
};

const DEFAULT_PROMPT = '你是一位专业的简历润色助手。请优化以下简历内容，使其更专业、简洁、有力。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。';

const AI_MODEL = process.env.RESUME_AI_MODEL;
const AI_AK = process.env.RESUME_AI_AK;
const AI_BASEURL = process.env.RESUME_AI_BASEURL;

function isAbortError(err) {
  return err && (err.name === 'AbortError' || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.type === 'request-timeout');
}

router.post('/polish', async (req, res) => {
  console.log('[AI Polish] 收到请求, type:', req.body?.type, 'text长度:', req.body?.text?.length);
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    console.log('[AI Polish] 环境变量未配置');
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { text, type } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '请提供需要润色的文本内容' });
  }

  const systemPrompt = SYSTEM_PROMPTS[type] || DEFAULT_PROMPT;
  console.log('[AI Polish] 调用AI API:', AI_BASEURL, '模型:', AI_MODEL);

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  // Handle client disconnect (listen on response, not request)
  let aborted = false;
  res.on('close', () => {
    aborted = true;
    clearTimeout(timeout);
    controller.abort();
  });

  try {
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text + '\n/no_think' },
        ],
        temperature: 0.7,
        stream: true,
        enable_thinking: false,
        thinking: { type: 'disabled', budget_tokens: 0 },
      }),
      signal: controller.signal,
      agent: AI_AGENT,
    });

    clearTimeout(timeout);

    console.log('[AI Polish] AI API 响应状态:', response.status);
    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Polish] AI API error:', response.status, errText);
      res.write(`data: ${JSON.stringify({ error: `AI 服务请求失败（${response.status}），请稍后重试` })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let buffer = '';
    let chunkCount = 0;
    response.body.on('data', (chunk) => {
      if (aborted) return;
      chunkCount++;
      if (chunkCount <= 3) console.log('[AI Polish] 收到 chunk, 长度:', chunk.length);
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') {
          res.write('data: [DONE]\n\n');
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
            res.flush?.();
          } else if (delta?.reasoning_content) {
            // Send heartbeat during thinking phase so client knows connection is alive
            res.write(`data: ${JSON.stringify({ thinking: true })}\n\n`);
            res.flush?.();
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    });

    response.body.on('end', () => {
      if (aborted) return;
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.body.on('error', (err) => {
      if (aborted) return;
      console.error('AI polish stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'AI 润色服务异常，请稍后重试' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    });
  } catch (err) {
    clearTimeout(timeout);
    if (aborted) return;
    if (isAbortError(err)) {
      res.write(`data: ${JSON.stringify({ error: 'AI 服务请求超时，请稍后重试' })}\n\n`);
    } else {
      console.error('AI polish error:', err);
      res.write(`data: ${JSON.stringify({ error: 'AI 润色服务异常，请稍后重试' })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

/* ─── Resume Scoring ─── */
const SCORE_SYSTEM_PROMPT = `你是一位资深HR和简历顾问。请对以下简历进行专业评分和诊断。

评分标准（满分100分）：
- 个人信息完整度（10分）：姓名、联系方式、职位是否齐全
- 个人总结质量（15分）：是否精炼有力，突出核心竞争力
- 工作经历描述（30分）：是否量化成果，使用动词开头，突出价值
- 项目经历质量（25分）：是否描述清晰，技术栈明确，成果可衡量
- 技能匹配度（10分）：是否与目标职位相关，分类清晰
- 整体结构（10分）：内容丰富度、排版逻辑性

请严格按照以下 JSON 格式输出，不要添加任何其他内容：
{
  "score": 75,
  "summary": "一句话总结评价",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

function serializeResumeToText(resume) {
  const lines = [];
  const p = resume.personalInfo || {};
  lines.push(`【个人信息】姓名: ${p.name || '未填写'} | 电话: ${p.phone || '未填写'} | 邮箱: ${p.email || '未填写'} | 求职职位: ${p.title || '未填写'}`);
  if (resume.summary) lines.push(`\n【个人总结】\n${resume.summary}`);
  if (resume.workExperience?.length) {
    lines.push('\n【工作经历】');
    resume.workExperience.forEach((w) => {
      lines.push(`- ${w.company || ''} | ${w.position || ''} | ${w.startDate || ''} ~ ${w.endDate || ''}`);
      (w.highlights || []).forEach((h) => { if (h.trim()) lines.push(`  · ${h}`); });
    });
  }
  if (resume.projectExperience?.length) {
    lines.push('\n【项目经历】');
    resume.projectExperience.forEach((p) => {
      lines.push(`- ${p.name || ''} | ${p.role || ''} | ${p.startDate || ''} ~ ${p.endDate || ''}`);
      (p.highlights || []).forEach((h) => { if (h.trim()) lines.push(`  · ${h}`); });
    });
  }
  const skillsList = resume.others?.skills || resume.skills || [];
  if (skillsList.length) {
    lines.push('\n【技能】');
    skillsList.forEach((s) => lines.push(`- ${s.category || '未分类'}: ${s.items || ''}`));
  }
  if (resume.awards?.length) {
    lines.push('\n【荣誉奖项】');
    resume.awards.forEach((a) => {
      if (typeof a === 'string') {
        if (a.trim()) lines.push(`- ${a}`);
      } else {
        const title = a.title || '';
        if (!title.trim()) return;
        const date = a.date ? ` (${a.date})` : '';
        lines.push(`- ${title}${date}`);
        if (a.description && a.description.trim()) {
          a.description.split(/\r?\n/).forEach((d) => { if (d.trim()) lines.push(`  · ${d}`); });
        }
      }
    });
  }
  return lines.join('\n');
}

router.post('/score', async (req, res) => {
  console.log('[AI Score] 收到请求');
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    console.log('[AI Score] 环境变量未配置');
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { resume } = req.body;
  if (!resume || typeof resume !== 'object') {
    return res.status(400).json({ error: '请提供完整的简历数据' });
  }

  const resumeText = serializeResumeToText(resume);
  console.log('[AI Score] 调用AI API:', AI_BASEURL, '模型:', AI_MODEL);

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  // Handle client disconnect
  let aborted = false;
  res.on('close', () => {
    aborted = true;
    clearTimeout(timeout);
    controller.abort();
  });

  try {
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: SCORE_SYSTEM_PROMPT },
          { role: 'user', content: resumeText + '\n/no_think' },
        ],
        temperature: 0.5,
        stream: true,
        enable_thinking: false,
        thinking: { type: 'disabled', budget_tokens: 0 },
      }),
      signal: controller.signal,
      agent: AI_AGENT,
    });

    clearTimeout(timeout);

    console.log('[AI Score] AI API 响应状态:', response.status);
    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Score] AI API error:', response.status, errText);
      res.write(`data: ${JSON.stringify({ error: `AI 服务请求失败（${response.status}），请稍后重试` })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let buffer = '';
    let chunkCount = 0;
    let thinkingCount = 0;
    let contentCount = 0;
    response.body.on('data', (chunk) => {
      if (aborted) return;
      chunkCount++;
      if (chunkCount <= 3) console.log('[AI Score] chunk 内容:', chunk.toString().substring(0, 500));
      if (chunkCount % 50 === 0) console.log(`[AI Score] 进度: 已收到 ${chunkCount} 个 chunk (thinking: ${thinkingCount}, content: ${contentCount})`);
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') {
          res.write('data: [DONE]\n\n');
          return res.end();
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            contentCount++;
            if (contentCount === 1) console.log('[AI Score] 开始接收实际内容, thinking总计:', thinkingCount);
            res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
            res.flush?.();
          } else if (delta?.reasoning_content) {
            thinkingCount++;
            if (thinkingCount === 1) console.log('[AI Score] 模型开始思考...');
            res.write(`data: ${JSON.stringify({ thinking: true })}\n\n`);
            res.flush?.();
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    });

    response.body.on('end', () => {
      if (aborted) return;
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.body.on('error', (err) => {
      if (aborted) return;
      console.error('AI score stream error:', err);
      res.write(`data: ${JSON.stringify({ error: 'AI 评分服务异常，请稍后重试' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    });
  } catch (err) {
    clearTimeout(timeout);
    if (aborted) return;
    if (isAbortError(err)) {
      res.write(`data: ${JSON.stringify({ error: 'AI 服务请求超时，请稍后重试' })}\n\n`);
    } else {
      console.error('AI score error:', err);
      res.write(`data: ${JSON.stringify({ error: 'AI 评分服务异常，请稍后重试' })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

/* ─── AI Import (text → structured resume) ─── */
const IMPORT_SYSTEM_PROMPT = `你是一个专业的简历解析助手。请将用户提供的非结构化文本解析为结构化的简历 JSON 数据。

请严格按照以下 JSON 格式输出，不要添加任何其他内容或解释：
{
  "title": "xxx的简历",
  "personalInfo": { "name": "", "phone": "", "email": "", "title": "" },
  "summary": "个人总结",
  "workExperience": [
    { "company": "", "position": "", "department": "", "location": "", "startDate": "", "endDate": "", "highlights": ["亮点1", "亮点2"] }
  ],
  "projectExperience": [
    { "name": "", "role": "", "location": "", "startDate": "", "endDate": "", "highlights": ["亮点1"] }
  ],
  "organizationExperience": [
    { "name": "", "role": "", "department": "", "location": "", "startDate": "", "endDate": "", "highlights": [] }
  ],
  "awards": [
    { "id": "uuid", "title": "奖项/专利名称", "date": "2023-09", "description": "详细描述（可选）" }
  ],
  "others": {
    "skills": [{ "category": "分类", "items": "技能1, 技能2" }]
  }
}

注意事项：
- 如果某项信息无法从文本中提取，使用空字符串或空数组
- workExperience / projectExperience / organizationExperience 中每个对象必须包含 id 字段，使用随机 UUID 格式
- highlights 数组中每项为一个字符串
- 保持原文信息，不要编造内容`;

router.post('/import', async (req, res) => {
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '请提供需要解析的文本内容' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: IMPORT_SYSTEM_PROMPT },
          { role: 'user', content: text + '\n/no_think' },
        ],
        temperature: 0.3,
        enable_thinking: false,
        thinking: { type: 'disabled', budget_tokens: 0 },
      }),
      signal: controller.signal,
      agent: AI_AGENT,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI import API error:', response.status, errText);
      return res.status(502).json({ error: `AI 服务请求失败（${response.status}），请稍后重试` });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return res.status(502).json({ error: 'AI 服务返回内容为空，请稍后重试' });
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI import parse error, raw:', raw);
      return res.status(502).json({ error: 'AI 返回格式异常，请稍后重试' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    clearTimeout(timeout);
    if (isAbortError(err)) {
      return res.status(504).json({ error: 'AI 服务请求超时，请稍后重试' });
    }
    console.error('AI import error:', err);
    res.status(500).json({ error: 'AI 解析服务异常，请稍后重试' });
  }
});

/* ─── JD Match Analysis ─── */
const JD_MATCH_SYSTEM_PROMPT = `你是一位资深HR和简历顾问。请分析以下简历内容与目标职位描述（JD）的匹配程度。

分析维度：
1. 技能匹配：简历中的技能是否与JD要求的技能相符
2. 经验匹配：工作经历和项目经历是否覆盖JD的核心要求
3. 关键词覆盖：JD中的关键术语和关键词在简历中的出现频率
4. 差距分析：简历中缺失了JD中哪些重要要求

请严格按照以下 JSON 格式输出，不要添加任何其他内容或解释：
{
  "score": 75,
  "missingKeywords": ["缺失关键词1", "缺失关键词2", "缺失关键词3"],
  "suggestions": ["优化建议1", "优化建议2", "优化建议3"],
  "matchedSkills": ["匹配技能1", "匹配技能2"]
}

评分规则：
- 0-39分：匹配度低，简历与JD要求差距较大
- 40-69分：匹配度中等，有一定基础但需要针对性优化
- 70-100分：匹配度较高，简历内容与JD高度吻合

注意：
- score 为 0-100 的整数
- missingKeywords 列出JD中出现但简历中缺失的关键术语（最多5个）
- suggestions 给出具体可操作的优化建议（最多5条）
- matchedSkills 列出简历中与JD匹配的技能（最多5个）`;

router.post('/jd-match', async (req, res) => {
  console.log('[AI JD-Match] 收到请求');
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    console.log('[AI JD-Match] 环境变量未配置');
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { resume, jobDescription } = req.body;
  if (!resume || typeof resume !== 'object') {
    return res.status(400).json({ error: '请提供完整的简历数据' });
  }
  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 10) {
    return res.status(400).json({ error: '请提供有效的职位描述（至少10个字符）' });
  }

  const resumeText = serializeResumeToText(resume);
  const userContent = `【简历内容】\n${resumeText}\n\n【目标职位描述】\n${jobDescription}`;
  console.log('[AI JD-Match] 调用AI API:', AI_BASEURL, '模型:', AI_MODEL);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: JD_MATCH_SYSTEM_PROMPT },
          { role: 'user', content: userContent + '\n/no_think' },
        ],
        temperature: 0.5,
        enable_thinking: false,
        thinking: { type: 'disabled', budget_tokens: 0 },
      }),
      signal: controller.signal,
      agent: AI_AGENT,
    });

    clearTimeout(timeout);

    console.log('[AI JD-Match] AI API 响应状态:', response.status);
    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI JD-Match] AI API error:', response.status, errText);
      return res.status(502).json({ error: `AI 服务请求失败（${response.status}），请稍后重试` });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return res.status(502).json({ error: 'AI 服务返回内容为空，请稍后重试' });
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI JD-Match] parse error, raw:', raw);
      return res.status(502).json({ error: 'AI 返回格式异常，请稍后重试' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const missingKeywords = Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.map(String).slice(0, 5) : [];
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).slice(0, 5) : [];
    const matchedSkills = Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills.map(String).slice(0, 5) : [];

    console.log('[AI JD-Match] 分析完成, score:', score);
    res.json({ score, missingKeywords, suggestions, matchedSkills });
  } catch (err) {
    clearTimeout(timeout);
    if (isAbortError(err)) {
      return res.status(504).json({ error: 'AI 服务请求超时，请稍后重试' });
    }
    console.error('[AI JD-Match] error:', err);
    res.status(500).json({ error: 'AI JD匹配分析服务异常，请稍后重试' });
  }
});

/* ─── Generate Highlights ─── */
const GENERATE_HIGHLIGHTS_PROMPT = `你是一位资深HR和简历顾问。请根据用户提供的职位、公司和简要描述信息，生成3-5条符合STAR法则（Situation-Task-Action-Result）的专业成果描述。

要求：
- 每条描述以一个强动词开头（如：主导、推动、优化、搭建、提升等）
- 尽量量化成果（如提升XX%、节省XX万、覆盖XX用户等，可合理推断）
- 语言简洁有力，每条控制在1-2句话
- 突出个人贡献和业务价值

请严格按照以下 JSON 格式输出，不要添加任何其他内容或解释：
{
  "highlights": ["成果描述1", "成果描述2", "成果描述3"]
}`;

router.post('/generate-highlights', async (req, res) => {
  console.log('[AI GenerateHighlights] 收到请求, type:', req.body?.type, 'position:', req.body?.position);
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    console.log('[AI GenerateHighlights] 环境变量未配置');
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { position, company, description, type } = req.body;
  if (!position || typeof position !== 'string') {
    return res.status(400).json({ error: '请提供职位信息' });
  }
  if (!company || typeof company !== 'string') {
    return res.status(400).json({ error: '请提供公司/项目信息' });
  }

  const typeLabel = type === 'project' ? '项目' : '工作';
  let userContent = `职位/角色：${position}\n公司/项目：${company}`;
  if (description) userContent += `\n简要描述：${description}`;
  userContent += `\n\n请为这段${typeLabel}经历生成3-5条STAR法则格式的成果描述。`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`${AI_BASEURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_AK}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: GENERATE_HIGHLIGHTS_PROMPT },
          { role: 'user', content: userContent + '\n/no_think' },
        ],
        temperature: 0.7,
        enable_thinking: false,
        thinking: { type: 'disabled', budget_tokens: 0 },
      }),
      signal: controller.signal,
      agent: AI_AGENT,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI GenerateHighlights] AI API error:', response.status, errText);
      return res.status(502).json({ error: `AI 服务请求失败（${response.status}），请稍后重试` });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return res.status(502).json({ error: 'AI 服务返回内容为空，请稍后重试' });
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[AI GenerateHighlights] parse error, raw:', raw);
      return res.status(502).json({ error: 'AI 返回格式异常，请稍后重试' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
    res.json({ highlights });
  } catch (err) {
    clearTimeout(timeout);
    if (isAbortError(err)) {
      return res.status(504).json({ error: 'AI 服务请求超时，请稍后重试' });
    }
    console.error('[AI GenerateHighlights] error:', err);
    res.status(500).json({ error: 'AI 生成服务异常，请稍后重试' });
  }
});

module.exports = router;
