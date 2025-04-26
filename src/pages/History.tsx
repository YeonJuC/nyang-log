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

const History = () => {
  const { selectedCat } = useSelectedCat();
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState<'calendar' | 'chart' | null>(null);
  const [emotionMap, setEmotionMap] = useState<Record<string, string>>({});
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [todayEmotionMessage, setTodayEmotionMessage] = useState('오늘 하루도 고생했어요!');

  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

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
          : (data.createdDate?.toDate?.().toISOString().split('T')[0] || doc.id);

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

    const dateStr = selected.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowModal(null);
  };

  const visibleLogs = selectedDate ? logs.filter((log) => log.createdDate === selectedDate) : logs;

  const handleEditClick = (log: any) => {
    setEditTarget(log);
    setEditText(log.text);
    setEditTags(log.tags || []);
    setEditMode(true);
  };

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

      <div className="bg-white text-black rounded-t-3xl px-4 py-6 min-h-[calc(100vh-220px)]">
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
                <p className="text-sm font-semibold mb-1 whitespace-pre-line">{log.text}</p>
                {log.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 text-xs text-[#3958bd] font-apple">
                    {log.tags.map((tag: string, idx: number) => (
                      <span key={idx}>#{tag}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm">
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
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
