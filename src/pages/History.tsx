import { useEffect,  useRef,  useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
// 아이콘은 alias로 바꿔줍니다!
import { BarChart as BarChartIcon, CalendarDays, Pencil, Trash2, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type MouseEvent } from 'react';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const characterImages: Record<string, string> = {
  ch_1,
  ch_2,
  ch_3,
  ch_4,
  ch_5,
  ch_6,
};

const defaultTags = ['행복', '슬픔', '분노', '기쁨', '불안', '놀람', '사랑', '지루함', '궁금', '심심'];
const positiveTags = ['행복', '기쁨', '사랑'];
const negativeTags = ['슬픔', '분노', '불안'];
const neutralTags = ['지루함', '궁금', '심심', '놀람'];

const emotionMessages = {
  positive: [
    '오늘도 좋은 하루였냥~', '냥이는 행복한 하루를 보냈어요!', '이 기분, 오래오래 간직하자!',
    '고양이도 웃는 것 같지 않아요?', '따뜻한 햇살처럼 포근한 하루예요.', '기쁨을 꼬리에 달고 왔어요~',
    '오늘은 머리 쓰담쓰담해줄까요?', '사랑 듬뿍 받은 하루였겠죠?', '이대로 졸리게 마무리해도 좋을 날이에요.',
    '마음이 보송보송해졌어요 🐾'
  ],
  negative: [
    '오늘은 츄르를 주는 건 어떨까요?', '기분이 우울할 땐 고양이 배를 만져봐요.', '냥이가 힘든 하루를 보냈어요.',
    '괜찮아, 내일은 더 좋아질 거예요.', '우울한 날엔 부드러운 인형처럼 안아줘요.',
    '마음이 무거울 땐 고양이랑 눈 마주쳐봐요.', '오늘은 그냥 조용히 쉬자냥...',
    '불안한 기분, 나도 알아요. 우리 같이 있어요.', '이럴 땐 고양이 꾹꾹이가 최고!',
    '따뜻한 담요처럼 감싸줄게요.'
  ],
  neutral: [
    '오늘은 장난감 하나 꺼내볼까요?', '지루할 땐 털실이 최고죠!', '냥이는 새로운 걸 탐색 중이에요.',
    '뭔가 특별한 일이 일어날 것 같은 하루!', '심심하면 창밖을 바라보자~',
    '놀라운 순간도 기록해두면 좋아요.', '뭐 하고 있었는지 기억나시나요?',
    '오늘은 평범하지만 나름 소중했어요.', '이런 날은 캣타워 탐험이죠!', '냥이가 꼬리를 흔드는 이유는 뭘까요?'
  ]
};

const gradientColors = [
  '#4A6CF7', // 선명한 블루
  '#5F82FF',
  '#7A9AFF',
  '#A3B9FF',
  '#C9D6FF'  // 연한 블루
];


type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type LogEntry = {
  docId: string;
  date: string;
  text: string;
  image?: string;
  tags?: string[];
};

const getRecentDays = (): { date: string; day: string }[] => {
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return [...Array(5)].map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    return {
      date: d.toISOString().split('T')[0],
      day: days[d.getDay()],
    };
  });
};

const getEmotionType = (tags: string[]): keyof typeof emotionMessages => {
  if (tags.some((tag) => positiveTags.includes(tag))) return 'positive';
  if (tags.some((tag) => negativeTags.includes(tag))) return 'negative';
  if (tags.some((tag) => neutralTags.includes(tag))) return 'neutral';
  return 'neutral';
};

const getRandomMessage = (tags: string[]): string => {
  const emotion = getEmotionType(tags);
  const options = emotionMessages[emotion];
  return options[Math.floor(Math.random() * options.length)];
};

