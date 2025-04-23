import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const saveServerDiary = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert('로그인 후 사용해주세요!');
    return;
  }

  try {
    //!!!!!나중에 서버 링크 넣기!!!!!!!
    const res = await fetch('https://your-server.com/analyze-latest', {
      method: 'GET',
    });

    const data = await res.json(); // { summary, image }

    const todayKey = new Date().toISOString().split('T')[0];

    const entry = {
      text: data.summary,
      image: data.image,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'logs', user.uid, 'entries', todayKey), entry);

    localStorage.setItem('todayLog', JSON.stringify(entry));
    alert('오늘의 AI 일기가 자동 생성되었어요!');
  } catch (e) {
    console.error('자동 생성 실패:', e);
    alert('서버에서 분석 결과를 가져오는 데 실패했어요.');
  }
};
