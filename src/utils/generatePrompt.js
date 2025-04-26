// src/utils/generatePrompt.js

export function createDiaryPrompt(data) {
    return `
  고양이의 ${data.date} 하루 행동을 바탕으로 감성적인 일기를 작성해주세요.
  
  - 주요 행동:
  ${data.events.map((e) => `  • ${e}`).join('\n')}
  
  - 감정 요약: ${data.emotion}
  
  일기는 고양이 시점으로 귀엽고 따뜻하게 써주세요.
  `;
  }
  