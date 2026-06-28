const express = require('express');
const router = express.Router();

const SYSTEM_PROMPTS = {
  summary: '你是一位专业的简历润色助手。请优化以下个人总结，使其更专业有力。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
  highlight: '你是一位专业的简历润色助手。请优化以下工作/项目经历描述，突出成果和价值，使用动词开头。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
  skill: '你是一位专业的简历润色助手。请优化以下技能描述，使其更规范专业。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。',
};

const DEFAULT_PROMPT = '你是一位专业的简历润色助手。请优化以下简历内容，使其更专业、简洁、有力。保持原文的核心信息不变，只优化表达方式。直接返回润色后的文本，不要添加解释。';

const AI_MODEL = process.env.RESUME_AI_MODEL;
const AI_AK = process.env.RESUME_AI_AK;
const AI_BASEURL = process.env.RESUME_AI_BASEURL;

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

  // Handle client disconnect
  let aborted = false;
  req.on('close', () => {
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
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        stream: true,
        enable_thinking: false,
      }),
      signal: controller.signal,
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done || aborted) break;

      buffer += decoder.decode(value, { stream: true });
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
          } else if (delta?.reasoning_content) {
            // Send heartbeat during thinking phase so client knows connection is alive
            res.write(`data: ${JSON.stringify({ thinking: true })}\n\n`);
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    clearTimeout(timeout);
    if (aborted) return;
    if (err.name === 'AbortError') {
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
  if (resume.skills?.length) {
    lines.push('\n【技能】');
    resume.skills.forEach((s) => lines.push(`- ${s.category || '未分类'}: ${s.items || ''}`));
  }
  if (resume.awards?.length) {
    lines.push('\n【荣誉奖项】');
    resume.awards.forEach((a) => { if (a.trim()) lines.push(`- ${a}`); });
  }
  return lines.join('\n');
}

router.post('/score', async (req, res) => {
  if (!AI_MODEL || !AI_AK || !AI_BASEURL) {
    return res.status(503).json({ error: 'AI 服务未配置，请联系管理员设置环境变量 RESUME_AI_MODEL、RESUME_AI_AK、RESUME_AI_BASEURL' });
  }

  const { resume } = req.body;
  if (!resume || typeof resume !== 'object') {
    return res.status(400).json({ error: '请提供完整的简历数据' });
  }

  const resumeText = serializeResumeToText(resume);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

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
          { role: 'user', content: resumeText },
        ],
        temperature: 0.5,
        enable_thinking: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI score API error:', response.status, errText);
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
      console.error('AI score parse error, raw:', raw);
      return res.status(502).json({ error: 'AI 返回格式异常，请稍后重试' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const summary = String(parsed.summary || '');
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String).slice(0, 5) : [];

    res.json({ score, summary, suggestions });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI 服务请求超时，请稍后重试' });
    }
    console.error('AI score error:', err);
    res.status(500).json({ error: 'AI 评分服务异常，请稍后重试' });
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
  "awards": ["奖项1"],
  "skills": [{ "category": "分类", "items": "技能1, 技能2" }]
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
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        enable_thinking: false,
      }),
      signal: controller.signal,
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
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'AI 服务请求超时，请稍后重试' });
    }
    console.error('AI import error:', err);
    res.status(500).json({ error: 'AI 解析服务异常，请稍后重试' });
  }
});

module.exports = router;
