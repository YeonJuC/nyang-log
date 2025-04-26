// server.js

import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai'; // OpenAI sdk 설치 필요
import {createDiaryPrompt } from './src/utils/generatePrompt'; // 프롬프트 생성 함수

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일 필요
});

app.post('/generate-diary', async (req, res) => {
  try {
    const { date, events, emotion } = req.body;

    const prompt = createDiaryPrompt({ date, events, emotion });

    const result = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '너는 고양이의 하루를 감성적으로 정리하는 일기 작가야.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    res.json({ diary: result.choices[0].message?.content });
  } catch (err) {
    console.error('Error generating diary:', err);
    res.status(500).json({ error: 'Diary generation failed' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API 서버 실행중: http://localhost:${port}`);
});
