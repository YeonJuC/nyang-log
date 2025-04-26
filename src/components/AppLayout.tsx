import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

import homeDefault from '../img/홈.png';
import homeActive from '../img/홈_변경.png';
import writeDefault from '../img/기록.png';
import writeActive from '../img/기록_변경.png';
import historyDefault from '../img/히스토리.png';
import historyActive from '../img/히스토리_변경.png';
import mypageDefault from '../img/마이페이지.png';
import mypageActive from '../img/마이페이지_변경.png';
import ScrollToTop from './ScrollToTop';
import logoIcon from '../img/icon-192x192.png';
import { useSelectedCat } from '../utils/SelectedCatContext';

import ch_1 from '../img/ch_1.png';
import ch_2 from '../img/ch_2.png';
import ch_3 from '../img/ch_3.png';
import ch_4 from '../img/ch_4.png';
import ch_5 from '../img/ch_5.png';
import ch_6 from '../img/ch_6.png';

interface LayoutProps {
  children: React.ReactNode;
}

interface CatProfile {
  profileImage: any;
  name: string;
  nickname: string;
  age: string;
  species: string;
}


const characterImages: Record<string, string> = {
  ch_1,
  ch_2,
  ch_3,
  ch_4,
  ch_5,
  ch_6,
};

interface Cat {
  id: string;
  name: string;
  profileImage: keyof typeof characterImages;
}

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const { selectedCat, setSelectedCat } = useSelectedCat();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as CatProfile);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const catsRef = collection(db, 'users', currentUser.uid, 'cats');
      const snapshot = await getDocs(catsRef);
      const catList: Cat[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Cat, 'id'>),
      }));
      setCats(catList);

      // 고양이들 불러온 후
      if (catList.length > 0) {
        setSelectedCatId('profile'); // ✅ 기본 profile 먼저 선택되게
      }
    };

    fetchCats();
  }, []);

  return (
    <div className="w-screen min-h-screen">
      {/* 상단 상태바 흰 배경 추가 */}
      <div
        className="fixed top-0 left-0 w-full z-50"
        style={{
          backgroundColor: 'white', // 흰색 배경
          height: 'env(safe-area-inset-top, 24px)', // 상태바의 높이 조정 (안전 영역 포함)
        }}
      />
      <ScrollToTop />
      <div className="fixed top-0 left-0 w-full bg-white z-50" style={{ height: 'env(safe-area-inset-top, 24px)' }} />
      {/* ✅ 상태바 흰 배경 */}
      <div
        className="fixed top-0 left-0 w-full bg-white z-50"
        style={{ height: 'env(safe-area-inset-top, 24px)' }}
      />

      <header className="w-full bg-white shadow-sm shadow-gray-200 z-50 flex flex-col px-4 pt-[env(safe-area-inset-top,24px)] pb-3 relative">

        {/* ☰ 햄버거 + 🐾 중앙 로고 줄 */}
        <div className="relative w-full h-16 flex items-center">
          {/* 햄버거 왼쪽 */}
          <button
            onClick={() => setOpen(!open)}
            className="absolute left-0 top-1/2 -translate-y-1/2"
          >
            <Menu className="w-6 h-6 text-[#3958bd]" />
          </button>

          {/* 로고 중앙 */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <img src={logoIcon} alt="혼냥일기 로고" className="w-8 h-8" />
          </Link>
        </div>

        {/* 🐱 고양이 프로필 줄 */}
        <div className="w-full mt-2">
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
            {profile && (
              <button
                onClick={() => {
                  setSelectedCatId('profile');
                  setSelectedCat({
                    id: 'profile',
                    name: profile?.nickname || '',
                    profileImage: profile?.profileImage || 'ch_1',
                    nickname: ''
                  });
                }}
                className="flex flex-col items-center flex-shrink-0 transition-all duration-200"
              >
                <div className={`p-1 rounded-full bg-white ${
                  selectedCatId === 'profile' ? 'border-2' : 'border-2'
                }`} style={{
                  borderColor: selectedCatId === 'profile' ? '#3958bd' : '#d1d5db' // 회색(gray-300) 대체
                }}>
                  <img
                    src={characterImages[profile.profileImage]}
                    alt={profile.nickname}
                    className="w-14 h-14 object-cover rounded-full"
                  />
                </div>
                <div
                  className={`mt-1 text-xs font-semibold`}
                  style={{
                    color: selectedCatId === 'profile' ? '#3958bd' : '#6b7280' // 회색(gray-500) 대체
                  }}
                >
                  {profile.nickname}
                </div>
              </button>
            )}

            {cats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCatId(cat.id);
                  setSelectedCat({
                    id: cat.id,
                    name: cat.name,
                    profileImage: cat.profileImage,
                    nickname: ''
                  });
                }}
                className="flex flex-col items-center flex-shrink-0"
              >
                <div className={`p-1 rounded-full bg-white border-2`} style={{
                  borderColor: selectedCatId === cat.id ? '#3958bd' : '#d1d5db' // 선택되면 #3958bd, 아니면 회색
                }}>
                  <img
                    src={characterImages[cat.profileImage]}
                    alt={cat.name}
                    className="w-14 h-14 object-cover rounded-full"
                  />
                </div>
                <div
                  className="mt-1 text-xs font-semibold"
                  style={{
                    color: selectedCatId === cat.id ? '#3958bd' : '#6b7280' // 선택되면 #3958bd, 아니면 회색
                  }}
                >
                  {cat.name}
                </div>
              </button>
            ))}
            {/* ➕ 프로필 추가 버튼 */}
            <Link
              to="/add-cat" // ➡️ 고양이 추가하는 페이지로 이동
              className="flex flex-col items-center flex-shrink-0 p-2 rounded-full border-2 border-dashed border-gray-300"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-xs mt-1 text-gray-400 font-semibold">추가</div>
            </Link>
          </div>
          
            {open && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-10" onClick={() => setOpen(false)}></div>
                <div className="absolute"
                  style={{
                    top: '35%',   // 햄버거 버튼 기준 살짝 아래
                    left: '20px', // 햄버거 버튼 기준 살짝 오른쪽
                    transform: 'translate(0, 0)', // 따로 중앙정렬 안함
                    width: '160px',
                    backgroundColor: 'white',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    gap: '4px',
                  }}
                >
                <div className="w-full py-1">
                  <Link to="/" className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]" onClick={() => setOpen(false)}>홈</Link>
                </div>
                <div className="w-full py-1">
                  <Link to="/write" className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]" onClick={() => setOpen(false)}>기록하기</Link>
                </div>
                <div className="w-full py-1">
                  <Link to="/history" className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]" onClick={() => setOpen(false)}>히스토리</Link>
                </div>
                <div className="w-full py-1">
                  <Link to="/mypage" className="block px-2 py-1 text-gray-700 hover:text-[#3958bd]" onClick={() => setOpen(false)}>마이페이지</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </header>


      <main
        className="relative z-0 flex-1 w-full"
        style={{ padding: '0px', margin: '0px', maxWidth: '100%' }}
      >
        {children}
      </main>

      {/* 하단 네비게이션 바 */}
      <nav className="w-full fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-40">
        <div className="max-w-md mx-auto flex justify-around py-2 text-sm font-bold mt-2">
          <Link to="/home" className="flex flex-col items-center">
            <img
              src={location.pathname === '/home' ? homeActive : homeDefault}
              alt="홈"
              className="w-6 h-6"
            />
            <span className={location.pathname === '/home' ? 'text-[#3958bd]' : 'text-gray-600'}>
              홈
            </span>
          </Link>

          <Link to="/write" className="flex flex-col items-center">
            <img
              src={location.pathname === '/write' ? writeActive : writeDefault}
              alt="기록"
              className="w-6 h-6"
            />
            <span className={location.pathname === '/write' ? 'text-[#3958bd]' : 'text-gray-600'}>
              기록
            </span>
          </Link>

          <Link to="/history" className="flex flex-col items-center">
            <img
              src={location.pathname === '/history' ? historyActive : historyDefault}
              alt="히스토리"
              className="w-6 h-6"
            />
            <span className={location.pathname === '/history' ? 'text-[#3958bd]' : 'text-gray-600'}>
              히스토리
            </span>
          </Link>

          <Link to="/mypage" className="flex flex-col items-center">
            <img
              src={location.pathname === '/mypage' ? mypageActive : mypageDefault}
              alt="마이페이지"
              className="w-6 h-6"
            />
            <span className={location.pathname === '/mypage' ? 'text-[#3958bd]' : 'text-gray-600'}>
              마이페이지
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;