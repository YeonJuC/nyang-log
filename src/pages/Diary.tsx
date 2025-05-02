import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { saveServerDiary } from '../api/saveServerDiary';
import { useSelectedCat } from '../utils/SelectedCatContext';
import { doc, getDoc } from 'firebase/firestore';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const profileImages: Record<string, string> = {
    ch_1,
    ch_2,
    ch_3,
    ch_4,
    ch_5,
    ch_6,
};

const Diary = () => {
    const { selectedCat } = useSelectedCat();
    const [diaries, setDiaries] = useState<any[]>([]);
    const [isTodayDiarySaved, setIsTodayDiarySaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [todayDiaryText, setTodayDiaryText] = useState('아직 오늘의 일기가 없습니다.');

    const handleSaveDiary = async () => {
      if (!selectedCat) return;
    
      setSaving(true);
      try {
        const diaryDataArray = await saveServerDiary(selectedCat);
    
        if (diaryDataArray && diaryDataArray.length > 0) {
          alert('오늘 일기가 저장되었어요!');
          await fetchTodayDiary(); // ✅ 저장 후 오늘 일기만 다시 읽어오기
        } else {
          alert('일기 저장에 실패했어요.');
        }
      } catch (error) {
        console.error('일기 저장 실패:', error);
        alert('저장 중 오류가 발생했어요');
      } finally {
        setSaving(false);
      }
    };
      

    const getTodayString = () => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    };

    const fetchTodayDiary = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || !selectedCat) return;
      
        const today = getTodayString();
        const diaryRef = doc(db, 'users', currentUser.uid, 'cats', selectedCat.id, 'diaries', today);
        const diarySnap = await getDoc(diaryRef);
      
        if (diarySnap.exists()) {
          setTodayDiaryText(diarySnap.data().diary);
          setIsTodayDiarySaved(true);  // ✅ 오늘 일기 존재
        } else {
          setTodayDiaryText('아직 오늘의 일기가 없습니다.');
          setIsTodayDiarySaved(false); // ✅ 오늘 일기 없음
        }
    };
       

    const fetchDiaries = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !selectedCat) return;
  
      const q = query(
        collection(db, 'users', currentUser.uid, 'cats', selectedCat.id, 'diaries'),
        orderBy('day', 'desc')
      );
      const querySnapshot = await getDocs(q);
  
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setDiaries(fetched);
    };
  
    // ✅ useEffect는 무조건 항상 호출되게
    useEffect(() => {
        if (selectedCat) {
          fetchTodayDiary();   // ✅ 오늘 일기 먼저 불러오고
          fetchDiaries();       // ✅ 전체 일기도 불러옴
        }
    }, [selectedCat]);
      
    // ✅ selectedCat 없으면 로딩 UI
    if (!selectedCat) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-400">
          고양이 정보를 불러오는 중...
        </div>
      );
    }
  
    return (
      <div className="min-h-screen bg-white p-4 mb-[100px]">
        <div className="bg-white px-4 py-3 flex flex-col items-center">
          <div className="w-full max-w-xl text-center">
            <h2 className="text-xl font-apple_bigbold">일기장</h2>
            <h1 className="text-base sm:text-lg font-apple_bold mt-2 mb-1">
              오늘 {selectedCat?.nickname ?? ''}의 하루를 볼까요?
            </h1>
            <p className="text-black-300 font-apple_bold text-sm sm:text-[13px] mb-4">
              아래 오늘 하루 일기 저장 버튼을 누르면<br /> 오늘의 일기가 나옵니다.
            </p>
          </div>

          <div className="bg-white border border-[#ccc] rounded-2xl shadow-md p-4 w-full max-w-sm flex flex-col items-center space-y-4 mb-3">
            <div className="w-40 sm:w-48 mx-auto my-4">
              <img
                src={profileImages[selectedCat.profileImage]}
                alt="프로필 이미지"
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6 w-4/5 mx-auto">
          {diaries.map((diary) => (
            <div key={diary.id} className="mb-6 p-4 rounded-lg shadow bg-[#f9f9ff]">
              <h2 className="font-bold text-[#5976D7] mb-2">{diary.day}</h2>
              <p className="text-gray-700 text-sm whitespace-pre-line font-apple">{diary.diary}</p>
            </div>
          ))}
        </div>
    </div>
    );
  };  

export default Diary;
