import { auth } from "../firebase";
import { generateDiaryPrompt } from '../utils/generateDiaryPrompt';


export const saveServerDiary = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('로그인 후 사용해주세요!');
    return;
  }

  try {
    // 테스트 데이터 (서버 없이 로컬 데이터로 시도)
    const testData = {
      date: '2025-04-27',
      events: [
        '오전 9시: 창밖을 5분간 바라봄',
        '오전 10시: 억울한 울음소리 2회',
        '오후 2시: 캣타워에 올라가서 털 고르기'
      ],
      emotion: '호기심, 억울함, 평온함'
    };

    // 프롬프트 생성
    const prompt = generateDiaryPrompt(testData);  // generateDiaryPrompt 로컬에서 정의한 함수

    const response = await fetch('http://localhost:3000/generate-diary', {  // 여기 URL 확인
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: '2025-04-27',
        events: [
          '오전 9시: 창밖을 5분간 바라봄',
          '오전 10시: 억울한 울음소리 2회',
          '오후 2시: 캣타워에 올라가서 털 고르기'
        ],
        emotion: '호기심, 억울함, 평온함',
      }),
    });
    

    const result = await response.json();
    console.log('서버 응답:', result);  // 서버 응답 내용 출력

    const diary = result.choices[0].message?.content;
    

    console.log('✨ 감성 일기:', diary);

    // 화면에 일기 표시
    localStorage.setItem('todayLog', JSON.stringify(diary));
    alert('오늘의 AI 일기가 자동 생성되었어요!');
  } catch (e) {
    console.error('자동 생성 실패:', e);
    alert('서버에서 분석 결과를 가져오는 데 실패했어요.');
  }
};
