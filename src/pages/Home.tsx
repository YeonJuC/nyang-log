import { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';

import { useSelectedCat } from '../utils/SelectedCatContext'; // ✅ 추가
import { X } from 'lucide-react';

import drawCat from '../img/draw_cat.png';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

import activeCatImg from '../img/activeCat.png';
import chillCatImg from '../img/chillCat.png';
import explorerCatImg from '../img/explorerCat.png';
import lovelyCatImg from '../img/lovelyCat.png';
import partyCatImg from '../img/partyCat.png';
import independentCatImg from '../img/independentCat.png';
import { useRef } from 'react';  

const catTypeImages = {
  activeCat: activeCatImg,
  chillCat: chillCatImg,
  explorerCat: explorerCatImg,
  lovelyCat: lovelyCatImg,
  partyCat: partyCatImg,
  independentCat: independentCatImg,
};

const profileImages: Record<string, string> = {
  ch_1,
  ch_2,
  ch_3,
  ch_4,
  ch_5,
  ch_6,
};


export const catTypes = {
  activeCat: {
    name: "활발한 활동 고양이",
    description: "항상 움직이고 놀기를 좋아하는 에너지 넘치는 고양이에요. 새로운 자극을 즐기고 활발히 탐험합니다!",
    message: "🏃‍♂️ 세상을 뛰어다니는 에너자이저냥!"
  },
  chillCat: {
    name: "느긋한 집냥이",
    description: "편안한 공간을 좋아하고 주로 낮잠을 즐기는 고양이에요. 느긋하고 안정적인 성격입니다.",
    message: "😴 낮잠이 최고냥! 포근포근 집냥이"
  },
  explorerCat: {
    name: "호기심 많은 탐험가",
    description: "새로운 장소, 냄새, 소리에 흥미를 느끼며 적극적으로 탐험하는 고양이에요!",
    message: "🔎 세상은 모험으로 가득한 탐험냥!"
  },
  lovelyCat: {
    name: "애교 폭발 꾹꾹이",
    description: "항상 보호자 주변을 맴돌며 애정을 표현하는 귀여운 고양이에요. 꾹꾹이도 자주 합니다!",
    message: "💖 사랑을 듬뿍 주는 꾹꾹이 장인냥!"
  },
  partyCat: {
    name: "외향적 파티냥이",
    description: "낯선 사람, 낯선 동물도 겁내지 않고 다가가는 외향적인 성격의 고양이에요!",
    message: "🎉 모두랑 친구 되는 파티냥!"
  },
  independentCat: {
    name: "독립적인 혼자냥이",
    description: "혼자 있는 걸 좋아하고 스스로 시간을 보내는 걸 즐기는 고양이에요. 조용하고 차분한 성격입니다.",
    message: "🌙 혼자만의 시간이 소중한 고독냥"
  }
};


const testQuestions = [
  {
    question: "새로운 공간에 들어갔을 때 나는?",
    options: [
      { text: "바로 이리저리 탐색한다", type: 'activeCat' },
      { text: "편안한 자리를 찾는다", type: 'chillCat' },
      { text: "조심스럽게 냄새를 맡으며 다닌다", type: 'explorerCat' },
      { text: "그냥 구석에 앉아 지켜본다", type: 'independentCat' },
    ],
  },
  {
    question: "누군가 나에게 다가오면 나는?",
    options: [
      { text: "반가워서 먼저 다가간다", type: 'partyCat' },
      { text: "조금 거리를 두고 본다", type: 'independentCat' },
      { text: "얼른 가서 부비부비한다", type: 'lovelyCat' },
      { text: "호기심은 있지만 다가가진 않는다", type: 'explorerCat' },
    ],
  },
  {
    question: "혼자 있을 때 나는?",
    options: [
      { text: "새로운 걸 찾아 돌아다닌다", type: 'explorerCat' },
      { text: "가만히 쉬거나 잔다", type: 'chillCat' },
      { text: "장난감을 가지고 논다", type: 'activeCat' },
      { text: "그리워하며 누군가 기다린다", type: 'lovelyCat' },
    ],
  },
  {
    question: "어떤 장소를 좋아하나요?",
    options: [
      { text: "넓고 활발한 공간", type: 'activeCat' },
      { text: "아늑하고 조용한 곳", type: 'chillCat' },
      { text: "새로운 냄새가 나는 곳", type: 'explorerCat' },
      { text: "사람들이 많은 곳", type: 'partyCat' },
    ],
  },
  {
    question: "내 성격을 한마디로 표현하면?",
    options: [
      { text: "호기심 왕", type: 'explorerCat' },
      { text: "집순이/집돌이", type: 'chillCat' },
      { text: "에너지 폭발", type: 'activeCat' },
      { text: "사랑꾼", type: 'lovelyCat' },
    ],
  },
];

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [todayDiary, setTodayDiary] = useState<string | null>(null);
  const { selectedCat } = useSelectedCat(); // ✅ 선택된 고양이 Context 불러오기
  const todayLogForSelectedCat = todayLog && selectedCat && todayLog.catId === selectedCat.id ? todayLog : null;
  const [loadingUser, setLoadingUser] = useState(true);
  const [openTypePopup, setOpenTypePopup] = useState(false);
  const [catTypeKey, setCatTypeKey] = useState<'activeCat' | 'chillCat' | 'explorerCat' | 'lovelyCat' | 'partyCat' | 'independentCat'>('activeCat');
  // 🐾 테스트 상태
  const [isTesting, setIsTesting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [catTypesByProfile, setCatTypesByProfile] = useState<Record<string, keyof typeof catTypes>>({});
  const currentTypeKey = selectedCat ? catTypesByProfile[selectedCat.id] || 'activeCat' : 'activeCat';
  const [isTodayDiarySaved, setIsTodayDiarySaved] = useState(false);

  const [saving, setSaving] = useState(false); // ✅ 저장 중 상태 추가
  const todayDiaryRef = useRef<HTMLDivElement>(null);

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  };
  
  const generateDiaryFromServer = async (events: any[]) => {
    const response = await fetch('http://127.0.0.1:5000/generate-diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  
    if (!response.ok) {
      throw new Error('일기 생성 실패');
    }
  
    const data = await response.json();
    return data; // { day, diary }
  };
  
  const saveDiaryToFirestore = async (catId: string, day: string, diary: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('로그인 필요');
  
    const diaryRef = doc(db, 'users', currentUser.uid, 'cats', catId, 'diaries', day);
    await setDoc(diaryRef, { day, diary });
  };

  const today = new Date();
  const todayString = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

  const events: any[] = [
    { time: `${todayString} 08:00`, emotions: "공포", behaviors: "팔을 뻗어 휘젓거림" },
    { time: `${todayString} 14:00`, emotions: "편안함", behaviors: "식빵 자세" },
    { time: `${todayString} 19:00`, emotions: "행복", behaviors: "걷거나 뜀" }
  ];

  const generateAndSaveDiary = async (selectedCat: any, events: any[]) => {
    if (!selectedCat) return;
  
    setSaving(true);
    try {
      const { day, diary } = await generateDiaryFromServer(events);
      await saveDiaryToFirestore(selectedCat.id, day, diary);
      await fetchTodayDiary(); // 저장 후 오늘 일기 다시 불러오기
      alert('오늘 일기가 저장되었습니다!');

      // ✅ 저장 완료 후 부드럽게 스크롤 이동
      setTimeout(() => {
        todayDiaryRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300); // 약간 딜레이 주면 더 부드러움
    } catch (error) {
      console.error('에러 발생:', error);
      alert('일기 생성 또는 저장 실패');
    } finally {
      setSaving(false);
    }
  };  

  const startTest = () => {
    setIsTesting(true);
    setCurrentQuestionIndex(0);
    setScores({});
  };
  
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
      if (selectedCat) {
        fetchTodayDiary(); // 오늘(day) 일기 Firestore에서 읽어오기
      }
    }, [selectedCat]);


    const fetchTodayDiary = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser || !selectedCat) return;
    
      const today = getTodayString();
      const diaryRef = doc(db, 'users', currentUser.uid, 'cats', selectedCat.id, 'diaries', today);
      const diarySnap = await getDoc(diaryRef);
    
      if (diarySnap.exists()) {
        setTodayDiary(diarySnap.data().diary); // 오늘 일기 세팅
        setIsTodayDiarySaved(true);            // 저장 완료 상태 세팅
      } else {
        setTodayDiary(null);                   // 오늘 일기 없음
        setIsTodayDiarySaved(false);            // 버튼 다시 보여주기
      }
    };
    

  useEffect(() => {
    const diary = localStorage.getItem('todayLog');

    if (diary) {
      setTodayDiary(diary);
    }
  }, []);

  useEffect(() => {
    const savedType = localStorage.getItem('catTypeKey') as keyof typeof catTypes;
    if (savedType && catTypes[savedType]) {
      setCatTypeKey(savedType);
    }
  }, []);  

  useEffect(() => {
    const saved = localStorage.getItem('catTypesByProfile');
    if (saved) {
      setCatTypesByProfile(JSON.parse(saved));
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

  const handleAnswer = (type: string) => {
    setScores((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
  
    if (currentQuestionIndex + 1 < testQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const result = getResult();
      if (selectedCat) {
        const updated = {
          ...catTypesByProfile,
          [selectedCat.id]: result,
        };
        setCatTypesByProfile(updated);
        localStorage.setItem('catTypesByProfile', JSON.stringify(updated)); // ✅ 저장
      }
      setIsTesting(false);
    }
  };  
  
  const getResult = () => {
    let maxScore = 0;
    let selectedType = 'activeCat';
  
    Object.entries(scores).forEach(([type, score]) => {
      if (score > maxScore) {
        maxScore = score;
        selectedType = type;
      }
    });
  
    return selectedType as keyof typeof catTypes;
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
              <p
                onClick={() => setOpenTypePopup(true)}
                className="text-2xl text-[#3958bd] font-jua mt-1 cursor-pointer hover:underline"
              >
                {catTypes[currentTypeKey].name}
              </p>
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

            {/* 오늘 일기 저장 버튼: 아직 저장 안했으면 보임 */}
            {!isTodayDiarySaved && (
              <div className="flex justify-center mt-6 mb-6">
                <button
                  onClick={() => generateAndSaveDiary(selectedCat, events)}
                  disabled={saving}
                  className="w-[240px] h-[40px] px-6 py-2 bg-white text-[#5976D7] font-apple_bold text-sm rounded-full shadow hover:scale-105 transition"
                >
                  {saving ? "저장 중..." : "오늘 일기 자동 생성하기"}
                </button>
              </div>
            )}

            {/* 오늘 감성 일기 박스: 저장했으면 보임 */}
            {todayDiary && (
              <div
                ref={todayDiaryRef}
                className="bg-white border border-[#ccc] rounded-2xl shadow-md p-6 text-center space-y-4 w-4/5 mx-auto mt-6"
              >
                <h3 className="text-xl font-bold text-[#3958bd] flex items-center justify-center gap-2 font-jua">
                  <span>🐾</span> 오늘의 감성 일기
                </h3>
                <div className="text-gray-700 text-sm whitespace-pre-line font-apple leading-relaxed">
                  {todayDiary}
                </div>
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
      {isTesting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4 text-[#3958bd]">
              {testQuestions[currentQuestionIndex].question}
            </h2>
            <div className="flex flex-col gap-3">
              {testQuestions[currentQuestionIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.type)}
                  className="px-4 py-2 bg-[#f4f6ff] text-[#3958bd] rounded-full text-sm hover:bg-[#d5defc]"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {openTypePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out opacity-100">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center transform transition-transform duration-300 ease-in-out scale-100">
            
            {/* 닫기 버튼 */}
            <button
              onClick={() => setOpenTypePopup(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 고양이 타입 이름 */}
            <h2 className="text-xl font-bold mb-2 text-[#3958bd]">{catTypes[currentTypeKey].name}</h2>

            {/* 고양이 타입 이미지 */}
            <div className="w-24 h-24 mx-auto mb-4">
              <img src={catTypeImages[currentTypeKey]} alt="타입 이미지" className="object-cover w-full h-full" />
            </div>

            <div className="bg-[#f4f6ff] text-[#3958bd] text-sm rounded-xl px-4 py-3 mb-6 max-w-xs mx-auto relative">
              {/*<div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f4f6ff] rotate-45"></div> */}
              {catTypes[currentTypeKey].message}
            </div>

            {/* 고양이 설명 */}
            <p className="text-sm text-gray-700 mb-6">{catTypes[currentTypeKey].description}</p>

            {/* 테스트 다시 해보기 버튼 */}
            <button
              className="px-4 py-2 bg-[#3958bd] text-white rounded-full text-sm"
              onClick={() => {
                setOpenTypePopup(false);
                startTest();
              }}
            >
              테스트 다시 해보기
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Home;