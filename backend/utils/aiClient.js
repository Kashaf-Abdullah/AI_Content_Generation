const OpenAI = require('openai');
const fetch = global.fetch || require('node-fetch');

const DEFAULTS = {
  GEMINI_MODEL: 'text-bison-001',
  OPENAI_MODEL: 'gpt-4o-mini'
};

const provider = (process.env.AI_PROVIDER || 'OPENAI').toUpperCase();

async function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function callOpenAI({ textInput, platform, tone, location }) {
  const prompt = `Generate ${tone} ${platform} caption (max 150 chars) for: "${textInput}" in ${location}. Return ONLY JSON: {"caption": "...", "hashtags": ["#tag1", "#tag2"]}`;

  const openaiClient = await getOpenAIClient();
  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || DEFAULTS.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
    temperature: 0.7
  });

  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse OpenAI response');
  }
}

async function callGemini({ textInput, platform, tone, location }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not configured');

  const model = process.env.GEMINI_MODEL || DEFAULTS.GEMINI_MODEL;
  const prompt = `Generate ${tone} ${platform} caption (max 150 chars) for: "${textInput}" in ${location}. Return ONLY JSON: {"caption": "...", "hashtags": ["#tag1", "#tag2"]}`;

  // Use key as query param (works for API keys) otherwise try Bearer
  const url = `https://generativeai.googleapis.com/v1/models/${model}:generateText${key.startsWith('ya.') ? '' : `?key=${encodeURIComponent(key)}`}`;

  const body = {
    prompt: { text: prompt },
    temperature: 0.7,
    maxOutputTokens: 300
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // If key looks like an OAuth token (starts with 'ya.'), use it as Bearer
  if (key.startsWith('ya.')) headers['Authorization'] = `Bearer ${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = await res.text();
    const e = new Error(`Gemini API request failed: ${res.status}`);
    e.details = errBody;
    throw e;
  }

  const data = await res.json();
  // Response shape depends on model; try to extract text safely
  const candidates = data?.candidates || data?.outputs || [];
  let text = '';
  if (Array.isArray(candidates) && candidates.length) {
    // Some Gemini responses: { candidates: [{ content: '...' }] }
    text = candidates[0].content || candidates[0].text || '';
  } else if (typeof data?.output === 'string') {
    text = data.output;
  }

  if (!text) throw new Error('Empty response from Gemini');

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse Gemini response');
  }
}

async function generateCaption(params) {
  if (provider === 'GEMINI') {
    return await callGemini(params);
  }
  // Default to OPENAI
  return await callOpenAI(params);
}

module.exports = {
  generateCaption
};
