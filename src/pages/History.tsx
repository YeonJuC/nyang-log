// 전체 파일 구성: History.tsx

import { useEffect, useState, useRef, Key } from 'react';
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

const characterImages: Record<string, string> = { ch_1, ch_2, ch_3, ch_4, ch_5, ch_6 };

const History = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState<'calendar' | 'chart' | null>(null);
  const [emotionMap, setEmotionMap] = useState<Record<string, string>>({});
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState('ch_1');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEmotionMessage = '오늘 하루도 고생했어요!';

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

      type LogEntry = {
        docId: string;
        date: string;
        text: string;
        image?: string;
        tags?: string[];
      };
      
      const today = new Date();
      const fetched = snap.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() ?? new Date(doc.id);  // fallback
      
        const formattedDate = createdAt.toISOString().split('T')[0];
      
        return {
          date: formattedDate,
          docId: doc.id,
          text: data.text ?? '',
          image: data.image ?? '',
          tags: data.tags ?? [],
        };
      });
      
      
      const filtered = fetched.filter(entry => {
        const entryDate = new Date(entry.date);
        return !isNaN(entryDate.getTime()) && entryDate <= today;
      });

      setLogs(filtered);
      setActiveDates(filtered.map(entry => entry.date));

      const map: Record<string, string> = {};
      filtered.forEach(entry => {
        const tags = entry.tags || [];
        if (tags.includes('행복')) map[entry.date] = '#FFD700';
        else if (tags.includes('슬픔')) map[entry.date] = '#87CEFA';
        else map[entry.date] = '#3958bd';
      });
      setEmotionMap(map);
    };
    
    fetch();
  }, []);

  const handleDateChange = (value: any) => {
    const date = Array.isArray(value) ? value[0] : value;
    const stringDate = date.toISOString().split('T')[0];
    if (date > today) return alert('미래 날짜는 선택할 수 없어요!');
    setSelectedDate(stringDate);
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
              onChange={handleDateChange}
              tileContent={({ date, view }) => {
                const dateStr = date.toISOString().split('T')[0];
                const isFuture = date > new Date();
                const isMarked = view === 'month' && !isFuture && activeDates.includes(dateStr);
              
                return (
                  <div className="mt-1 flex justify-center items-center h-[6px]">
                    {isMarked && (
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: emotionMap[dateStr] }}
                      />
                    )}
                  </div>
                );
              }}                         
            />
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

      <div className="bg-white text-black rounded-t-3xl px-4 py-6">
        {visibleLogs.length === 0 ? (
          <p className="text-center text-sm">기록이 없습니다 😿</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {visibleLogs.map((log, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4">
                {log.image && (
                  <div className="aspect-square mb-2 overflow-hidden rounded-xl">
                    <img src={log.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {/* ✅ 해시태그 출력 */}
                {log.tags && log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2 text-xs text-[#3958bd] font-apple">
                    {log.tags.map((tag: string, j: Key | null | undefined) => (
                      <span key={j}>#{tag.replace('#', '')}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm font-semibold mb-1 whitespace-pre-line">{log.text}</p>
                <p className="text-xs text-gray-500">{log.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
