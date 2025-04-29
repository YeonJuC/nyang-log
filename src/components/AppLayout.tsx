import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { useSelectedCat } from '../utils/SelectedCatContext'; // ✅ context에서 다 가져오기
import ScrollToTop from './ScrollToTop';

import homeDefault from '../img/홈.png';
import homeActive from '../img/홈_변경.png';
import writeDefault from '../img/기록.png';
import writeActive from '../img/기록_변경.png';
import historyDefault from '../img/히스토리.png';
import historyActive from '../img/히스토리_변경.png';
import mypageDefault from '../img/마이페이지.png';
import mypageActive from '../img/마이페이지_변경.png';
import diaryDefault from '../img/일기.png';  
import diaryActive from '../img/일기_변경.png'; 

import logoIcon from '../img/icon-192x192.png';
import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

const characterImages: Record<string, string> = { ch_1, ch_2, ch_3, ch_4, ch_5, ch_6 };

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const {
    selectedCat,
    setSelectedCat,
    profile,
    setProfile,
    cats,
    setCats,
    selectedCatId,
    setSelectedCatId,
    refreshProfileAndCats,
  } = useSelectedCat(); // ✅ context로부터 전부 가져오기

  const [open, setOpen] = useState(false);

  useEffect(() => {
    refreshProfileAndCats(); // 앱 처음 켤 때 고양이 리스트 불러오기
  }, []);

  return (
    <div className="w-screen min-h-screen">
      <ScrollToTop />

      {/* 상단 */}
      <header className="w-full bg-white shadow-sm shadow-gray-200 flex flex-col px-4 pt-2 pb-3 relative z-50">
        <div className="relative w-full h-16 flex items-center">
          <button onClick={() => setOpen(!open)} className="absolute left-0 top-1/2 -translate-y-1/2">
            <Menu className="w-6 h-6 text-[#3958bd]" />
          </button>
          <Link to="/" onClick={() => setOpen(false)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img src={logoIcon} alt="혼냥일기 로고" className="w-8 h-8" />
          </Link>
        </div>

        {/* 프로필 선택줄 */}
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide mt-2">
          {profile && (
            <button
              onClick={() => {
                setSelectedCatId('profile');
                setSelectedCat({
                  id: 'profile',
                  nickname: profile.nickname,
                  age: profile.age,
                  species: profile.species,
                  profileImage: profile.profileImage,
                });
              }}
              className="flex flex-col items-center flex-shrink-0"
            >
              <div className={`p-1 rounded-full bg-white border-2`} style={{
                borderColor: selectedCatId === 'profile' ? '#3958bd' : '#d1d5db'
              }}>
                <img src={characterImages[profile.profileImage]} alt="프로필" className="w-14 h-14 object-cover rounded-full" />
              </div>
              <div className="mt-1 text-xs font-semibold" style={{ color: selectedCatId === 'profile' ? '#3958bd' : '#6b7280' }}>
                {profile.nickname}
              </div>
            </button>
          )}

          {cats.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCatId(cat.id);
                setSelectedCat({
                  id: cat.id,
                  nickname: cat.nickname ?? '',
                  age: cat.age ?? '',
                  species: cat.species ?? '',
                  profileImage: cat.profileImage ?? 'ch_1',
                });
              }}
              className="flex flex-col items-center flex-shrink-0"
            >
              <div className={`p-1 rounded-full bg-white border-2`} style={{
                borderColor: selectedCatId === cat.id ? '#3958bd' : '#d1d5db'
              }}>
                <img src={characterImages[cat.profileImage]} alt={cat.nickname} className="w-14 h-14 object-cover rounded-full" />
              </div>
              <div className="mt-1 text-xs font-semibold" style={{ color: selectedCatId === cat.id ? '#3958bd' : '#6b7280' }}>
                {cat.nickname}
              </div>
            </button>
          ))}

          {/* 추가 버튼 */}
          <Link to="/add-cat" className="flex flex-col items-center flex-shrink-0 p-2 rounded-full border-2 border-dashed border-gray-300">
            <div className="w-12 h-12 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-xs mt-1 text-gray-400 font-semibold">추가</div>
          </Link>
        </div>

        {/* 햄버거 메뉴 */}
        {open && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-10" onClick={() => setOpen(false)} />
            <div className="absolute top-[35%] left-5 w-40 bg-white shadow-lg rounded-xl p-2 z-20 flex flex-col space-y-1">
              <Link to="/home" onClick={() => setOpen(false)} className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]">홈</Link>
              <Link to="/write" onClick={() => setOpen(false)} className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]">기록하기</Link>
              <Link to="/history" onClick={() => setOpen(false)} className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]">히스토리</Link>
              <Link to="/mypage" onClick={() => setOpen(false)} className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]">마이페이지</Link>
            </div>
          </>
        )}
      </header>

      {/* 메인 */}
      <main className="relative z-0 flex-1 w-full">{children}</main>

      {/* 하단 내비 */}
      <nav className="w-full fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-40">
        <div className="max-w-md mx-auto flex justify-around py-2 text-sm font-bold mt-2">
          <Link to="/home" className="flex flex-col items-center">
            <img src={location.pathname === '/home' ? homeActive : homeDefault} alt="홈" className="w-6 h-6" />
            <span className={location.pathname === '/home' ? 'text-[#3958bd]' : 'text-gray-600'}>홈</span>
          </Link>
          <Link to="/diary" className="flex flex-col items-center"> 
            <img src={location.pathname === '/diary' ? diaryActive : diaryDefault} alt="일기" className="w-6 h-6" />
            <span className={location.pathname === '/diary' ? 'text-[#3958bd]' : 'text-gray-600'}>일기</span>
          </Link>
          <Link to="/write" className="flex flex-col items-center">
            <img src={location.pathname === '/write' ? writeActive : writeDefault} alt="기록" className="w-6 h-6" />
            <span className={location.pathname === '/write' ? 'text-[#3958bd]' : 'text-gray-600'}>기록</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center">
            <img src={location.pathname === '/history' ? historyActive : historyDefault} alt="히스토리" className="w-6 h-6" />
            <span className={location.pathname === '/history' ? 'text-[#3958bd]' : 'text-gray-600'}>히스토리</span>
          </Link>
          <Link to="/mypage" className="flex flex-col items-center">
            <img src={location.pathname === '/mypage' ? mypageActive : mypageDefault} alt="마이페이지" className="w-6 h-6" />
            <span className={location.pathname === '/mypage' ? 'text-[#3958bd]' : 'text-gray-600'}>마이페이지</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