const History = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [emotionMap, setEmotionMap] = useState<Record<string, string>>({});

  const [editMode, setEditMode] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<LogEntry | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<LogEntry | null>(null);
  const [profileImage, setProfileImage] = useState('ch_1');

  const [openModal, setOpenModal] = useState<null | 'calendar' | 'chart'>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  
  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileImage(data.profileImage || 'ch_1');
      }
    };

    const fetchLogs = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('로그인이 필요해요!');
        return;
      }

      try {
        const q = query(
          collection(db, 'logs', user.uid, 'entries'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        const data: LogEntry[] = querySnapshot.docs.map((doc) => {
          const entry = doc.data();
          const date = doc.id;
          return {
            text: entry.text ?? '',
            image: entry.image ?? '',
            tags: entry.tags ?? [],
            date,
            docId: doc.id,
          };
        });
        
        setLogs(data);
        setActiveDates(data.map((d) => d.date));

        const handleClickOutside = (e: Event) => {
          if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            setOpenModal(null);
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

        const emotionMap: Record<string, string> = {};
        data.forEach((entry) => {
          const tags = entry.tags ?? [];
          const hasPositive = tags.some((tag) => positiveTags.includes(tag));
          const hasNegative = tags.some((tag) => negativeTags.includes(tag));
          const hasNeutral = tags.some((tag) => neutralTags.includes(tag));

          if (hasPositive) {
            emotionMap[entry.date] = '#FFD700';
          } else if (hasNegative) {
            emotionMap[entry.date] = '#87CEFA';
          } else if (hasNeutral) {
            emotionMap[entry.date] = '#9370DB';
          } else {
            emotionMap[entry.date] = '#3958bd';
          }
        });

        setEmotionMap(emotionMap);
      } catch (e) {
        console.error('데이터 불러오기 실패:', e);
        alert('불러오는 중 문제가 발생했어요.');
      }
    };
    fetchProfileImage();
    fetchLogs();
  }, []);
  
  const recordedDates = logs.map((log) => log.date);
  const recentDays = getRecentDays();

  const groupedLogs: Record<string, LogEntry[]> = logs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  const tagCountMap = logs
    .filter((log) => {
      const today = new Date();
      const logDate = new Date(log.date);
      return (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
    })
    .flatMap((log) => log.tags ?? [])
    .reduce<Record<string, number>>((acc, tag) => {
      const cleaned = tag.replace(/#/g, '');
      acc[cleaned] = (acc[cleaned] || 0) + 1;
      return acc;
    }, {});

  const tagChartData = Object.entries(tagCountMap)
    .reduce((unique, [name, count]) => {
      if (!unique.some((item) => item.name === name)) {
        unique.push({ name, count });
      }
      return unique;
    }, [] as { name: string; count: number }[])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const todayEmotionMessage = getRandomMessage(
    logs.find((log) => log.date === new Date().toISOString().split('T')[0])?.tags ?? []
  );

  const handleDateChange = (value: Value, event: MouseEvent<HTMLButtonElement>) => {
    const selected = Array.isArray(value) ? value[0] : value;
    if (selected instanceof Date) {
      const dateString = selected.toISOString().split('T')[0];
      setSelectedDate(dateString);
      setShowCalendar(false);
    }
  };

  const visibleLogs = selectedDate ? groupedLogs[selectedDate] || [] : logs;

  const handleEdit = (log: LogEntry) => {
    setEditTarget(log);
    setEditTags(log.tags ?? []);
    setEditText(log.text);
    setEditMode(true);
  };

  const handleDelete = (log: LogEntry) => {
    setDeleteTarget(log);
  };

  return (
    <div className="min-h-screen py-6 flex flex-col bg-[#5976D7]">
      <div className="w-full max-w-md mb-6 relative">
      <h2 className="text-xl font-apple_bigbold text-white text-center">혼냥일기 히스토리</h2>

      <button
        onClick={() =>
          setOpenModal((prev) => (prev === 'calendar' ? null : 'calendar'))
        }
        className="absolute right-8 top-1 text-white hover:text-[#dbe5ff] transition"
      >
        <CalendarDays className="w-6 h-6" />
      </button>

      <button
        onClick={() =>
          setOpenModal((prev) => (prev === 'chart' ? null : 'chart'))
        }
        className="absolute left-8 top-1 text-white hover:text-[#dbe5ff] transition"
      >
        <BarChartIcon className="w-6 h-6" />
      </button>

      {/* 모달들 */}
      <div className="flex flex-col items-center gap-6">
        <div ref={modalRef} className="absolute top-12 left-0 right-0 px-0 z-10">
          {openModal === 'calendar' && (
            <div className="mb-6 w-full flex justify-center">
              <div className="bg-white w-[90%] max-w-md rounded-xl p-4 shadow">
                <Calendar
                  onChange={handleDateChange}
                  tileContent={({ date, view }) => {
                    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const bgColor = emotionMap[dateString];

                    if (view === 'month') {
                      return (
                        <div className="flex justify-center items-center mt-1 relative">
                          {activeDates.includes(dateString) && (
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bgColor }} />
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                  calendarType="gregory"
                  className="w-full text-sm font-apple border-none shadow-none"
                  tileClassName="!border-none"
                />
              </div>
            </div>
          )}

          {openModal === 'chart' && (
            <div className="mb-6 w-full flex justify-center">
              <div className="bg-white w-[90%] max-w-md rounded-xl p-4 shadow">
                <h3 className="text-lg font-apple_bold text-gray-700 mb-4 text-center">최근 해시태그 차트</h3>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tagChartData}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#444', fontFamily: 'AppleSDGothicNeoB00' }}
                      tickFormatter={(v) => v.replace('#', '')}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) =>
                        active && payload && payload.length ? (
                          <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow font-apple text-sm text-gray-700">
                            <p><strong>{payload[0].payload.name.replace('#','')}</strong>: {payload[0].value}회</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {tagChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={gradientColors[index % gradientColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* ✨ 감정 문장 + 캐릭터 말풍선 */}
          <div className="w-full flex flex-col items-center justify-center gap-3 px-2 mt-6 mb-6">
            <div className="relative w-full h-70 overflow-hidden flex flex-col justify-end items-center">
              
              {/* 구름 배경 */}
              <div
                className="absolute inset-0 bg-repeat-x bg-bottom animate-cloud"
                style={{
                  backgroundImage: "url('/img/cloud-bg.png')",
                  backgroundSize: 'cover',
                  opacity: 0.4,
                  zIndex: 0
                }}
              ></div>

              {/* 말풍선 */}
              <div className="relative z-10 mb-3 flex justify-center w-full">
                <div className="bg-[#f4f6ff] text-[#3958bd] text-sm rounded-2xl px-6 py-4 font-apple_bold shadow leading-relaxed max-w-[80%] text-center">
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-12px] w-0 h-0 border-t-[12px] border-t-[#f4f6ff] border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent"></span>
                  <span className="text-[18px]">“</span>{todayEmotionMessage}<span className="text-[18px]">”</span>
                </div>
              </div>

              {/* 캐릭터 이미지 */}
              <div className="relative z-10 flex justify-center items-end h-full">
                <img
                  src={characterImages[profileImage]}
                  alt="고양이 캐릭터"
                  className="w-48 object-contain"
                />
              </div>
            </div>
          </div>
          <div className="w-full bg-white rounded-t-3xl shadow-top px-6 py-7 flex-1 flex flex-col space-y-2">

            {/* ✨ 스탬프 UI */}
            <div className="flex justify-between w-full px-4">
                {recentDays.map(({ date, day }) => {
                  const isChecked = recordedDates.includes(date);
                  return (
                    <div key={date} className="flex flex-col items-center">
                      <span className="text-[14px] font-medium text-gray-500 mb-2">{day}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition duration-200
                        ${isChecked ? 'bg-white border-[#3958bd] text-[#3958bd]' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                        {isChecked && <Check className="w-4 h-4" strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })}
            </div>  

            <div className="w-full max-w-md text-sm text-gray-600 font-apple mb-4 text-center">
              {selectedDate && <p>선택된 날짜: <span className="text-[#3958bd] font-apple_bold">{selectedDate}</span></p>}
            </div>

            <div className="w-full max-w-md">
              {visibleLogs.length === 0 ? (
                <p className="text-gray-500 font-apple text-center">기록이 아직 없어요 😿</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {visibleLogs.map((log, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-4 relative group">
                      {log.image && log.image !== '' && (
                        <div className="w-full aspect-square overflow-hidden rounded-xl mb-3">
                          <img src={log.image} alt={`냥이사진 ${i}`} className="object-cover w-full h-full" />
                        </div>
                      )}

                      {log.tags && log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2 text-xs text-[#3958bd] font-apple">
                          {log.tags.map((tag, j) => <span key={j}>#{tag.replace('#', '')}</span>)}
                        </div>
                      )}

                      <p className="text-gray-700 whitespace-pre-line font-apple_bold text-sm mb-1">{log.text}</p>
                      <p className="text-xs text-gray-400 font-apple">{log.date}</p>

                      <div className="absolute bottom-2 right-2 flex gap-2 opacity-60 group-hover:opacity-100 transition">
                        <button onClick={() => handleEdit(log)}>
                          <Pencil className="w-4 h-4 text-gray-500 hover:text-[#3958bd]" />
                        </button>
                        <button onClick={() => handleDelete(log)}>
                          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 수정 모달 */}
            {editMode && editTarget && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
                  <h3 className="text-lg font-apple_bold text-gray-700 mb-4 text-center">내용 & 해시태그 수정</h3>

                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="수정할 내용을 입력해주세요"
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm font-apple mb-4 focus:outline-none focus:ring-2 focus:ring-[#3958bd]"
                    rows={3}
                  />

                  <div className="flex flex-wrap gap-2 mb-6">
                  {defaultTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setEditTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev.filter((t) => defaultTags.includes(t)), tag]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-apple border transition ${
                        editTags.includes(tag)
                          ? 'bg-[#3958bd] text-white'
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="text-sm px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-apple" onClick={() => {
                      setEditMode(false);
                      setEditTarget(null);
                      setEditTags([]);
                      setEditText('');
                    }}>취소</button>
                    <button className="text-sm px-4 py-2 rounded-lg bg-[#3958bd] text-white font-apple_bold" onClick={async () => {
                      const user = auth.currentUser;
                      if (!user || !editTarget) return;
                      const logRef = doc(db, 'logs', user.uid, 'entries', editTarget.docId);
                      try {
                        await updateDoc(logRef, {
                          text: editText,
                          tags: editTags,
                        });
                        setLogs((prev) =>
                          prev.map((entry) =>
                            entry.docId === editTarget.docId
                              ? { ...entry, text: editText, tags: editTags }
                              : entry
                          )
                        );
                        alert('수정 완료!');
                      } catch (e) {
                        console.error('수정 실패:', e);
                        alert('수정 중 오류 발생');
                      } finally {
                        setEditMode(false);
                        setEditTarget(null);
                        setEditTags([]);
                        setEditText('');
                      }
                    }}>확인</button>
                  </div>
                </div>
              </div>
            )}

            {/* 삭제 모달 */}
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
                        setLogs((prev) => prev.filter((entry) => entry.docId !== deleteTarget.docId));
                        alert('삭제 완료!');
                      } catch (e) {
                        console.error('삭제 실패:', e);
                        alert('삭제 중 오류 발생');
                      } finally {
                        setDeleteTarget(null);
                      }
                    }}>
                      삭제하기
                    </button>
                  </div>
                </div>
              </div>
            )}    
          </div>  
        </div>
      </div>
    </div>


    
    </div>
  );
};

export default History;


