import express from 'express';
import { OpenAI } from 'openai';  // 최신 버전에서 OpenAI 사용
import cors from 'cors';
import dotenv from 'dotenv';
import { createDiaryPrompt } from '../utils/generatePrompt';

dotenv.config();

const app = express();
const port = 4000;

app.use(cors({
  origin: '*',  // CORS 허용하는 도메인 설정
}));

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // 환경 변수로 API 키 설정
});

app.post('/generate-diary', async (req, res) => {

    try {
      const { date, events, emotion } = req.body;
      const prompt = createDiaryPrompt({ date, events, emotion });
  
      const result = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
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
  console.log(`Diary server listening on http://localhost:${port}`);
});
