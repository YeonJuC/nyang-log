// ✅ Node + OpenAI LLM API를 통해 고양이 일기를 생성하고,
//    그 일기를 Firestore에 저장하고, 클라이언트에서 목록 조회 가능하게 구성하는 전체 흐름

// 1. Express 서버 코드: 클라이언트로부터 날짜, 이벤트, 감정을 받아 일기 생성
// File: /server/index.ts

import express from 'express';
import { OpenAI } from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import { createDiaryPrompt } from '../utils/generatePrompt';

dotenv.config();

const app = express();
const port = 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/generate-diary', async (req, res) => {
  try {
    const { date, events, emotion } = req.body;
    const prompt = createDiaryPrompt({ date, events, emotion });

    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '너는 고양이의 하루를 감성적으로 정리하는 일기 작가야.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    res.json({ diary: result.choices[0].message?.content });
  } catch (err) {
    console.error('서버에서 오류 발생:', err);
    res.status(500).json({ error: '일기 생성 실패' });
  }
});

app.listen(port, () => {
  console.log(`📓 Diary server running: http://localhost:${port}`);
});
