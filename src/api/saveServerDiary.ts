// src/api/saveServerDiary.ts
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getTodayDiaryContent } from './mockLLMResponse';
import { CatInfo } from '../utils/SelectedCatContext';

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
};

export async function saveServerDiary(selectedCat: CatInfo) {
  const currentUser = auth.currentUser;

  if (!currentUser || !selectedCat) {
    console.error('유저 또는 고양이 정보 없음');
    return null;
  }

  try {
    const diaryResponses = await getTodayDiaryContent(selectedCat.nickname); // 배열로 여러개 받음

    // ✅ 기존 여러개 저장 (2025-04-27, 2025-04-28 등)
    const savePromises = diaryResponses.map(async (diaryData) => {
      const diaryRef = doc(
        db,
        'users',
        currentUser.uid,
        'cats',
        selectedCat.id,
        'diaries',
        diaryData.day
      );

      await setDoc(diaryRef, {
        day: diaryData.day,
        diary: diaryData.diary
      });
    });

    await Promise.all(savePromises);

    // ✅ 추가: 오늘 날짜(today)로 저장
    const today = getTodayString();
    const todayDiary = diaryResponses[0]; // 첫 번째 일기를 기준으로 today 저장

    const todayDiaryRef = doc(
      db,
      'users',
      currentUser.uid,
      'cats',
      selectedCat.id,
      'diaries',
      today
    );

    await setDoc(todayDiaryRef, {
      day: today,
      diary: todayDiary.diary
    });

    console.log('✅ 여러 일기 + 오늘 일기 저장 성공');
    return diaryResponses; // ✅ 저장한 전체 일기 데이터 반환
  } catch (error) {
    console.error('일기 저장 실패', error);
    return null;
  }
}
