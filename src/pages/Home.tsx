import { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { saveServerDiary } from '../server/saveServerDiary';
import { useSelectedCat } from '../utils/SelectedCatContext'; // ✅ 추가

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
  const [todayLog, setTodayLog] = useState<any>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [todayDiary, setTodayDiary] = useState<string | null>(null);
  const { selectedCat } = useSelectedCat(); // ✅ 선택된 고양이 Context 불러오기
  const todayLogForSelectedCat = todayLog && selectedCat && todayLog.catId === selectedCat.id ? todayLog : null;
  const [loadingUser, setLoadingUser] = useState(true);
  
  // 모든 기록 필터링
  const filteredLogs = selectedCat
    ? allLogs.filter((log) => log.catId === selectedCat.id)
    : [];

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
        setLoadingUser(false); // ✅ 무조건 로딩 끝났다고 알려줌
      });
    
      return () => unsubscribe();
    }, []);
    

  useEffect(() => {
    const diary = localStorage.getItem('todayLog');

    if (diary) {
      setTodayDiary(diary);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !selectedCat) return;
  
      const q = query(
        collection(db, 'logs', currentUser.uid, 'entries'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
  
      const fetchedLogs = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          docId: doc.id,
          text: data.text ?? '',
          tags: data.tags ?? [],
          image: data.image ?? '',
          createdDate: typeof data.createdDate === 'string'
            ? data.createdDate
            : (data.createdDate?.toDate?.().toISOString().split('T')[0] || doc.id),
          catId: data.catId ?? null,
        };
      });
  
      setAllLogs(fetchedLogs);
    };
  
    fetchData();
  }, [selectedCat]);  
  
  useEffect(() => {
    if (!selectedCat || allLogs.length === 0) return;
  
    const todayDate = new Date().toISOString().split('T')[0];
  
    const foundTodayLog = allLogs.find((log) => 
      log.createdDate === todayDate && log.catId === selectedCat.id
    );
  
    setTodayLog(foundTodayLog ?? null);
  }, [selectedCat, allLogs]);
  

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log('로그인 성공:', result.user.displayName);
    } catch (e) {
      console.error('로그인 실패:', e);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-400">
        로딩 중...
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-400">
        로그인 후 이용해주세요
      </div>
    );
  }
  
  if (!selectedCat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-gray-400">
        고양이 정보를 불러오는 중...
      </div>
    );
  }  

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
              <p className="text-sm font-apple_bold text-black">{selectedCat?.nickname ?? ''}님의 활동 유형은</p>

              <div className="w-48 mx-auto my-4">
                <img
                  src={profileImages[selectedCat.profileImage]}
                  alt="프로필 이미지"
                  className="w-full"
                />
              </div>

              {/*고양이 유형별
              활발한 활동 고양이:	많이 움직이고 자주 탐색함
              느긋한 집냥이:	주로 잠자고 편안한 공간 선호
              호기심 많은 탐험가:	새로운 장소, 소리 탐색을 즐김
              애교 폭발 꾹꾹이:	보호자 근처에서 애교 많음
              외향적 파티냥이:	낯선 사람이나 동물에게도 활발함
              독립적인 혼자냥이:	혼자 있는 걸 좋아함  */}
              
              {/*<p className="text-2xl text-[#3958bd] font-jua mt-1">{catType}</p>*/}
              <p className="text-2xl text-[#3958bd] font-jua mt-1">활발한 활동 고양이</p>
              <p className="text-sm font-apple mt-4">안녕하세요!</p>
              <p className="text-sm font-apple">오늘 {selectedCat?.nickname ?? ''}의 하루를 보여드릴게요!</p>
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

            {/* 감성 일기 표시 */}
            {todayDiary && (
              <div className="bg-white p-4 mt-6 rounded-xl shadow">
                <h3 className="text-lg font-bold mb-2 text-[#3958bd]">🐾 오늘의 감성 일기</h3>
                <p className="text-sm whitespace-pre-line font-apple">{todayDiary}</p>
              </div>
            )}

            <br />
            <h1 className="text-left text-white font-apple_bigbold px-5 mt-8">• 일일 추억 저장</h1>
            <h3 className="text-lg text-white font-apple_bigbold text-gray-800 mb-4">📍 오늘 기록</h3>
            
            {todayLogForSelectedCat ? (
              <div className="bg-white p-4 w-4/5 mx-auto rounded-2xl shadow-xl space-y-4">
                {todayLogForSelectedCat.image && (
                  <div className="rounded-xl overflow-hidden aspect-square border border-gray-100">
                    <img
                      src={todayLogForSelectedCat.image}
                      alt="오늘의 고양이"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line font-apple_bold">
                  {todayLogForSelectedCat.text}
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

            {user && filteredLogs.length > 0 && (
              <div className="w-4/5 mx-auto mt-8">
                <h3 className="text-lg text-white font-apple_bigbold text-gray-800 mb-6">📜 모든 기록</h3>
                <div className="grid grid-cols-2 gap-4">
                  {filteredLogs.map((log, idx) => (
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



