// src/server/saveDiary.ts
// 하루에 고양이별로 entries 배열 저장하는 구조
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface DiaryEntry {
  time: string;
  action: string;
  emotion: string;
}

export const saveDiary = async ({
  userId,
  catId,
  date,
  entries,
}: {
  userId: string;
  catId: string;
  date: string;
  entries: DiaryEntry[];
}) => {
  const diaryRef = doc(db, 'diaries', userId, 'cats', catId, 'entries', date);

  await setDoc(diaryRef, {
    catId,
    date,
    entries,
    createdAt: serverTimestamp(),
  });
};
