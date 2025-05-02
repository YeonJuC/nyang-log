import { useEffect, useState, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { BarChart as BarChartIcon, CalendarDays, Pencil, Trash2, Check  } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSelectedCat } from '../utils/SelectedCatContext';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const characterImages = { ch_1, ch_2, ch_3, ch_4, ch_5, ch_6 };
const defaultTags = ['행복', '슬픔', '분노', '기쁨', '불안', '놀람', '사랑', '지루함', '궁금', '심심'];
const gradientColors = ['#4A6CF7', '#597DF8', '#7B98FB', '#A7BCFF', '#C9D6FF'];

const emotionMessages: Record<string, string[]> = {
  행복: [
    "오늘은 기분 좋은 일이 가득했어요!",
    "행복 가득한 하루였군요!",
    "웃음이 멈추지 않는 날이었어요!",
    "좋은 에너지가 넘쳤어요!",
    "세상이 다 예뻐 보였어요!",
    "웃을 일이 많았던 하루네요!",
    "마음이 포근했어요!",
    "사소한 것도 행복했어요!",
    "기분이 아주 맑았어요!",
    "오늘은 정말 최고였어요!",
  ],
  슬픔: [
    "조금 울적한 하루였네요.",
    "마음이 무거웠던 하루였어요.",
    "조용히 위로가 필요한 날이에요.",
    "마음이 가라앉는 하루였어요.",
    "조금 눈물이 났던 날이에요.",
    "괜찮아요, 내일은 더 나아질 거예요.",
    "마음이 서글펐어요.",
    "조금은 힘들었던 하루였어요.",
    "위로가 필요한 순간이었어요.",
    "혼자 있고 싶었던 날이에요.",
  ],
  분노: [
    "조금 화가 나는 일이 있었군요!",
    "참기 힘든 순간이 있었어요!",
    "마음이 들끓었던 하루였어요.",
    "짜증이 났던 하루였네요.",
    "억울한 마음이 들었어요.",
    "화를 삭이느라 애썼어요.",
    "속상함을 느꼈던 하루에요.",
    "불편한 마음이 들었어요.",
    "꾹 참은 순간들이 있었어요.",
    "마음이 거칠었던 하루였어요.",
  ],
  기쁨: [
    "마음이 들떴던 하루였어요!",
    "기쁜 소식이 있었나요?",
    "웃음이 절로 났던 하루!",
    "마음이 한없이 가벼웠어요!",
    "좋은 기운이 넘쳤어요!",
    "행복한 일이 많았네요!",
    "신나는 일이 있었어요!",
    "기분 좋은 하루였어요!",
    "밝은 에너지가 가득했어요!",
    "즐거운 하루를 보냈어요!",
  ],
  불안: [
    "조금 긴장되는 하루였어요.",
    "마음이 조마조마했어요.",
    "불안감이 느껴졌던 하루였어요.",
    "조심스러운 하루였어요.",
    "마음이 불편했던 날이네요.",
    "걱정이 많았던 하루에요.",
    "초조한 기분이 들었어요.",
    "안절부절 못했던 순간이 있었어요.",
    "마음 한구석이 무거웠어요.",
    "조금은 불안정했던 하루였어요.",
  ],
  놀람: [
    "깜짝 놀랄 일이 있었나요?",
    "예상치 못한 순간이 있었어요!",
    "놀라운 하루였네요!",
    "뜻밖의 일이 있었어요!",
    "당황스러운 순간이 있었군요!",
    "놀라고 웃었던 하루였어요!",
    "놀라운 소식을 들었어요!",
    "서프라이즈 가득했던 하루!",
    "심장이 쿵쾅거렸던 순간!",
    "예측할 수 없는 하루였어요!",
  ],
  사랑: [
    "따뜻한 마음을 느낀 하루였어요.",
    "사랑이 넘치는 하루였어요!",
    "소중한 사람을 생각했어요.",
    "마음이 몽글몽글했어요.",
    "애정이 가득했던 하루였어요!",
    "따뜻한 감정이 샘솟았어요.",
    "사랑스러운 하루였어요.",
    "마음을 나눈 순간이 있었어요.",
    "설레는 마음이 있었어요!",
    "감사한 마음이 들었던 하루에요.",
  ],
  지루함: [
    "조금 심심했던 하루였어요.",
    "시간이 느리게 갔던 하루네요.",
    "무료한 하루였어요.",
    "특별한 일 없이 지나갔어요.",
    "지루해서 하품했던 하루!",
    "무기력했던 하루였어요.",
    "할 일이 없어 답답했어요.",
    "심심해서 멍때린 시간도 있었어요.",
    "조용히 지나간 하루였어요.",
    "나른했던 하루였어요.",
  ],
  궁금: [
    "새로운 것을 궁금해했던 하루!",
    "알고 싶은 게 많았던 하루에요!",
    "호기심이 가득한 하루였어요!",
    "마음이 궁금증으로 가득했어요.",
    "배우고 싶은 게 많았어요!",
    "질문이 많았던 하루!",
    "탐구심 넘치는 하루였어요!",
    "신기한 걸 많이 본 하루!",
    "알고 싶어 손이 근질거렸어요!",
    "머릿속에 물음표가 가득했어요!",
  ],
};

