import { useEffect, useState, useRef, Key, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BarChart as BarChartIcon, CalendarDays, Pencil, Trash2, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const characterImages: Record<string, string> = { ch_1, ch_2, ch_3, ch_4, ch_5, ch_6 };
const defaultTags = ['행복', '슬픔', '분노', '기쁨', '불안', '놀람', '사랑', '지루함', '궁금', '심심'];

type LogEntry = {
  docId: string;
  date: string;
  text: string;
  image?: string;
  tags?: string[];
};

const positiveTags = ['행복', '기쁨', '사랑'];
const negativeTags = ['슬픔', '분노', '불안'];
const neutralTags = ['지루함', '궁금', '심심', '놀람'];

const emotionMessages = {
  positive: [
    '오늘도 좋은 하루였냥~', '냥이는 행복한 하루를 보냈어요!',
    '기쁨을 꼬리에 달고 왔어요~', '사랑 듬뿍 받은 하루였겠죠?', '마음이 보송보송해졌어요 🐾'
  ],
  negative: [
    '오늘은 츄르를 주는 건 어떨까요?', '냥이가 힘든 하루를 보냈어요.',
    '불안한 기분, 나도 알아요. 우리 같이 있어요.', '이럴 땐 고양이 꾹꾹이가 최고!',
    '따뜻한 담요처럼 감싸줄게요.'
  ],
  neutral: [
    '지루할 땐 털실이 최고죠!', '냥이는 새로운 걸 탐색 중이에요.',
    '오늘은 평범하지만 나름 소중했어요.', '놀라운 순간도 기록해두면 좋아요.',
    '이런 날은 캣타워 탐험이죠!'
  ]
};


const History = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState<'calendar' | 'chart' | null>(null);
  const [emotionMap, setEmotionMap] = useState<Record<string, string>>({});
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState('ch_1');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [todayEmotionMessage, setTodayEmotionMessage] = useState('오늘 하루도 고생했어요!');
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDetail, setShowDetail] = useState<LogEntry | null>(null);

  const handleEdit = (log: LogEntry, e?: React.MouseEvent) => {
    e?.stopPropagation(); // 클릭 이벤트 버블링 방지
    setShowDetail(null);  // 상세보기 닫기
    setEditTarget(log);
    setEditText(log.text);
    setEditTags([...(log.tags ?? [])]);
    setEditMode(true);
  };
  
  const handleDelete = (log: any, e?: React.MouseEvent) => {
    e?.stopPropagation(); // 클릭 이벤트 버블링 방지
    setShowDetail(null);  // 상세보기 닫기
    setDeleteTarget(log);
  };
  
  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const profileSnap = await getDoc(doc(db, 'users', user.uid));
      if (profileSnap.exists()) {
        setProfileImage(profileSnap.data().profileImage || 'ch_1');
      }
  
      const q = query(collection(db, 'logs', user.uid, 'entries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
  
      const fetched = snap.docs.map((doc) => {
        const data = doc.data();
        const rawDate = data.createdDate;
        let formattedDate = '';
  
        if (typeof rawDate === 'string') {
          formattedDate = rawDate;
        } else if (rawDate?.toDate) {
          formattedDate = new Date(rawDate.toDate().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else {
          const fallbackDate = data.createdAt?.toDate?.() ?? new Date(doc.id);
          formattedDate = fallbackDate.toISOString().split('T')[0];
        }
  
        return {
          date: formattedDate,
          docId: doc.id,
          text: data.text ?? '',
          image: data.image ?? '',
          tags: data.tags ?? [],
        };
      });
  
      const today = new Date();
      const filtered = fetched.filter(entry => {
        const entryDate = new Date(entry.date);
        return !isNaN(entryDate.getTime()) &&
               entryDate.getTime() <= today.getTime() &&
               entry.text?.trim() !== '';
      });
  
      setLogs(filtered);
  
      // ✅ 감정 마커 색상 설정
      const unsortedMap: Record<string, string> = {};
      filtered.forEach(entry => {
        const tags = entry.tags || [];
        if (tags.includes('행복')) unsortedMap[entry.date] = '#FFD700';
        else if (tags.includes('슬픔')) unsortedMap[entry.date] = '#87CEFA';
        else unsortedMap[entry.date] = '#3958bd';
      });
  
      // ✅ 날짜 순 정렬한 emotionMap
      const sortedMap = Object.keys(unsortedMap)
        .sort()
        .reduce((acc, key) => {
          acc[key] = unsortedMap[key];
          return acc;
        }, {} as Record<string, string>);
  
      setEmotionMap(sortedMap);
  
      // ✅ activeDates도 정렬해서 셋팅
      const uniqueDates = [...new Set(filtered.map(entry => entry.date))].sort();
      setActiveDates(uniqueDates);

      // 🔻 최근 3일 감정 메시지 계산
      const recentRange = 3;
      const now = new Date();

      const recentEntries = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        const diff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= recentRange;
      });

      let pos = 0, neg = 0, neu = 0;
      recentEntries.forEach(entry => {
        const tags = entry.tags || [];
        if (tags.some((tag: string) => positiveTags.includes(tag))) pos++;
        else if (tags.some((tag: string) => negativeTags.includes(tag))) neg++;
        else if (tags.some((tag: string) => neutralTags.includes(tag))) neu++;
      });

      let category: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (pos >= neg && pos >= neu) category = 'positive';
      else if (neg >= pos && neg >= neu) category = 'negative';

      const messages = emotionMessages[category];
      const random = Math.floor(Math.random() * messages.length);
      setTodayEmotionMessage(messages[random]);
    };
  
    fetch();
  }, []);
  

  const validMarkedDates = useMemo(() => {
    return logs
      .filter((entry) => entry.text?.trim() !== '')
      .map((entry) => entry.date);
  }, [logs]);

  const handleDateChange = (value: Value) => {
    if (!value) return;
  
    const selected = Array.isArray(value) ? value[0] : value;
    if (!selected || !(selected instanceof Date)) return;
  
    const dateStr = selected.toISOString().split('T')[0];
    if (selected > new Date()) {
      alert('미래 날짜는 선택할 수 없어요!');
      return;
    }
  
    setSelectedDate(dateStr);
    setShowModal(null);
  };  
  

  const tagCountMap = logs
  .flatMap(log => log.tags || [])
  .reduce<Record<string, number>>((acc, tag) => {
    const cleanTag = tag.replace(/#/g, ''); // # 제거
    acc[cleanTag] = (acc[cleanTag] || 0) + 1;
    return acc;
  }, {});

  // 중복 제거: tag 이름 기준으로 하나만
  const seen = new Set<string>();
  const chartFormatted = Object.entries(tagCountMap)
    .filter(([name]) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    })
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // 상위 5개 감정만


  const visibleLogs = selectedDate? logs.filter(l => l.date.startsWith(selectedDate)): logs;
  
  const recentDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i)); // 오늘 포함 최근 5일
    return {
      date: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('ko-KR', { weekday: 'short' }), // 예: 월, 화
    };
  });

  const recordedDates = logs
  .filter(log => log.text?.trim() !== '')
  .map(log => log.date);



  const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
    if (!editTarget) return;
  
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요해요!");
      return;
    }
  
    try {
      const logRef = doc(db, 'logs', user.uid, 'entries', editTarget.docId);
      await updateDoc(logRef, {
        text: editText,
        tags: editTags.map((tag) => tag.replace(/^#/, '')),
      });
  
      setLogs((prev) =>
        prev.map((log) =>
          log.docId === editTarget.docId
            ? { ...log, text: editText, tags: editTags }
            : log
        )        
      );
  
      // ✅ 팝업 상태 전부 닫기
      setEditMode(false);
      setEditTarget(null);
      setEditText('');
      setEditTags([]);
      setShowDetail(null); // ✅ 상세 모달도 닫기
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 중 오류가 발생했어요');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#5976D7] text-white">
      <div className="relative py-6 text-center">
        <h2 className="text-xl font-apple_bigbold">혼냥일기 히스토리</h2>
        <button onClick={() => setShowModal(showModal === 'calendar' ? null : 'calendar')} className="absolute right-4 top-6">
          <CalendarDays className="w-6 h-6" />
        </button>
        <button onClick={() => setShowModal(showModal === 'chart' ? null : 'chart')} className="absolute left-4 top-6">
          <BarChartIcon className="w-6 h-6" />
        </button>
      </div>

      {showModal === 'calendar' && (
        <div className="flex justify-center mb-6">
          <div className="bg-white text-black rounded-xl p-4 w-[360px] max-w-md mx-auto">
            <Calendar
              value={null}
              key={activeDates.join(',')} // 매번 완전히 새로 렌더되게 함
              onChange={handleDateChange}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
              
                const kstDateStr = new Date(date.getTime() + 9 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0];
              
                const color = emotionMap[kstDateStr];
                const isValidColor = ['#FFD700', '#87CEFA', '#3958bd'].includes(color);
              
                return (
                  <div
                    className={`flex justify-center items-center h-[6px] ${isValidColor ? 'mt-1' : 'pt-0'}`}
                  >
                    {isValidColor && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </div>
                );
              }}                                          
            />
          </div>
        </div>
      )}

      {editMode && editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
            <h3 className="text-lg font-apple_bold text-gray-700 mb-4 text-center">내용 & 해시태그 수정</h3>

            {/* 📝 텍스트 박스 */}
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="수정할 내용을 입력해주세요"
              className="w-full text-black p-3 border border-gray-300 rounded-lg text-sm font-apple mb-4 focus:outline-none focus:ring-2 focus:ring-[#3958bd]"
              rows={3}
            />

            {/* 🏷️ 해시태그 토글 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {defaultTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setEditTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag.replace(/^#/, '')] // ✅ 여기서도 # 없애고 추가
                    )
                  }                  
                  className={`px-3 py-1 rounded-full text-xs font-apple border transition ${
                    editTags.includes(tag)
                      ? 'bg-[#3958bd] text-white'
                      : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2">
              <button
                className="text-sm px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-apple"
                onClick={() => {
                  setEditMode(false);
                  setEditTarget(null);
                  setEditText('');
                  setEditTags([]);
                }}
              >
                취소
              </button>
              <button
                className="text-sm px-4 py-2 rounded-lg bg-[#3958bd] text-white font-apple_bold"
                onClick={handleUpdate}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}


      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
            <h3 className="text-lg font-apple_bold text-gray-700 mb-4 text-center">정말 삭제할까요?</h3>
            <p className="text-sm text-center text-gray-500 font-apple mb-4">삭제된 기록은 복구할 수 없어요.</p>

            {deleteTarget.image && (
              <div className="w-full aspect-square overflow-hidden rounded-lg border mb-3">
                <img src={deleteTarget.image} alt="삭제 미리보기" className="object-cover w-full h-full" />
              </div>
            )}

            <p className="text-xs text-gray-600 font-apple mb-6 text-center whitespace-pre-line">
              "{deleteTarget.text.length > 80 ? deleteTarget.text.slice(0, 80) + '...' : deleteTarget.text}"
            </p>

            <div className="flex justify-end gap-2">
              <button className="text-sm px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-apple" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
              <button className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white font-apple_bold" onClick={async () => {
                const user = auth.currentUser;
                if (!user || !deleteTarget) return;
                const logRef = doc(db, 'logs', user.uid, 'entries', deleteTarget.docId);
                try {
                  await deleteDoc(logRef);
                
                  // 삭제된 로그를 상태에서 제거
                  setLogs((prev) =>
                    prev.filter((log) => log.docId !== deleteTarget.docId)
                  );
              
                } catch (e) {
                  console.error('삭제 실패:', e);
                  alert('삭제 중 오류 발생');
                } finally {
                  setDeleteTarget(null);    // 삭제 팝업 닫기
                  setShowDetail(null);      // ✅ 상세 모달도 닫기
                }                
              }}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}


      {showModal === 'chart' && (
        <div className="flex justify-center mb-6">
          <div className="bg-white text-black rounded-xl p-4 w-[90%] max-w-md">
            <h3 className="text-lg font-bold text-center mb-4">최근 해시태그 차트</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartFormatted}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 13, fontWeight: 500, fill: '#000', fontFamily: 'AppleSDGothicNeoB00' }}
                  tickFormatter={(v) => v.replace('#', '')}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="bg-white border border-gray-300 rounded-xl px-4 py-2 shadow-lg font-apple text-sm text-gray-800">
                        <p className="font-semibold text-[#3958bd]">
                          {payload[0].payload.name}: <span className="text-black">{payload[0].value}회</span>
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartFormatted.map((_, i) => (
                    <Cell key={i} fill={['#4A6CF7', '#5F82FF', '#7A9AFF', '#A3B9FF', '#C9D6FF'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="relative w-full flex flex-col justify-end items-center mb-8 h-60">
        <div className="absolute inset-0 bg-repeat-x bg-bottom animate-cloud"
             style={{ backgroundImage: "url('/img/cloud-bg.png')", backgroundSize: 'cover', opacity: 0.4 }} />
        <div className="relative z-10 bg-[#f4f6ff] text-[#3958bd] rounded-2xl px-6 py-4 font-apple_bold shadow text-center max-w-[80%]">
          <span className="text-[18px]">“</span>{todayEmotionMessage}<span className="text-[18px]">”</span>
        </div>
        <img src={characterImages[profileImage]} alt="고양이" className="relative z-10 w-32 mt-4" />
      </div>

      <div className="bg-white text-black rounded-t-3xl px-4 py-6 !pb-[120px] min-h-[calc(100vh-200px)]">
        {/* ✅ 최근 5일치 기록 여부 스탬프 UI */}
        <div className="bg-white text-black px-4 pt-1 mb-4">
            <div className="flex justify-between w-full">
              {recentDays.map(({ date, day }) => {
                const isChecked = recordedDates.includes(date);
                return (
                  <div key={date} className="flex flex-col items-center">
                    <span className="text-[13px] font-medium text-gray-500 mb-1">{day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition duration-200
                      ${isChecked ? 'bg-white border-[#3958bd] text-[#3958bd]' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                      {isChecked && <Check className="w-4 h-4" strokeWidth={4} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        {visibleLogs.length === 0 ? (
          <p className="text-center text-sm">기록이 없습니다 😿</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visibleLogs.map((log, i) => (
              <div key={i} onClick={() => setShowDetail(log)} className="bg-white rounded-xl shadow p-4 relative group transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                {log.image && (
                  <div className="aspect-square mb-2 overflow-hidden rounded-xl">
                    <img src={log.image} alt={`냥이사진 ${i}`} className="w-full h-full object-cover" />
                  </div>
                )}

                {log.tags && log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 text-xs text-[#3958bd] font-apple">
                    {log.tags.map((tag: string, j: Key | null | undefined) => (
                      <span key={j}>#{tag.replace(/^#/, '')}</span>  // #이 이미 있으면 제거 후 붙이기
                    ))}
                  </div>
                )}

                <p className="text-sm font-semibold mb-1 whitespace-pre-line">{log.text}</p>
                <p className="text-xs text-gray-500">{log.date}</p>

                {/* 수정 / 삭제 버튼 */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-5 flex gap-3 sm:gap-4 opacity-60 group-hover:opacity-100 transition">
                  <button onClick={(e) => handleEdit(log, e)}>
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-[#3958bd]" />
                  </button>
                  <button onClick={(e) => handleDelete(log, e)}>
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-[90%] text-black relative">
            <button
              onClick={() => setShowDetail(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {showDetail.image && (
              <img
                src={showDetail.image}
                alt="기록 이미지"
                className="w-full rounded-lg mb-4"
              />
            )}

            {Array.isArray(showDetail.tags) && (
              <div className="flex flex-wrap gap-2 text-sm font-apple mt-2">
                {showDetail.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white text-[#3958bd] rounded-full border border-[#3958bd] text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <br />
            <h3 className="font-bold mb-2 text-black px-1">{showDetail.date}</h3>
            <p className="mb-3 whitespace-pre-line px-1">{showDetail.text}</p>

          </div>
        </div>
      )}
    </div>
  );
};

export default History;
