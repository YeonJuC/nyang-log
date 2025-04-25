import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

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


const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
      <header className="w-full bg-white shadow h-16 flex items-center justify-center relative z-30 px-4 pt-[env(safe-area-inset-top, 24px)]">
        <button
          onClick={() => setOpen(!open)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2"
        >
          <Menu className="w-6 h-6" style={{ color: '#3958bd' }} />
        </button>
        {/* <Link to="/" onClick={() => setOpen(false)}>
          <h1 className="text-2xl font-jua tracking-tight flex items-center gap-2">
            <img src={logoIcon} alt="로고" className="w-6 h-6" />
            <span className="text-[#3958bd]">혼냥일기</span>
          </h1>
        </Link> */}
        
        <Link to="/" onClick={() => setOpen(false)}>
          <img src={logoIcon} alt="혼냥일기 로고" className="w-8 h-8" />
        </Link>

        {open && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-10" onClick={() => setOpen(false)}></div>
            <div className="absolute top-full left-6 mt-2 w-40 bg-white shadow-xl rounded-xl p-2 z-20 flex flex-col items-start divide-y divide-gray-200">
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