const History = () => {
  const { selectedCat } = useSelectedCat();
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState<'calendar' | 'chart' | null>(null);
  const [emotionMap, setEmotionMap] = useState<Record<string, string>>({});
  const [activeDates, setActiveDates] = useState<string[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [todayEmotionMessage, setTodayEmotionMessage] = useState('오늘 하루도 고생했어요');

  useEffect(() => {
    if (logs.length > 0) {
      const recentTags = logs
        .filter(log => log.tags?.length > 0)
        .slice(0, 5)
        .flatMap(log => log.tags);
  
      const lastTag = recentTags.find(tag => emotionMessages[tag]);
      if (lastTag) {
        const messages = emotionMessages[lastTag];
        const randomIndex = Math.floor(Math.random() * messages.length);
        setTodayEmotionMessage(messages[randomIndex]);
      } else {
        setTodayEmotionMessage('오늘 하루도 고생했어요!');
      }
    }
  }, [logs]);

  useEffect(() => {
    const fetch = async () => {
      const user = auth.currentUser;
      if (!user || !selectedCat) return;

      const q = query(collection(db, 'logs', user.uid, 'entries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      const fetched = snap.docs.map((doc) => {
        const data = doc.data();
        const createdDate = typeof data.createdDate === 'string'
          ? data.createdDate
          : data.createdDate?.toDate?.()
            ? new Date(data.createdDate.toDate().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
            : doc.id;

        return {
          docId: doc.id,
          text: data.text ?? '',
          tags: data.tags ?? [],
          image: data.image ?? '',
          createdDate,
          catId: data.catId ?? null,
        };
      }).filter(log => log.catId === selectedCat.id);

      setLogs(fetched);

      const unsortedMap: Record<string, string> = {};
      fetched.forEach((entry) => {
        const tags = entry.tags || [];
        if (tags.includes('행복')) unsortedMap[entry.createdDate] = '#FFD700';
        else if (tags.includes('슬픔')) unsortedMap[entry.createdDate] = '#87CEFA';
        else unsortedMap[entry.createdDate] = '#3958bd';
      });
      setEmotionMap(unsortedMap);

      const uniqueDates = [...new Set(fetched.map((entry) => entry.createdDate))].sort();
      setActiveDates(uniqueDates);
    };

    fetch();
  }, [selectedCat]);

  const handleDateChange = (value: any) => {
    if (!value) return;
    const selected = Array.isArray(value) ? value[0] : value;
    if (!selected || !(selected instanceof Date)) return;
  
    // ✅ 기존 코드 (UTC): const dateStr = selected.toISOString().split('T')[0];
    // ✅ 수정된 코드 (KST)
    const kstDate = new Date(selected.getTime() + 9 * 60 * 60 * 1000);
    const dateStr = kstDate.toISOString().split('T')[0];
  
    setSelectedDate(dateStr);
    setShowModal(null);
  };
  

  const visibleLogs = selectedDate
    ? logs.filter((log) => {
        const logDate = new Date(log.createdDate);
        const kstDateStr = new Date(logDate.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
        return kstDateStr === selectedDate;
      })
    : logs;

  const handleEditClick = (log: any) => {
    setEditTarget(log);
    setEditText(log.text);
    setEditTags(log.tags || []);
    setEditMode(true);
  };

  const recentDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i)); // 오늘 포함 최근 5일
    const kstDate = new Date(d.getTime() + 9 * 60 * 60 * 1000); // KST 보정
    return {
      date: kstDate.toISOString().split('T')[0],
      day: kstDate.toLocaleDateString('ko-KR', { weekday: 'short' }), // 예: 월, 화
    };
  });  

  const recordedDates = logs
  .filter(log => log.text?.trim() !== '')
  .map(log => log.createdDate); // ✅ 고쳐야 하는 부분: log.date ❌ → log.createdDate ✅

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user || !editTarget) return;
    const logRef = doc(db, 'logs', user.uid, 'entries', editTarget.docId);
    await updateDoc(logRef, {
      text: editText,
      tags: editTags,
    });
    setLogs((prev) =>
      prev.map((log) =>
        log.docId === editTarget.docId ? { ...log, text: editText, tags: editTags } : log
      )
    );
    setEditMode(false);
    setEditTarget(null);
  };

  const handleDeleteConfirm = async () => {
    const user = auth.currentUser;
    if (!user || !deleteTarget) return;
    const logRef = doc(db, 'logs', user.uid, 'entries', deleteTarget.docId);
    await deleteDoc(logRef);
    setLogs((prev) => prev.filter((log) => log.docId !== deleteTarget.docId));
    setDeleteTarget(null);
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

      {/* 구름 배경 + 감성 말풍선 */}
      <div className="relative w-full flex flex-col justify-end items-center mb-8 h-60">
        <div className="absolute inset-0 bg-repeat-x bg-bottom animate-cloud"
             style={{ backgroundImage: "url('/img/cloud-bg.png')", backgroundSize: 'cover', opacity: 0.4 }} />
        <div className="relative z-10 bg-[#f4f6ff] text-[#3958bd] rounded-2xl px-6 py-4 font-apple_bold shadow text-center max-w-[80%]">
          <span className="text-[18px]">“</span>{todayEmotionMessage}<span className="text-[18px]">”</span>
        </div>
        {selectedCat && (
          <img src={characterImages[selectedCat.profileImage as keyof typeof characterImages]} alt="고양이" className="relative z-10 w-32 mt-4" />
        )}
      </div>

      {/* 차트 모달 */}
      {showModal === 'chart' && (
          <div className="bg-white text-black rounded-xl p-4 w-[90%] max-w-md mx-auto mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(visibleLogs.reduce((acc: any, log: any) => {
                (log.tags || []).forEach((tag: string) => {
                  acc[tag] = (acc[tag] || 0) + 1;
                });
                return acc;
              }, {})).map(([name, count]) => ({ name, count }))}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {gradientColors.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 캘린더 모달 */}
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

      <div className="bg-white text-black rounded-t-3xl px-4 py-6 mb-[90px] min-h-[calc(100vh-220px)]">
        {/* ✅ 최근 5일치 기록 여부 스탬프 UI */}
        <div className="bg-white text-black px-4 pt-1 mb-4">
          <div className="flex justify-between w-full">
            {recentDays.map(({ date, day }) => {
              const isChecked = recordedDates.includes(date); // ⭐ 기록된 날짜면 체크 표시!
              return (
                <div key={date} className="flex flex-col items-center">
                  <span className="text-[13px] font-medium text-gray-500 mb-1">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition duration-200
                    ${isChecked
                      ? 'bg-white border-[#3958bd] text-[#3958bd]'
                      : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                    {isChecked && <Check className="w-4 h-4" strokeWidth={4} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* 일기 리스트 */}
        {visibleLogs.length === 0 ? (
          <p className="text-center text-sm">기록이 없습니다 😿</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visibleLogs.map((log, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 relative group hover:scale-105 transition">
                {log.image && (
                  <div className="aspect-square mb-2 overflow-hidden rounded-xl">
                    <img src={log.image} alt={`log-${i}`} className="w-full h-full object-cover" />
                  </div>
                )}
                {/* 🐾 추가: 날짜 표시 */}
                <p className="text-xs text-gray-400 mb-1">{log.createdDate}</p>
                <p className="text-sm font-semibold mb-1 whitespace-pre-line">{log.text}</p>
                {log.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 w-full break-words">
                    {log.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#f4f6ff] text-[#3958bd] text-[11px] rounded-full font-apple_bold 
                                  transition-all duration-300 ease-in-out hover:bg-[#d5defc] hover:text-[#2c3e94]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditClick(log)}>
                    <Pencil className="w-5 h-5 text-gray-500 hover:text-[#3958bd]" />
                  </button>
                  <button onClick={() => setDeleteTarget(log)}>
                    <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-black">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm"
              rows={3}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {defaultTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setEditTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                  className={`px-3 py-1 rounded-full text-xs border transition ${editTags.includes(tag) ? 'bg-[#3958bd] text-white border-[#3958bd]' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setEditMode(false); setEditTarget(null); }} className="text-sm px-4 py-2 bg-gray-200 rounded-full">취소</button>
              <button onClick={handleUpdate} className="text-sm px-4 py-2 bg-[#3958bd] text-white rounded-full">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-black">
            <p className="mb-4">정말 삭제할까요?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-gray-200 rounded-full">취소</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded-full">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
function setTodayEmotionMessage(arg0: string) {
  throw new Error('Function not implemented.');
}

