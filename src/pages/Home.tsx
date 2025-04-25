import { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { saveServerDiary } from '../utils/saveServerDiary';
import drawCat from '../img/draw_cat.png';

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

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [catName, setCatName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('ch_1');
  const [todayLog, setTodayLog] = useState<any>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCatName(data.nickname || '고양이');
          setProfileImage(data.profileImage || 'ch_1');
        }
      } catch (e) {
        console.error('유저 정보 불러오기 실패:', e);
      }

      const todayRaw = localStorage.getItem('todayLog');
      try {
        setTodayLog(todayRaw ? JSON.parse(todayRaw) : null);
      } catch (e) {
        console.error('JSON 파싱 오류:', e);
        setTodayLog(null);
      }

      try {
        const q = query(
          collection(db, 'logs', currentUser.uid, 'entries'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedLogs = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          date: doc.id,
        }));
        setAllLogs(fetchedLogs);
      } catch (e) {
        console.error('Firestore 기록 불러오기 실패:', e);
      }
    };

    fetchData();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('로그인 성공:', result.user.displayName);
    } catch (e) {
      console.error('로그인 실패:', e);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-center">
        {!user && (
          <button
            onClick={handleLogin}
            className="my-8 px-6 py-3 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: '#3958bd' }}
          >
            🚀 Google 로그인하기
          </button>
        )}

        {user && (
          <>
            <div className="w-full max-w-md text-center mb-8 px-4">
              <div className="w-full max-w-md text-[#3958bd] text-left font-apple_bigbold mt-10 mb-6 px-12">
                <p className="font-apple text-base mb-1">같이 없는 시간까지 함께하는</p>
                <h1 className="text-3xl">반려묘의<br />모든 것</h1>
              </div>
              <p className="text-sm font-apple_bold text-black">{catName}님의 활동 유형은</p>

              <div className="w-48 mx-auto my-4">
                <img
                  src={profileImages[profileImage]}
                  alt="프로필 이미지"
                  className="w-full"
                />
              </div>

              <p className="text-2xl text-[#3958bd] font-jua mt-1">활발한 활동 고양이</p>
              <p className="text-sm font-apple mt-4">안녕하세요!</p>
              <p className="text-sm font-apple">오늘 {catName}의 하루를 보여드릴게요!</p>
            </div>
          </>
        )}
      </div>

      {user && (
        <div className="w-full bg-[#5976D7] flex flex-col items-center px-0 pb-10 rounded-tl-3xl rounded-tr-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.15)] mb-20 min-h-[calc(100vh-150px)]">
          <div className="w-full max-w-md text-center space-y-6 px-4 pt-10">
            <h1 className="text-left text-white font-apple_bigbold px-5">• 일기 자동 생성</h1>

            <div className="bg-white border border-[#ccc] rounded-2xl shadow-md p-4 text-left space-y-3 w-4/5 mx-auto">
              <div className="rounded-xl overflow-hidden aspect-square border border-gray-100">
                <img
                  src={drawCat}
                  alt="고양이 일기 예시"
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-gray-800 text-sm font-gowun whitespace-pre-line">
                오늘은 아주 평화로운 하루였어요 😻{'\n'}
                - 낮잠을 3시간 자고{'\n'}
                - 2번 사료를 먹고{'\n'}
                - 창문 앞에서 5분간 멍 때렸어요.
              </p>
            </div>

            <div className="w-full mt-6 flex justify-center">
              <button
                onClick={saveServerDiary}
                className="block w-full h-[50px] w-[275px] max-w-xs px-5 py-2 bg-white text-[#5976D7] text-sm font-apple_sobigbold rounded-full shadow hover:shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                오늘 일기 자동 생성하기
              </button>
            </div>

            <br />
            <h1 className="text-left text-white font-apple_bigbold px-5 mt-8">• 일일 추억 저장</h1>
            <h3 className="text-lg text-white font-apple_bigbold text-gray-800 mb-4">📍 오늘 기록</h3>

            {todayLog ? (
              <div className="bg-white p-4 w-4/5 mx-auto rounded-2xl shadow-xl space-y-4">
                {todayLog.image && (
                  <div className="rounded-xl overflow-hidden aspect-square border border-gray-100">
                    <img
                      src={todayLog.image}
                      alt="오늘의 고양이"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line font-apple_bold">
                  {todayLog.text}
                </p>
              </div>
            ) : (
              <div className="font-apple text-gray-700 text-white mb-6">
                아직 오늘 기록이 없어요.{' '}
                <a href="/write" className="underline" style={{ color: 'white' }}>
                  기록하러 가기
                </a>
              </div>
            )}

            {user && allLogs.length > 0 && (
              <div className="w-4/5 mx-auto mt-8">
                <h3 className="text-lg text-white font-apple_bigbold text-gray-800 mb-6">📜 모든 기록</h3>
                <div className="grid grid-cols-2 gap-4">
                  {allLogs.map((log, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow p-2 flex flex-col">
                      {log.image && (
                        <div className="rounded overflow-hidden aspect-square border border-gray-100 mb-2">
                          <img src={log.image} className="object-cover w-full h-full" alt={`log-${idx}`} />
                        </div>
                      )}
                      <p className="text-xs text-gray-600 whitespace-pre-line break-words font-apple_bold">
                        {log.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full mt-6 flex justify-center">
              <a
                href="/write"
                className="block w-full max-w-xs h-[50px] w-[275px] px-5 py-2 bg-white text-[#5976D7] text-sm font-apple_sobigbold rounded-full shadow hover:shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                기록 추가하기
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;



