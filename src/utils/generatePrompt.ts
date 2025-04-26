// utils/generatePrompt.ts

export type DiaryAnalysis = {
  date: string;
  events: string[];
  emotion: string;
};

export function createDiaryPrompt(testData: { date: string; events: string[]; emotion: string; }) {
  return `
고양이의 ${testData.date} 하루 행동을 바탕으로 감성적인 일기를 작성해주세요.

- 주요 행동:
${testData.events.map((e) => `  • ${e}`).join('\n')}

- 감정 요약: ${testData.emotion}

일기는 고양이 시점으로 귀엽고 따뜻하게 써주세요.
`;
}

