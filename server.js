// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { createDiaryPrompt } from './src/utils/generatePrompt.js';  // 파일 경로 주의!

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일에 OpenAI API 키 필요
});

app.post('/generate-diary', async (req, res) => {
  try {
    const { date, events, emotion } = req.body;
    const prompt = createDiaryPrompt({ date, events, emotion });

    const result = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '너는 고양이의 하루를 감성적으로 정리하는 일기 작가야.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    res.json({ diary: result.choices[0].message?.content });
  } catch (err) {
    console.error('Diary 생성 실패:', err);
    res.status(500).json({ error: 'Diary 생성 실패' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Diary API 서버가 http://localhost:${port} 에서 실행중`);
});
